import { FileText, Landmark, Scale, Languages, PenTool } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";

const services = [
  {
    icon: FileText,
    titleKey: "legal.s1.title",
    descKey: "legal.s1.desc",
  },
  {
    icon: Landmark,
    titleKey: "legal.s2.title",
    descKey: "legal.s2.desc",
  },
  {
    icon: Scale,
    titleKey: "legal.s3.title",
    descKey: "legal.s3.desc",
  },
  {
    icon: PenTool,
    titleKey: "legal.s4.title",
    descKey: "legal.s4.desc",
  },
  {
    icon: Languages,
    titleKey: "legal.s5.title",
    descKey: "legal.s5.desc",
  },
];

const LegalServicesSection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.04),transparent_60%)]" />
      <div className="container relative z-10">
        <div className="text-center mb-16 enter-fade-up">
          <p className="text-primary font-medium tracking-[0.2em] uppercase text-sm mb-3">
            {t("legal.tag")}
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold">
            {t("legal.title1")} <span className="text-gradient-gold">{t("legal.title2")}</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
            {t("legal.desc")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5 max-w-6xl mx-auto">
          {services.map((s, i) => (
            <div
              key={s.titleKey}
              className="bg-white rounded-2xl p-6 text-center group border border-border hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              style={{
                boxShadow: "0 2px 16px hsl(214 35% 14% / 0.07)",
                animationDelay: `${i * 80}ms`,
              }}
              data-animate
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/18 transition-colors">
                <s.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-serif text-base font-semibold text-foreground mb-2">
                {t(s.titleKey)}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t(s.descKey)}
              </p>
            </div>
          ))}
        </div>

        <p className="text-center text-muted-foreground text-sm mt-10 max-w-xl mx-auto enter-fade-in">
          {t("legal.footer")}
        </p>
      </div>
    </section>
  );
};

export default LegalServicesSection;
