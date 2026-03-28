import { useState } from "react";
import { MapPin, MessageCircle, KeyRound, ChevronDown } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import teamPedro from "@/assets/team-pedro.webp";


const PILLARS = [
  { icon: MapPin, titleKey: "purpose.p1.title", descKey: "purpose.p1.desc" },
  { icon: MessageCircle, titleKey: "purpose.p2.title", descKey: "purpose.p2.desc" },
  { icon: KeyRound, titleKey: "purpose.p3.title", descKey: "purpose.p3.desc" },
];

const FOUNDER_BODY_KEYS = [
  "purpose.founder.body1",
  "purpose.founder.body2",
  "purpose.founder.body3",
  "purpose.founder.body4",
  "purpose.founder.body5",
  "purpose.founder.body6",
  "purpose.founder.body7",
  "purpose.founder.body8",
  "purpose.founder.body9",
  "purpose.founder.body10",
];

const PurposeSection = () => {
  const { t } = useTranslation();
  const [storyOpen, setStoryOpen] = useState(false);

  return (
    <section className="py-14 md:py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.05),transparent_70%)]" />

      <div className="container px-4 sm:px-6 relative z-10">
        {/* ── Emotional hook ── */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20 enter-fade-up">
          <p className="text-primary font-medium tracking-[0.2em] uppercase text-xs sm:text-sm mb-4">
            {t("purpose.tag")}
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-bold leading-[1.15] mb-6">
            {t("purpose.title1")}{" "}
            <span className="text-gradient-gold">{t("purpose.title2")}</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            {t("purpose.desc")}
          </p>
        </div>

        {/* ── Team intro ── */}
        <p className="text-center text-base md:text-lg text-muted-foreground font-medium tracking-wide mb-10 md:mb-14 enter-fade-in">
          {t("purpose.team.intro")}
        </p>

        {/* ── Bloque Fundador: foto + cita + historia ── */}
        <div className="max-w-3xl mx-auto mb-14 md:mb-20 enter-fade-up">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
            {/* Foto grande del fundador */}
            <div className="shrink-0">
              <div className="w-32 h-32 overflow-hidden rounded-full ring-[3px] ring-primary/40 ring-offset-2 ring-offset-background shadow-lg shadow-primary/10 md:h-40 md:w-40">
                <img
                  src={teamPedro}
                  alt={t("purpose.member3.name")}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            {/* Nombre, cargo, cita e historia */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-serif text-lg md:text-xl font-semibold text-foreground mb-0.5">
                {t("purpose.member3.name")}
              </h3>
              <p className="text-muted-foreground text-sm mb-1">{t("purpose.member3.role")}</p>
              <div className="flex gap-1 flex-wrap justify-center md:justify-start mb-5">
                {["ES", "EN"].map((lang) => (
                  <Badge key={lang} variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
                    {lang}
                  </Badge>
                ))}
              </div>

              <blockquote>
                <p className="text-lg sm:text-xl md:text-2xl leading-snug text-foreground font-semibold">
                  "{t("purpose.founder.hook")}"
                </p>
              </blockquote>

              {/* Read more toggle */}
              <div className="flex justify-center md:justify-start mt-5">
                <button
                  onClick={() => setStoryOpen(!storyOpen)}
                  className="group flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  {storyOpen ? t("purpose.founder.readLess") : t("purpose.founder.readMore")}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${storyOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Expandable body — Big Four editorial */}
          <div
            className={`overflow-hidden transition-[max-height,opacity] duration-700 ease-out ${
              storyOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
                <div className="mt-10 md:mt-14 max-w-2xl mx-auto">
                  {/* ── Opening paragraph with drop cap ── */}
                  <div className="mb-10 md:mb-12 enter-fade-up">
                    <p className="text-foreground font-serif text-lg sm:text-xl md:text-[1.35rem] leading-[1.9] first-letter:text-5xl first-letter:md:text-6xl first-letter:font-bold first-letter:text-primary first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-[0.75] whitespace-pre-line">
                      {t(FOUNDER_BODY_KEYS[0])}
                    </p>
                  </div>

                  {/* ── Body paragraphs — serif, single column, editorial ── */}
                  <div className="space-y-7 mb-12 md:mb-16">
                    {FOUNDER_BODY_KEYS.slice(1, 7).map((key, idx) => (
                      <p
                        key={key}
                        className="whitespace-pre-line font-serif text-foreground/75 text-[15px] sm:text-base md:text-[1.05rem] leading-[2] tracking-[0.005em] enter-fade-up"
                      >
                        {t(key)}
                      </p>
                    ))}
                  </div>

                  {/* ── Full-width pull quote — cinematic ── */}
                  <div className="relative py-12 md:py-16 px-6 md:px-10 -mx-4 sm:-mx-6 mb-12 md:mb-16 bg-foreground/[0.03] overflow-hidden enter-fade-in">
                    <div className="absolute left-4 md:left-8 top-6 bottom-6 w-[2px] bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />
                    <div className="absolute right-4 md:right-8 top-6 bottom-6 w-[2px] bg-gradient-to-b from-transparent via-primary/20 to-primary/50" />

                    <div className="max-w-xl mx-auto text-center">
                      <span className="block font-serif text-primary/25 text-6xl md:text-8xl leading-none select-none mb-3">"</span>
                      <p className="font-serif text-xl sm:text-2xl md:text-[1.7rem] text-foreground font-semibold leading-[1.6] whitespace-pre-line italic">
                        {t("purpose.founder.quote")}
                      </p>
                      <div className="mt-6 flex items-center justify-center gap-3">
                        <div className="w-8 h-px bg-primary/40" />
                        <span className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">Pedro Torres</span>
                        <div className="w-8 h-px bg-primary/40" />
                      </div>
                    </div>
                  </div>

                  {/* ── Final paragraphs ── */}
                  <div className="space-y-7 mb-10">
                    {FOUNDER_BODY_KEYS.slice(7).map((key, idx) => (
                      <p
                        key={key}
                        className="whitespace-pre-line font-serif text-foreground/75 text-[15px] sm:text-base md:text-[1.05rem] leading-[2] tracking-[0.005em] enter-fade-up"
                      >
                        {t(key)}
                      </p>
                    ))}
                  </div>

                  {/* ── Closing — centered, impactful ── */}
                  <div className="text-center py-8 md:py-10 enter-fade-up">
                    <div className="w-12 h-px bg-primary/30 mx-auto mb-6" />
                    <p className="whitespace-pre-line font-serif text-foreground text-lg md:text-xl leading-[1.8] font-semibold italic">
                      {t("purpose.founder.closing")}
                    </p>
                    <div className="w-12 h-px bg-primary/30 mx-auto mt-6" />
                  </div>
                </div>
          </div>
        </div>

        {/* ── Bloque Equipo ── */}
        {/* ── Luxury divider ── */}
        <div className="luxury-divider max-w-xs mx-auto mb-14 md:mb-20" />

        {/* ── Pillars ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 max-w-5xl mx-auto">
          {PILLARS.map((p, i) => (
            <div
              key={p.titleKey}
              className="group flex sm:flex-col gap-4 sm:gap-0 p-5 md:p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-500 enter-fade-up"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl bg-gradient-gold flex items-center justify-center shrink-0 sm:mb-5 md:mb-6 group-hover:scale-110 transition-transform">
                <p.icon className="w-6 h-6 md:w-7 md:h-7 text-primary-foreground" />
              </div>
              <div className="flex-1 sm:block">
                <h3 className="font-serif text-base md:text-xl font-semibold mb-1 sm:mb-2 md:mb-3 text-foreground">
                  {t(p.titleKey)}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t(p.descKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PurposeSection;
