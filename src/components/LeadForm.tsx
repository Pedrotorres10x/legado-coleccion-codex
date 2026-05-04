import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/LanguageContext";
import { Send, Loader2 } from "lucide-react";
import { trackInitiateContact } from "@/lib/metaPixel";
import { Link } from "react-router-dom";
import { getUtmSource } from "@/lib/utm";
import {
  isDisposableEmail,
  isValidEmail,
  checkSessionLimit,
  incrementSessionCount,
  checkCooldown,
  markSubmission,
  createInteractionTracker,
  sanitizeField,
  containsSpamPatterns,
} from "@/lib/antispam";
import { createLocalLead, syncLeadStatusToCRM } from "@/lib/leads";
import { getIntentSummaryPayload } from "@/lib/personalization";

interface LeadFormProps {
  propertyId: string;
  propertyTitle?: string;
  introTitle?: string;
  introDescription?: string;
  messagePlaceholder?: string;
  submitLabel?: string;
  /** Extra property context for enriched Meta tracking */
  propertyPrice?: number;
  propertyType?: string;
  propertyCity?: string;
  propertyBedrooms?: number;
  propertyBathrooms?: number;
  propertyArea?: number;
  propertyOperation?: string;
  propertyHasPool?: boolean;
  propertyHasGarage?: boolean;
}

const MIN_SUBMIT_MS = 3000;
const FORM_ID = "lead";

