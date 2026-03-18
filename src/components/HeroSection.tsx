import { useState, useEffect } from "react";
import { ArrowRight, Trophy, Globe, Zap, Users, Home, Clock, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import { useTranslation } from "@/contexts/LanguageContext";
import { usePersonalization } from "@/hooks/usePersonalization";
import { getAreaRouteMeta, getTopAreaSlug, getTopTopic, getTopicGuideMeta } from "@/lib/personalization";

const SOCIAL_PROOF = [
  { icon: Users,     stat: "+1.500",  label: "familias asesoradas" },
  { icon: Clock,     stat: "+15",     label: "años en el sector" },
  { icon: Home,      stat: "+900",    label: "propiedades disponibles" },
  { icon: Building2, stat: "Nº1",     label: "catálogo de obra nueva" },
  { icon: Globe,     stat: "🌍",      label: "propiedades en destinos exclusivos" },
];

const HeroSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [spIdx, setSpIdx] = useState(0);
  const { hasSignal, profile } = usePersonalization();

  const recentProperty = profile.recentProperties[0];
  const topArea = getAreaRouteMeta(getTopAreaSlug(profile));
  const topTopic = getTopicGuideMeta(getTopTopic(profile));

  const personalizedKicker = recentProperty
    ? "Tu búsqueda ya tiene contexto"
    : topArea
      ? `Seguimos por ${topArea.label}`
      : topTopic
        ? "Seguimos por tu interés real"
        : null;

  const personalizedDescription = recentProperty
    ? `Ya has abierto viviendas concretas. Retoma esa ficha o vuelve a ${recentProperty.city || "tu zona"} para seguir comparando propiedades reales antes de enviar tu consulta.`
    : topArea
      ? `Ya tenemos señales útiles de tu interés en ${topArea.label}. En vez de devolverte a una portada genérica, te llevamos de vuelta a viviendas reales para que sigas avanzando con confianza.`
      : topTopic
        ? `Has mostrado interés en ${topTopic.label.toLowerCase()}. Podemos respetar esa intención y ayudarte a volver a propiedades concretas sin perderte en una interfaz genérica.`
        : t("hero.desc");

  const primaryCta = recentProperty
    ? { label: "Retomar última ficha", href: recentProperty.href }
    : topArea
      ? { label: `Seguir por ${topArea.label}`, href: `${topArea.href}#live-inventory` }
      : { label: "Ver propiedades", href: "/propiedades" };

  const secondaryHref = "/propiedades";

  useEffect(() => {
    const id = setInterval(() => setSpIdx(i => (i + 1) % SOCIAL_PROOF.length), 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with Ken Burns */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Villa de lujo con piscina infinita y vistas al mar en la Costa Blanca"
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

      <div className="relative z-10 container px-4 py-28 flex flex-col items-center text-center gap-6">

        {/* Tagline */}
        <div className="flex items-center gap-3 enter-fade-up" style={{ animationDelay: "80ms" }}>
          <span className="w-8 h-px bg-[hsl(38_72%_44%/0.6)]" />
          <p className="text-white/70 font-medium tracking-[0.3em] uppercase text-[11px] sm:text-xs">
            {t("hero.tagline")}
          </p>
          <span className="w-8 h-px bg-[hsl(38_72%_44%/0.6)]" />
        </div>

        {hasSignal && personalizedKicker ? (
          <div
            className="rounded-full border border-white/25 bg-white/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/85 backdrop-blur-sm enter-fade-up"
            style={{ animationDelay: "120ms" }}
          >
            {personalizedKicker}
          </div>
        ) : null}

        {/* Title */}
        <h1
          className="font-serif text-[clamp(1.9rem,5.5vw,4.8rem)] md:text-[clamp(2.8rem,5vw,4.8rem)] lg:text-[clamp(3.6rem,6vw,5.8rem)] font-bold leading-[1.08] break-words"
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
        <p className="text-white/85 text-base sm:text-lg max-w-[520px] leading-relaxed drop-shadow enter-fade-up" style={{ animationDelay: "320ms" }}>
          {personalizedDescription}
        </p>

        {/* Social proof rotativo */}
        <div className="flex items-center justify-center gap-3 min-h-[44px] enter-fade-up" style={{ animationDelay: "520ms" }}>
            <div key={spIdx} className="flex items-center gap-3 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-5 py-2.5 enter-fade-up">
              {(() => { const { icon: Icon, stat, label } = SOCIAL_PROOF[spIdx]; return (<>
                <Icon className="w-4 h-4 text-white/80 shrink-0" />
                <span className="text-white font-bold text-base tracking-tight">{stat}</span>
                <span className="text-white/75 text-sm">{label}</span>
              </>); })()}
            </div>

          {/* Dots indicadores */}
          <div className="flex gap-1.5 ml-1">
            {SOCIAL_PROOF.map((_, i) => (
              <button
                key={i}
                onClick={() => setSpIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === spIdx ? "bg-white scale-125" : "bg-white/35"}`}
                aria-label={`Ir a estadística ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* ═══ THE CTA ═══ */}
        <div className="flex flex-col items-center gap-3 mt-2 enter-fade-up" style={{ animationDelay: "620ms" }}>
          <div className="relative flex items-center justify-center">
            <span className="absolute inset-0 rounded-2xl animate-gold-pulse pointer-events-none" />

            <button
              onClick={() => navigate(primaryCta.href)}
              className="
                relative overflow-hidden
                inline-flex items-center gap-3
                bg-gradient-gold text-white
                font-bold
                px-10 sm:px-14 py-5 rounded-2xl
                shadow-[0_6px_32px_hsl(38_70%_38%/0.45),0_2px_12px_hsl(214_35%_14%/0.15)]
                hover:shadow-[0_10px_50px_hsl(38_70%_38%/0.65)]
                hover:scale-[1.035]
                active:scale-[0.975]
                transition-all duration-300 ease-out
                group
              "
            >
              {/* Shimmer sweep */}
              <span className="absolute inset-0 w-1/3 bg-white/20 animate-shimmer pointer-events-none" />
              <span className="relative flex items-center gap-3">
                <span className="text-xl sm:text-2xl font-serif font-bold tracking-tight">{primaryCta.label}</span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1.5 transition-transform duration-300" />
              </span>
            </button>
          </div>

          <p className="max-w-xl text-white/72 text-xs tracking-wide enter-fade-in" style={{ animationDelay: "1100ms" }}>
            Abre fichas completas, revisa fotos y detalles reales, y consulta solo por las viviendas que de verdad encajen contigo.
          </p>
          {hasSignal && primaryCta.href !== secondaryHref ? (
            <button
              onClick={() => navigate(secondaryHref)}
              className="text-xs font-medium tracking-wide text-white/82 underline-offset-4 transition hover:text-white hover:underline"
            >
              O volver al catálogo completo
            </button>
          ) : null}
        </div>

        {/* Trust bar — glassmorphism unificado */}
        <div className="mt-2 mx-auto max-w-2xl rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md px-6 py-3 shadow-sm enter-fade-in" style={{ animationDelay: "1000ms" }}>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/90">
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
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-floating-bob">
        <div className="w-5 h-9 border-2 border-white/35 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-2.5 bg-[hsl(38_72%_44%)] rounded-full animate-floating-bob" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
