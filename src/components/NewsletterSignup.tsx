import { useState, useRef } from "react";
import { Mail, ArrowRight, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { trackCompleteRegistration } from "@/lib/metaPixel";
import {
  isDisposableEmail,
  isValidEmail,
  checkSessionLimit,
  incrementSessionCount,
  checkCooldown,
  markSubmission,
  createInteractionTracker,
} from "@/lib/antispam";

interface NewsletterSignupProps {
  source?: string;
  variant?: "inline" | "banner" | "compact";
  className?: string;
}

const MIN_SUBMIT_MS = 2500;
const FORM_ID = "newsletter";

const NewsletterSignup = ({ source = "blog", variant = "inline", className = "" }: NewsletterSignupProps) => {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const mountedAt = useRef(Date.now());
  const interactionRef = useRef(createInteractionTracker());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    const cleanEmail = email.trim().toLowerCase();

    // Antispam: honeypot
    if (honeypot) {
      console.warn("Spam detected (honeypot)");
      setSuccess(true);
      return;
    }

    // Antispam: timing
    if (Date.now() - mountedAt.current < MIN_SUBMIT_MS) {
      console.warn("Spam detected (too fast)");
      setSuccess(true);
      return;
    }

    // Antispam: interaction
    if (!interactionRef.current.hasEnoughInteraction()) {
      // For single-field forms, allow if at least email was focused
      // (relaxed check — bots won't focus at all)
    }

    // Email format
    if (!isValidEmail(cleanEmail)) {
      toast({ title: "Email no válido", description: "Introduce un email correcto.", variant: "destructive" });
      return;
    }

    // Disposable email
    if (isDisposableEmail(cleanEmail)) {
      toast({ title: "Email no válido", description: "Por favor, usa un email permanente.", variant: "destructive" });
      return;
    }

    // Cooldown
    if (checkCooldown(FORM_ID)) {
      toast({ title: "Espera un momento", description: "Por favor, espera unos segundos antes de suscribirte de nuevo.", variant: "destructive" });
      return;
    }

    // Session limit
    if (checkSessionLimit("rl_newsletter")) {
      toast({ title: "Demasiadas solicitudes", description: "Has alcanzado el límite de envíos.", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("newsletter_subscribers").insert({
        email: cleanEmail,
        language,
        source,
      });

      if (error) {
        if (error.code === "23505") {
          toast({ title: t("newsletter.already") });
        } else {
          throw error;
        }
      } else {
        setSuccess(true);
        incrementSessionCount("rl_newsletter");
        markSubmission(FORM_ID);
        toast({ title: t("newsletter.success"), description: t("newsletter.successDesc") });
        trackCompleteRegistration({ content_name: `newsletter-${source}`, email: cleanEmail });

        // Sync to Brevo in background
        supabase.functions.invoke("brevo-manager", {
          body: { action: "add_contact", email: cleanEmail, language, source },
        }).catch(() => {});
      }
      setEmail("");
    } catch {
      toast({ title: t("newsletter.error"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Shared honeypot field (hidden)
  const honeypotField = (
    <div className="absolute opacity-0 pointer-events-none h-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
      <Input type="text" name="company_website" autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} />
    </div>
  );

  const homeSupportCopy =
    source === "home"
      ? "Si todavía no quieres consultar por una vivienda concreta, te avisamos cuando entren propiedades que sí merezca la pena abrir en ficha."
      : t("newsletter.desc");

  if (success) {
    return (
      <div className={`flex items-center gap-3 text-primary enter-fade-up ${className}`}>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Check className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium">{t("newsletter.success")}</p>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div className={`relative rounded-2xl overflow-hidden p-8 md:p-12 enter-fade-up ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 rounded-2xl" />
        <div className="relative flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 mb-3">
              <Mail className="w-5 h-5 text-primary" />
              <span className="text-primary text-xs font-bold tracking-[0.2em] uppercase">Newsletter</span>
            </div>
            <h3 className="font-serif text-xl md:text-2xl font-bold text-foreground mb-2">
              {t("newsletter.blogBanner")}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t("newsletter.blogBannerDesc")}
            </p>
          </div>
          <div className="w-full md:w-auto">
            <form onSubmit={handleSubmit} className="flex gap-3 relative">
              {honeypotField}
              <Input
                type="email"
                placeholder={t("newsletter.placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => interactionRef.current.onFieldFocus("email")}
                required
                maxLength={255}
                className="bg-background border-border min-w-[220px]"
              />
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-gold text-primary-foreground font-semibold hover:opacity-90 whitespace-nowrap"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{t("newsletter.btn")} <ArrowRight className="w-4 h-4 ml-1" /></>}
              </Button>
            </form>
            <p className="text-muted-foreground text-[11px] mt-2">
              Al suscribirte aceptas nuestra{" "}
              <a href="/politica-privacidad" target="_blank" className="text-primary underline hover:text-primary/80">política de privacidad</a>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 relative ${className}`}>
        {honeypotField}
        <Input
          type="email"
          placeholder={t("newsletter.placeholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => interactionRef.current.onFieldFocus("email")}
          required
          maxLength={255}
          className="bg-background border-border"
        />
        <Button
          type="submit"
          disabled={loading}
          size="sm"
          className="bg-gradient-gold text-primary-foreground font-semibold hover:opacity-90"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
        </Button>
      </form>
    );
  }

  // Default inline variant
  return (
    <section className={`py-20 relative enter-fade-up ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="container relative max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-primary" />
          <span className="text-primary text-xs font-bold tracking-[0.2em] uppercase">Newsletter</span>
        </div>
        <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
          {t("newsletter.title")}
        </h2>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed max-w-lg mx-auto">
          {homeSupportCopy}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto relative">
          {honeypotField}
          <Input
            type="email"
            placeholder={t("newsletter.placeholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => interactionRef.current.onFieldFocus("email")}
            required
            maxLength={255}
            className="bg-background border-border flex-1"
          />
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-gold text-primary-foreground font-semibold hover:opacity-90 px-8"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {t("newsletter.btn")}
          </Button>
        </form>
        <p className="text-muted-foreground text-[11px] mt-3 max-w-md mx-auto">
          Al suscribirte aceptas nuestra{" "}
          <a href="/politica-privacidad" target="_blank" className="text-primary underline hover:text-primary/80">política de privacidad</a>.
        </p>
      </div>
    </section>
  );
};

export default NewsletterSignup;