const LeadForm = ({
  propertyId, propertyTitle, introTitle, introDescription, messagePlaceholder, submitLabel, propertyPrice, propertyType, propertyCity,
  propertyBedrooms, propertyBathrooms, propertyArea, propertyOperation,
  propertyHasPool, propertyHasGarage,
}: LeadFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [honeypot, setHoneypot] = useState("");
  const [newsletter, setNewsletter] = useState(true);
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [contactTracked, setContactTracked] = useState(false);
  const mountedAt = useRef(Date.now());
  const interactionRef = useRef(createInteractionTracker());

  const handleFieldChange = (field: string, value: string) => {
    const sanitized = sanitizeField(field, value);
    setForm((prev) => ({ ...prev, [field]: sanitized }));
    if (!contactTracked && sanitized.length > 0) {
      trackInitiateContact({ content_name: propertyTitle || propertyId });
      setContactTracked(true);
    }
  };

  const handleFieldFocus = (field: string) => {
    interactionRef.current.onFieldFocus(field);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return;

    // Antispam: honeypot
    if (honeypot) {
      console.warn("Spam detected (honeypot)");
      navigate("/gracias");
      return;
    }

    // Antispam: minimum time
    if (Date.now() - mountedAt.current < MIN_SUBMIT_MS) {
      console.warn("Spam detected (too fast)");
      navigate("/gracias");
      return;
    }

    // Antispam: bot interaction check
    if (!interactionRef.current.hasEnoughInteraction()) {
      console.warn("Spam detected (no interaction)");
      navigate("/gracias");
      return;
    }

    // Antispam: email format
    if (!isValidEmail(form.email)) {
      toast({ title: "Email no válido", description: "Introduce un email correcto.", variant: "destructive" });
      return;
    }

    // Antispam: disposable email
    if (isDisposableEmail(form.email)) {
      toast({ title: "Email no válido", description: "Por favor, usa un email permanente.", variant: "destructive" });
      return;
    }

    // Antispam: spam content patterns
    if (containsSpamPatterns(form.message) || containsSpamPatterns(form.name)) {
      console.warn("Spam detected (patterns)");
      navigate("/gracias");
      return;
    }

    // Antispam: cooldown between submissions
    if (checkCooldown(FORM_ID)) {
      toast({ title: "Espera un momento", description: "Por favor, espera unos segundos antes de enviar otra solicitud.", variant: "destructive" });
      return;
    }

    // Antispam: session limit (skip for test email)
    const isTestEmail = form.email.trim().toLowerCase() === "pedro@pedrotorres10x.es";
    if (!isTestEmail && checkSessionLimit()) {
      toast({ title: "Demasiadas solicitudes", description: "Has alcanzado el límite de envíos. Inténtalo más tarde.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const utmSource = getUtmSource();
      const normalizedPropertyId = propertyId === "general" ? null : propertyId;

      const gdprTimestamp = new Date().toISOString();
      const localLead: TablesInsert<"leads"> = {
        name: sanitizeField("name", form.name),
        email: form.email.trim().toLowerCase(),
        phone: form.phone || null,
        message: form.message || null,
        metadata: getIntentSummaryPayload(),
        property_id: normalizedPropertyId,
        property_title: propertyTitle || null,
        source: utmSource,
        gdpr_accepted_at: gdprTimestamp,
      };

      let insertedLeadId: string | undefined;
      try {
        const insertedLead = await createLocalLead(localLead);
        insertedLeadId = insertedLead.id;
      } catch (error) {
        if (error instanceof Error && error.message.includes("rate limit")) {
          toast({ title: "Demasiadas solicitudes", description: "Por favor, espera unos minutos antes de enviar otra consulta.", variant: "destructive" });
          setLoading(false);
          return;
        }
        throw error;
      }

      incrementSessionCount();
      markSubmission(FORM_ID);

      await syncLeadStatusToCRM(insertedLeadId, {
        full_name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        message: form.message || undefined,
        property_id: normalizedPropertyId,
        gdpr_consent: true,
        gdpr_timestamp: gdprTimestamp,
        metadata: getIntentSummaryPayload(),
      });

      supabase.functions.invoke("notify-lead", {
        body: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          message: form.message,
          property_title: propertyTitle,
          metadata: getIntentSummaryPayload(),
        },
      }).catch(() => {});

      if (newsletter) {
        await supabase.from("newsletter_subscribers").insert({
          email: form.email.trim().toLowerCase(),
          name: form.name,
          language,
          source: "contact-form",
        }).then(() => {});

        supabase.functions.invoke("brevo-manager", {
          body: { action: "add_contact", email: form.email.trim().toLowerCase(), name: form.name, language, source: "contact-form" },
        }).catch(() => {});
      }

      navigate("/gracias", {
        state: {
          leadData: {
            content_name: propertyTitle || propertyId,
            email: form.email,
            phone: form.phone,
            name: form.name,
            property_id: propertyId,
            source: utmSource || "direct",
            value: propertyPrice,
            property_type: propertyType,
            city: propertyCity,
            bedrooms: propertyBedrooms,
            bathrooms: propertyBathrooms,
            area_m2: propertyArea,
            operation: propertyOperation,
            has_pool: propertyHasPool,
            has_garage: propertyHasGarage,
          },
        },
      });
    } catch {
      toast({ title: "Error", description: "No se pudo enviar tu solicitud. Inténtalo de nuevo.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-serif text-lg font-semibold text-foreground">
          {introTitle || "Cuéntanos qué buscas"}
        </h3>
        <p className="text-xs leading-6 text-muted-foreground">
          {introDescription || "Cuanto más claro tengamos el encaje con esta vivienda o con tu búsqueda, mejor podremos responderte con el siguiente paso útil."}
        </p>
      </div>

      {/* Honeypot */}
      <div className="absolute opacity-0 pointer-events-none h-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
        <Input type="text" name="website_url" autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} />
      </div>

      <Input
        placeholder="Nombre completo *"
        value={form.name}
        onChange={(e) => handleFieldChange("name", e.target.value)}
        onFocus={() => handleFieldFocus("name")}
        required
        maxLength={100}
        className="bg-background border-border"
      />
      <Input
        type="email"
        placeholder="Email *"
        value={form.email}
        onChange={(e) => handleFieldChange("email", e.target.value)}
        onFocus={() => handleFieldFocus("email")}
        required
        maxLength={255}
        className="bg-background border-border"
      />
      <Input
        type="tel"
        placeholder="Teléfono *"
        value={form.phone}
        onChange={(e) => handleFieldChange("phone", e.target.value)}
        onFocus={() => handleFieldFocus("phone")}
        required
        maxLength={30}
        className="bg-background border-border"
      />
      <Textarea
        placeholder={messagePlaceholder || "Mensaje (opcional)"}
        value={form.message}
        onChange={(e) => handleFieldChange("message", e.target.value)}
        onFocus={() => handleFieldFocus("message")}
        rows={3}
        maxLength={2000}
        className="bg-background border-border resize-none"
      />
      <div className="flex items-start gap-2">
        <Checkbox id="gdpr" checked={gdprAccepted} onCheckedChange={(checked) => setGdprAccepted(checked === true)} />
        <label htmlFor="gdpr" className="text-muted-foreground text-xs cursor-pointer leading-snug">
          Acepto la{" "}
          <Link to="/privacidad" target="_blank" className="text-primary underline hover:text-primary/80">
            política de privacidad
          </Link>{" "}
          y el tratamiento de mis datos para gestionar mi consulta.
        </label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="newsletter" checked={newsletter} onCheckedChange={(checked) => setNewsletter(checked === true)} />
        <label htmlFor="newsletter" className="text-muted-foreground text-xs cursor-pointer">
          {t("newsletter.consent")}
        </label>
      </div>
      <Button type="submit" disabled={loading || !gdprAccepted} className="w-full bg-gradient-gold text-primary-foreground font-semibold hover:opacity-90">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
        {submitLabel || "Enviar interés"}
      </Button>
    </form>
  );
};

export default LeadForm;
