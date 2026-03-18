import { Shield, Clock, Award } from "lucide-react";

const TRUST_ITEMS = [
  { icon: Clock, label: "Respuesta en menos de 24h" },
  { icon: Award, label: "Certificación API & CRS" },
  { icon: Shield, label: "+15 años de experiencia" },
];

const PropertiesTrustBar = () => (
  <section className="border-y border-border/30 bg-card/60 backdrop-blur-sm">
    <div className="container py-3 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
      {TRUST_ITEMS.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium whitespace-nowrap">
          <item.icon className="w-3.5 h-3.5 text-primary shrink-0" />
          {item.label}
        </span>
      ))}
    </div>
  </section>
);

export default PropertiesTrustBar;
