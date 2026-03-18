import { Shield, Gem, Headphones, Target } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";

const WhyChooseUs = () => {
  const { t } = useTranslation();

  const features = [
    { icon: Shield, title: t("why.feat1.title"), description: t("why.feat1.desc") },
    { icon: Gem, title: t("why.feat2.title"), description: t("why.feat2.desc") },
    { icon: Headphones, title: t("why.feat3.title"), description: t("why.feat3.desc") },
    { icon: Target, title: t("why.feat4.title"), description: t("why.feat4.desc") },
  ];

  return (
    <section className="py-12 md:py-24 bg-background">
      <div className="container px-4 sm:px-6">
        <div className="text-center mb-8 md:mb-16 enter-fade-up">
          <p className="text-primary font-medium tracking-[0.2em] uppercase text-xs sm:text-sm mb-3">{t("why.tag")}</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold">
            {t("why.title1")} <span className="text-gradient-gold">{t("why.title2")}</span>?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {features.map((f, i) => (
            <div key={f.title} className="group flex sm:flex-col gap-4 sm:gap-0 p-5 md:p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-500 enter-fade-up" style={{ animationDelay: `${i * 120}ms` }}>
              <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl bg-gradient-gold flex items-center justify-center shrink-0 sm:mb-5 md:mb-6 group-hover:scale-110 transition-transform">
                <f.icon className="w-6 h-6 md:w-7 md:h-7 text-primary-foreground" />
              </div>
              <div className="flex-1 sm:block">
                <h3 className="font-serif text-base md:text-xl font-semibold mb-1 sm:mb-2 md:mb-3 text-foreground">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
