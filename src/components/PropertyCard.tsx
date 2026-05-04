import { useState, useRef, useMemo, useEffect, forwardRef } from "react";
import { MapPin, BedDouble, Bath, Maximize, X, Send, Loader2, MessageSquare, Eye, Sparkles, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ExternalProperty } from "@/hooks/useExternalProperties";
import type { TablesInsert } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { trackLead, trackInitiateContact } from "@/lib/metaPixel";
import { getUtmSource } from "@/lib/utm";
import { isDisposableEmail, checkSessionLimit, incrementSessionCount, createInteractionTracker, containsSpamPatterns, checkCooldown, markSubmission } from "@/lib/antispam";
import { propertyUrl } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { createLocalLead, syncLeadStatusToCRM } from "@/lib/leads";
import property1 from "@/assets/property-1.webp";
import { usePersonalization } from "@/hooks/usePersonalization";
import { getIntentSummaryPayload, propertyMatchesIntent } from "@/lib/personalization";


const formatPrice = (v: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);

const TYPE_LABELS: Record<string, string> = {
  piso: "Piso", casa: "Casa", villa: "Villa", atico: "Ático",
  duplex: "Dúplex", chalet: "Chalet", estudio: "Estudio", local: "Local", otro: "Otro",
};

// ─── Mini inline lead form ────────────────────────────────────────────────────
const MiniLeadForm = forwardRef<HTMLDivElement, {
  propertyId: string;
  propertyTitle: string;
  propertyData?: {
    price?: number;
    property_type?: string;
    city?: string;
    bedrooms?: number;
    bathrooms?: number;
    area_m2?: number;
    operation?: string;
    has_pool?: boolean;
    has_garage?: boolean;
  };
  onClose: () => void;
}>(({ propertyId, propertyTitle, propertyData, onClose }, ref) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const mountedAt = useRef(Date.now());
  const interactionRef = useRef(createInteractionTracker());
  const FORM_ID = `mini-lead-${propertyId}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    if (honeypot) return;

    if (Date.now() - mountedAt.current < 2000) return;
    if (!interactionRef.current.hasEnoughInteraction()) return;
    if (isDisposableEmail(email)) {
      toast({ title: "Email no válido", description: "Usa un email permanente.", variant: "destructive" });
      return;
    }
    if (containsSpamPatterns(name)) {
      toast({ title: "Datos no válidos", description: "Revisa los campos.", variant: "destructive" });
      return;
    }
    if (checkCooldown(FORM_ID, email)) {
      toast({ title: "Demasiadas solicitudes", description: "Espera unos minutos.", variant: "destructive" });
      return;
    }
    if (checkSessionLimit()) {
      toast({ title: "Demasiadas solicitudes", description: "Inténtalo más tarde.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const utmSource = getUtmSource();
      const gdprTimestamp = new Date().toISOString();

      const localLead: TablesInsert<"leads"> = {
        name,
        email: email.trim().toLowerCase(),
        phone: phone || null,
        property_id: propertyId === "general" ? null : propertyId,
        property_title: propertyTitle,
        source: utmSource,
        message: `Solicitud rápida desde catálogo: ${propertyTitle}`,
        metadata: getIntentSummaryPayload(),
        gdpr_accepted_at: gdprTimestamp,
      };
      const insertedLead = await createLocalLead(localLead);

      incrementSessionCount();
      markSubmission(FORM_ID);

      await syncLeadStatusToCRM(insertedLead.id, {
        full_name: name,
        email,
        phone: phone || undefined,
        property_id: propertyId,
        gdpr_consent: true,
        gdpr_timestamp: gdprTimestamp,
        metadata: getIntentSummaryPayload(),
      });

      supabase.functions.invoke("notify-lead", {
        body: { name, email, phone, property_title: propertyTitle, metadata: getIntentSummaryPayload() },
      }).catch(() => {});

      trackLead({
        content_name: propertyTitle,
        email,
        phone,
        name,
        property_id: propertyId,
        source: utmSource || "direct",
        value: propertyData?.price,
        property_type: propertyData?.property_type,
        city: propertyData?.city,
        bedrooms: propertyData?.bedrooms,
        bathrooms: propertyData?.bathrooms,
        area_m2: propertyData?.area_m2,
        operation: propertyData?.operation,
        has_pool: propertyData?.has_pool,
        has_garage: propertyData?.has_garage,
      });

      setDone(true);
    } catch {
      toast({ title: "Error", description: "No se pudo enviar. Inténtalo de nuevo.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-4 text-center">
        <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground font-bold text-lg">✓</div>
        <p className="text-foreground font-semibold text-sm">¡Solicitud enviada!</p>
        <p className="text-muted-foreground text-xs">Un asesor te contactará en menos de 24h.</p>
        <Button size="sm" variant="ghost" onClick={onClose} className="text-xs mt-1">Cerrar</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5" onClick={(e) => e.stopPropagation()}>
      {/* Honeypot: invisible to humans, filled by bots */}
      <input type="text" name="website_url" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", opacity: 0 }} aria-hidden="true" />
      <p className="text-foreground font-semibold text-sm leading-snug line-clamp-1 mb-1">{propertyTitle}</p>
      <Input
        placeholder="Tu nombre *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onFocus={() => interactionRef.current.onFieldFocus("name")}
        required
        className="h-8 text-xs bg-background/60 border-border/60"
      />
      <Input
        type="email"
        placeholder="Tu email *"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onFocus={() => { interactionRef.current.onFieldFocus("email"); trackInitiateContact({ content_name: propertyTitle }); }}
        required
        className="h-8 text-xs bg-background/60 border-border/60"
      />
      <Input
        type="tel"
        placeholder="Teléfono *"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        onFocus={() => interactionRef.current.onFieldFocus("phone")}
        required
        className="h-8 text-xs bg-background/60 border-border/60"
      />
      <div className="flex items-start gap-1.5">
        <Checkbox id={`gdpr-${propertyId}`} checked={gdprAccepted} onCheckedChange={(c) => setGdprAccepted(c === true)} className="mt-0.5 h-3.5 w-3.5" />
        <label htmlFor={`gdpr-${propertyId}`} className="text-muted-foreground text-[10px] leading-snug cursor-pointer">
          Acepto la{" "}
          <a href="/privacidad" target="_blank" className="text-primary underline">política de privacidad</a>
        </label>
      </div>
      <Button
        type="submit"
        disabled={loading || !gdprAccepted}
        size="sm"
        className="w-full bg-gradient-gold text-primary-foreground font-semibold text-xs h-8 hover:opacity-90"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Send className="w-3 h-3 mr-1" />}
        Enviar solicitud
      </Button>
    </form>
  );
});
MiniLeadForm.displayName = "MiniLeadForm";

// ─── PropertyCard ─────────────────────────────────────────────────────────────
const PropertyCard = ({ property, index = 0 }: { property: ExternalProperty; index?: number }) => {
  const [showForm, setShowForm] = useState(false);
  const { profile, intentStage } = usePersonalization();
  const imageUrl = property.images?.[0] ?? property1;
  const matchesIntent = propertyMatchesIntent(profile, property);
  const primaryCtaLabel =
    intentStage === "late" ? "Ver ficha y decidir" : "Ver ficha completa";
  const secondaryCtaLabel =
    intentStage === "late" ? "Consultar esta" : "Me interesa";

  // Urgency: "Nuevo" badge for properties created < 7 days ago
  const isNew = useMemo(() => {
    if (!property.created_at) return false;
    const created = new Date(property.created_at).getTime();
    return Date.now() - created < 7 * 24 * 60 * 60 * 1000;
  }, [property.created_at]);

  const isInternational = useMemo(() => {
    // Prefer DB computed field, fallback to client-side check
    if (property.is_international != null) return property.is_international;
    const c = (property.country || "España").trim().toLowerCase();
    return c !== "españa" && c !== "spain" && c !== "es";
  }, [property.is_international, property.country]);

  // Social proof: "X personas viendo" — changes every 30s
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);
  const viewingCount = useMemo(() => {
    let hash = 0;
    const seed = property.id + tick;
    for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
    return 2 + (Math.abs(hash) % 5); // 2-6
  }, [property.id, tick]);

  return (
    <div className="group relative reveal-up" style={{ animationDelay: `${index * 80}ms` }}>
      {/* Card wrapper — not a link when form is open */}
      <div className="rounded-2xl overflow-hidden border border-border/30 bg-card transition-all duration-500 group-hover:border-primary/25 group-hover:shadow-xl group-hover:shadow-primary/5 group-hover:-translate-y-1">

        {/* Image */}
        <Link
          to={propertyUrl(property)}
          className="block relative overflow-hidden"
          tabIndex={showForm ? -1 : 0}
          onClick={(e) => showForm && e.preventDefault()}
        >
          <div className="watermark-full">
            <img
              src={imageUrl}
              alt={property.title}
              className="w-full h-56 object-cover object-center transition-transform duration-700 group-hover:scale-105"
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          </div>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent pointer-events-none" />

          {/* Type badge */}
          <span className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm border border-white/10 text-white text-[10px] font-bold tracking-[0.12em] uppercase px-2.5 py-1 rounded-full">
            {TYPE_LABELS[property.property_type] || property.property_type}
          </span>

          {/* New badge */}
          {isNew && (
            <span className="absolute top-3 right-3 bg-green-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Nuevo
            </span>
          )}

          {/* International badge */}
          {isInternational && !isNew && (
            <span className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider flex items-center gap-1">
              <Globe className="w-3 h-3" /> Internacional
            </span>
          )}

          {/* Featured badge */}
          {property.is_featured && !isNew && !isInternational && (
            <span className="absolute top-3 right-3 bg-gradient-gold text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider">
              ★ Destacado
            </span>
          )}

          {/* Viewing count */}
          <span className="absolute top-12 right-3 bg-black/50 backdrop-blur-sm border border-white/10 text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
            <Eye className="w-3 h-3" /> {viewingCount} viendo ahora
          </span>

          {matchesIntent && (
            <span className="absolute bottom-14 left-4 bg-white/92 backdrop-blur-sm text-foreground text-[10px] font-semibold px-2.5 py-1 rounded-full border border-white/70">
              Buen encaje con tu busqueda
            </span>
          )}

          {/* Sold / Reserved overlay */}
          {property.status !== "disponible" && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-serif text-xl font-bold uppercase tracking-widest">
                {property.status === "reservado" ? "Reservado" : "Vendido"}
              </span>
            </div>
          )}

          {/* Price badge — prominent, bottom of image */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 flex items-end justify-between">
            <div>
              <p className="text-white text-xl font-bold font-serif drop-shadow-lg">
                {formatPrice(property.price)}
              </p>
              {(property.area_m2 || property.surface_area) ? (
                <p className="text-white/70 text-xs mt-0.5">
                  {Math.round(property.price / (property.area_m2 || property.surface_area || 1)).toLocaleString("es-ES")} €/m²
                </p>
              ) : null}
            </div>
          </div>
        </Link>

        {/* Body */}
        <div className="p-4 space-y-3" data-protected>
          <Link to={propertyUrl(property)} tabIndex={showForm ? -1 : 0}>
            <h3 className="font-serif text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-snug">
              {property.title}
            </h3>
          </Link>

          <div className="flex items-center gap-1 text-muted-foreground text-xs min-w-0">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="line-clamp-1">{property.location}</span>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-muted-foreground text-xs pt-2 border-t border-border/50">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {property.bedrooms} hab.</span>
            )}
            {property.bathrooms > 0 && (
              <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {property.bathrooms} baños</span>
            )}
            {(property.area_m2 || property.surface_area) ? (
              <span className="flex items-center gap-1 sm:ml-auto"><Maximize className="w-3.5 h-3.5" /> {property.area_m2 || property.surface_area} m²</span>
            ) : null}
          </div>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <Link to={propertyUrl(property)} className="flex-1" tabIndex={showForm ? -1 : 0}>
              <Button
                size="sm"
                className="w-full bg-gradient-gold text-primary-foreground text-xs font-semibold h-8 hover:opacity-90"
              >
                {primaryCtaLabel}
              </Button>
            </Link>
            {property.status === "disponible" && (
              <Button
                size="sm"
                onClick={(e) => { e.preventDefault(); setShowForm((v) => !v); }}
                variant="outline"
                className="flex-1 border-border/60 hover:border-primary/40 text-xs font-semibold h-8"
              >
                <MessageSquare className="w-3 h-3 mr-1" />
                {secondaryCtaLabel}
              </Button>
            )}
          </div>

          {/* Inline mini form */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-out ${
              showForm ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
                <div className="pt-3 border-t border-border/40 relative">
                  <button
                    onClick={() => setShowForm(false)}
                    className="absolute top-4 right-0 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Cerrar formulario"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <MiniLeadForm
                    propertyId={property.id}
                    propertyTitle={property.title}
                    propertyData={{
                      price: property.price,
                      property_type: property.property_type,
                      city: property.city ?? undefined,
                      bedrooms: property.bedrooms,
                      bathrooms: property.bathrooms,
                      area_m2: property.area_m2,
                      operation: property.operation ?? undefined,
                      has_pool: property.has_pool ?? undefined,
                      has_garage: property.has_garage ?? undefined,
                    }}
                    onClose={() => setShowForm(false)}
                  />
                </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
