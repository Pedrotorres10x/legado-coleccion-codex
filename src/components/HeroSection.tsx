import { useState, useEffect } from "react";
import { ArrowRight, Trophy, Globe, Zap, Users, Home, Clock, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.webp";
import { Language, useTranslation } from "@/contexts/LanguageContext";
import { usePersonalization } from "@/hooks/usePersonalization";
import { getAreaRouteMeta, getTopAreaSlug, getTopTopic, getTopicGuideMeta } from "@/lib/personalization";

const HeroSection = () => {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const [spIdx, setSpIdx] = useState(0);
  const { hasSignal, profile } = usePersonalization();

  const socialProofByLanguage: Record<Language, Array<{ icon: typeof Users; stat: string; label: string }>> = {
    es: [
      { icon: Users, stat: "+1.500", label: "familias asesoradas" },
      { icon: Clock, stat: "+15", label: "anos en el sector" },
      { icon: Home, stat: "+900", label: "propiedades disponibles" },
      { icon: Building2, stat: "Nº1", label: "catalogo de obra nueva" },
      { icon: Globe, stat: "🌍", label: "destinos exclusivos" },
    ],
    en: [
      { icon: Users, stat: "+1,500", label: "families advised" },
      { icon: Clock, stat: "+15", label: "years in the sector" },
      { icon: Home, stat: "+900", label: "homes available" },
      { icon: Building2, stat: "No.1", label: "new-build catalogue" },
      { icon: Globe, stat: "🌍", label: "exclusive destinations" },
    ],
    fr: [
      { icon: Users, stat: "+1 500", label: "familles accompagnees" },
      { icon: Clock, stat: "+15", label: "ans d'experience" },
      { icon: Home, stat: "+900", label: "biens disponibles" },
      { icon: Building2, stat: "Nº1", label: "catalogue neuf" },
      { icon: Globe, stat: "🌍", label: "destinations exclusives" },
    ],
    de: [
      { icon: Users, stat: "+1.500", label: "begleitete Familien" },
      { icon: Clock, stat: "+15", label: "Jahre Erfahrung" },
      { icon: Home, stat: "+900", label: "verfuegbare Immobilien" },
      { icon: Building2, stat: "Nr.1", label: "Neubau-Katalog" },
      { icon: Globe, stat: "🌍", label: "exklusive Standorte" },
    ],
  };

  const heroCopyByLanguage: Record<
    Language,
    {
      personalizedKickerRecent: string;
      personalizedKickerTopic: string;
      personalizedRecent: (city?: string) => string;
      personalizedArea: (label: string) => string;
      personalizedTopic: (label: string) => string;
      primaryRecent: string;
      primaryDefault: string;
      supporting: string;
      backToCatalog: string;
      statAria: string;
      heroImageAlt: string;
    }
  > = {
    es: {
      personalizedKickerRecent: "Tu busqueda ya tiene contexto",
      personalizedKickerTopic: "Seguimos por tu interes real",
      personalizedRecent: (city) => `Ya has abierto viviendas concretas. Retoma esa ficha o vuelve a ${city || "tu zona"} para seguir comparando propiedades reales antes de enviar tu consulta.`,
      personalizedArea: (label) => `Ya tenemos senales utiles de tu interes en ${label}. En vez de devolverte a una portada generica, te llevamos de vuelta a viviendas reales para que sigas avanzando con confianza.`,
      personalizedTopic: (label) => `Has mostrado interes en ${label.toLowerCase()}. Podemos respetar esa intencion y ayudarte a volver a propiedades concretas sin perderte en una interfaz generica.`,
      primaryRecent: "Retomar ultima ficha",
      primaryDefault: "Ver propiedades",
      supporting: "Abre fichas completas, revisa fotos y detalles reales, y consulta solo por las viviendas que de verdad encajen contigo.",
      backToCatalog: "O volver al catalogo completo",
      statAria: "Ir a estadistica",
      heroImageAlt: "Villa de lujo con piscina infinita y vistas al mar en la Costa Blanca",
    },
    en: {
      personalizedKickerRecent: "Your search already has context",
      personalizedKickerTopic: "Let's continue from your real interest",
      personalizedRecent: (city) => `You've already opened real listings. Pick up that property again or go back to ${city || "your area"} to keep comparing genuine options before enquiring.`,
      personalizedArea: (label) => `We already have useful signals around your interest in ${label}. Rather than sending you back to a generic homepage, we take you straight to real homes so you can keep moving forward.`,
      personalizedTopic: (label) => `You've shown interest in ${label.toLowerCase()}. We can respect that intent and guide you back to concrete properties instead of a generic interface.`,
      primaryRecent: "Resume last listing",
      primaryDefault: "Browse properties",
      supporting: "Open full listings, review real photos and details, and enquire only about the homes that genuinely fit.",
      backToCatalog: "Or return to the full catalogue",
      statAria: "Go to statistic",
      heroImageAlt: "Luxury villa with infinity pool and sea views on the Costa Blanca",
    },
    fr: {
      personalizedKickerRecent: "Votre recherche a deja du contexte",
      personalizedKickerTopic: "On repart de votre vrai interet",
      personalizedRecent: (city) => `Vous avez deja consulte des biens concrets. Reprenez cette fiche ou revenez vers ${city || "votre secteur"} pour comparer des options reelles avant de nous contacter.`,
      personalizedArea: (label) => `Nous avons deja des signaux utiles autour de votre interet pour ${label}. Plutot que de vous renvoyer vers une page d'accueil generique, nous vous ramenons vers de vrais biens pour avancer sereinement.`,
      personalizedTopic: (label) => `Vous avez montre un interet pour ${label.toLowerCase()}. Nous pouvons respecter cette intention et vous ramener vers des biens concrets sans vous perdre dans une interface generique.`,
      primaryRecent: "Reprendre la derniere fiche",
      primaryDefault: "Voir les biens",
      supporting: "Ouvrez les fiches completes, verifiez les photos et les details reels, puis contactez-nous uniquement pour les biens qui vous correspondent vraiment.",
      backToCatalog: "Ou revenir au catalogue complet",
      statAria: "Aller a la statistique",
      heroImageAlt: "Villa de luxe avec piscine a debordement et vue mer sur la Costa Blanca",
    },
    de: {
      personalizedKickerRecent: "Ihre Suche hat bereits Kontext",
      personalizedKickerTopic: "Wir machen bei Ihrem echten Interesse weiter",
      personalizedRecent: (city) => `Sie haben bereits konkrete Immobilien geoeffnet. Kehren Sie zu diesem Expose zurueck oder gehen Sie wieder nach ${city || "Ihrer Region"}, um echte Optionen weiter zu vergleichen, bevor Sie anfragen.`,
      personalizedArea: (label) => `Wir haben bereits klare Signale fuer Ihr Interesse an ${label}. Statt Sie auf eine generische Startseite zurueckzuschicken, bringen wir Sie direkt zu echten Immobilien, damit Sie sicher weitergehen koennen.`,
      personalizedTopic: (label) => `Sie haben Interesse an ${label.toLowerCase()} gezeigt. Wir koennen diese Absicht aufnehmen und Sie zu konkreten Immobilien zurueckfuehren statt zu einer generischen Oberflaeche.`,
      primaryRecent: "Letztes Expose wieder oeffnen",
      primaryDefault: "Immobilien ansehen",
      supporting: "Oeffnen Sie vollstaendige Exposes, pruefen Sie echte Fotos und Details und fragen Sie nur bei den Immobilien an, die wirklich passen.",
      backToCatalog: "Oder zum gesamten Katalog zurueck",
      statAria: "Zur Statistik wechseln",
      heroImageAlt: "Luxusvilla mit Infinity-Pool und Meerblick an der Costa Blanca",
    },
  };
  const ui = heroCopyByLanguage[language];
  const socialProof = socialProofByLanguage[language];

  const recentProperty = profile.recentProperties[0];
  const topArea = getAreaRouteMeta(getTopAreaSlug(profile));
  const topTopic = getTopicGuideMeta(getTopTopic(profile));

  const personalizedKicker = recentProperty
    ? ui.personalizedKickerRecent
    : topArea
      ? `Seguimos por ${topArea.label}`
      : topTopic
        ? ui.personalizedKickerTopic
        : null;

  const personalizedDescription = recentProperty
    ? ui.personalizedRecent(recentProperty.city)
    : topArea
      ? ui.personalizedArea(topArea.label)
      : topTopic
        ? ui.personalizedTopic(topTopic.label)
        : t("hero.desc");

  const primaryCta = recentProperty
    ? { label: ui.primaryRecent, href: recentProperty.href }
    : topArea
      ? { label: `Seguir por ${topArea.label}`, href: `${topArea.href}#live-inventory` }
      : { label: ui.primaryDefault, href: "/propiedades" };

  const secondaryHref = "/propiedades";

  useEffect(() => {
    const id = setInterval(() => setSpIdx(i => (i + 1) % socialProof.length), 3500);
    return () => clearInterval(id);
  }, [socialProof.length]);

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      {/* Background with Ken Burns */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt={ui.heroImageAlt}
          className="w-full h-full object-cover object-center animate-hero-kenburns"
          fetchPriority="high"
          decoding="async"
        />

        {/* Overlay suave — la foto protagoniza, el texto se lee */}
        <div className="absolute inset-0 bg-[hsl(214_45%_8%/0.22)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(214_45%_8%/0.05)] via-[hsl(214_45%_8%/0.30)] to-[hsl(214_45%_8%/0.45)]" />
        {/* Degradado hacia la sección siguiente */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="relative z-10 container px-4 py-20 sm:py-28 flex flex-col items-center text-center gap-4 sm:gap-6">

        {/* Tagline */}
        <div className="flex max-w-full items-center justify-center gap-2 sm:gap-3 enter-fade-up" style={{ animationDelay: "80ms" }}>
          <span className="hidden sm:block w-8 h-px bg-[hsl(38_72%_44%/0.6)]" />
          <p className="max-w-full text-white/70 font-medium tracking-[0.18em] sm:tracking-[0.3em] uppercase text-[10px] sm:text-xs break-words">
            {t("hero.tagline")}
          </p>
          <span className="hidden sm:block w-8 h-px bg-[hsl(38_72%_44%/0.6)]" />
        </div>

        {hasSignal && personalizedKicker ? (
          <div
            className="max-w-full rounded-2xl sm:rounded-full border border-white/25 bg-white/12 px-4 py-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] sm:tracking-[0.24em] text-white/85 backdrop-blur-sm enter-fade-up"
            style={{ animationDelay: "120ms" }}
          >
            {personalizedKicker}
          </div>
        ) : null}

        {/* Title */}
        <h1
          className="font-serif text-[clamp(1.75rem,5vw,4.8rem)] md:text-[clamp(2.8rem,5vw,4.8rem)] lg:text-[clamp(3.6rem,6vw,5.8rem)] font-bold leading-[1.04] sm:leading-[1.08] break-words"
          lang="es"
          style={{ animationDelay: "180ms" }}
        >
          <span className="text-white drop-shadow-lg">
            {t("hero.title1")}
          </span>
          <br />
          <span className="text-white/90 italic drop-shadow-lg">{t("hero.title2")}</span>
        </h1>

        {/* Description */}
        <p className="text-white/85 text-[15px] sm:text-lg max-w-[520px] leading-7 sm:leading-relaxed drop-shadow enter-fade-up" style={{ animationDelay: "320ms" }}>
          {personalizedDescription}
        </p>

        {/* Social proof rotativo */}
        <div className="flex max-w-full flex-col items-center justify-center gap-2 sm:gap-3 sm:flex-row min-h-[44px] enter-fade-up" style={{ animationDelay: "520ms" }}>
            <div key={spIdx} className="flex max-w-full items-center gap-2 sm:gap-3 bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl sm:rounded-full px-4 sm:px-5 py-2 sm:py-2.5 enter-fade-up">
              {(() => { const { icon: Icon, stat, label } = socialProof[spIdx]; return (<>
                <Icon className="w-4 h-4 text-white/80 shrink-0" />
                <span className="text-white font-bold text-sm sm:text-base tracking-tight shrink-0">{stat}</span>
                <span className="text-white/75 text-xs sm:text-sm break-words">{label}</span>
              </>); })()}
            </div>

          {/* Dots indicadores */}
          <div className="flex gap-1.5 sm:ml-1">
            {socialProof.map((_, i) => (
              <button
                key={i}
                onClick={() => setSpIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === spIdx ? "bg-white scale-125" : "bg-white/35"}`}
                aria-label={`${ui.statAria} ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* ═══ THE CTA ═══ */}
        <div className="flex flex-col items-center gap-2.5 mt-1 sm:mt-2 enter-fade-up" style={{ animationDelay: "620ms" }}>
          <div className="relative flex w-full items-center justify-center">
            <span className="absolute inset-0 rounded-2xl animate-gold-pulse pointer-events-none" />

            <button
              onClick={() => navigate(primaryCta.href)}
              className="
                relative overflow-hidden
                inline-flex w-full sm:w-auto items-center justify-center gap-3
                bg-gradient-gold text-white
                font-bold
                px-6 sm:px-14 py-3.5 sm:py-5 rounded-2xl
                shadow-[0_6px_32px_hsl(38_70%_38%/0.45),0_2px_12px_hsl(214_35%_14%/0.15)]
                hover:shadow-[0_10px_50px_hsl(38_70%_38%/0.65)]
                hover:scale-[1.02] sm:hover:scale-[1.035]
                active:scale-[0.975]
                transition-all duration-300 ease-out
                group
              "
            >
              {/* Shimmer sweep */}
              <span className="absolute inset-0 w-1/3 bg-white/20 animate-shimmer pointer-events-none" />
              <span className="relative flex items-center gap-3">
                <span className="text-[1.05rem] sm:text-2xl font-serif font-bold tracking-tight text-center break-words">{primaryCta.label}</span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1.5 transition-transform duration-300" />
              </span>
            </button>
          </div>

          <p className="max-w-xl px-2 text-white/72 text-[11px] sm:text-xs tracking-[0.02em] sm:tracking-wide enter-fade-in" style={{ animationDelay: "1100ms" }}>
            {ui.supporting}
          </p>
          {hasSignal && primaryCta.href !== secondaryHref ? (
            <button
              onClick={() => navigate(secondaryHref)}
              className="text-xs font-medium tracking-wide text-white/82 underline-offset-4 transition hover:text-white hover:underline"
            >
              {ui.backToCatalog}
            </button>
          ) : null}
        </div>

        {/* Trust bar — glassmorphism unificado */}
        <div className="mt-2 mx-auto w-full max-w-2xl rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md px-4 sm:px-6 py-3 shadow-sm enter-fade-in" style={{ animationDelay: "1000ms" }}>
          <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2 text-[11px] sm:text-xs text-white/90">
            {[
              { icon: Trophy, label: t("hero.trust1") },
              { icon: Globe, label: t("hero.trust2") },
              { icon: Zap, label: t("hero.trust3") },
            ].map(({ icon: Icon, label }, i) => (
              <span key={label} className="flex items-center gap-1.5">
                {i > 0 && <span className="w-px h-4 bg-white/20 mr-4 hidden sm:inline-block" />}
                <Icon className="w-3.5 h-3.5 text-[hsl(38_72%_65%)] shrink-0" />
                <span>{label}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator — azul marino para contrastar con fondo claro inferior */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 animate-floating-bob">
        <div className="w-5 h-9 border-2 border-white/35 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-2.5 bg-[hsl(38_72%_44%)] rounded-full animate-floating-bob" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
