import { Building2, Users, Award, TrendingUp } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";

const StatsSection = () => {
  const { t } = useTranslation();

  const stats = [
    { icon: Building2, value: "+900", label: t("stats.properties"), suffix: "" },
    { icon: Users, value: "1.500", label: t("stats.clients"), suffix: "+" },
    { icon: Award, value: "15", label: t("stats.experience"), suffix: "" },
    { icon: TrendingUp, value: "98", label: t("stats.success"), suffix: "%" },
  ];

  return (
    <section className="py-14 md:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-card via-secondary to-card" />
      <div className="container relative px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, i) => (
            <div key={stat.label} className="text-center py-2 enter-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
              <stat.icon className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-3 md:mb-4" />
              <p className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold text-gradient-gold">{stat.value}{stat.suffix}</p>
              <p className="text-muted-foreground text-xs mt-1.5 md:mt-2 tracking-wide uppercase leading-snug">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
