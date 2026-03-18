import { useState, useEffect } from "react";
import { ArrowRight, Users, Clock, Home, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

const STATS = [
  { icon: Users,     stat: "+1.500",  label: "familias asesoradas", shortLabel: "familias" },
  { icon: Clock,     stat: "+15",     label: "años en el sector",   shortLabel: "años" },
  { icon: Home,      stat: "+900",    label: "propiedades",         shortLabel: "propiedades" },
  { icon: Building2, stat: "Nº1",     label: "obra nueva en la zona", shortLabel: "obra nueva" },
];

const StickyProofBar = () => {
  const [visible, setVisible] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.55);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => setIdx(i => (i + 1) % STATS.length), 3200);
    return () => clearInterval(id);
  }, [visible]);

  const { icon: Icon, stat, label, shortLabel } = STATS[idx];

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-20 sm:bottom-5 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 flex items-center justify-center sm:justify-start rounded-full overflow-hidden enter-fade-up"
      style={{
        background: "hsl(214 35% 10% / 0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid hsl(38 72% 44% / 0.2)",
        boxShadow: "0 8px 32px hsl(214 35% 4% / 0.4), inset 0 1px 0 hsl(255 100% 100% / 0.05)",
      }}
    >
          {/* Stat rotativo — solo desktop */}
          <div className="hidden sm:flex items-center gap-3 bg-transparent px-5 py-3 min-w-[200px]">
            <div className="w-7 h-7 rounded-full bg-[hsl(38_72%_44%/0.18)] flex items-center justify-center shrink-0">
              <Icon className="w-3.5 h-3.5 text-[hsl(38_72%_60%)]" />
            </div>
              <div key={idx} className="flex items-baseline gap-1.5 min-w-0 overflow-hidden enter-fade-up">
                <span className="text-white font-bold text-sm tracking-tight shrink-0">{stat}</span>
                <span className="text-white/50 text-xs truncate">{label}</span>
              </div>

            {/* Dots */}
            <div className="flex gap-1 ml-auto">
              {STATS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === idx ? "w-3 h-1.5 bg-[hsl(38_72%_55%)]" : "w-1.5 h-1.5 bg-white/20"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Divider — solo desktop */}
          <div className="hidden sm:block w-px h-6 bg-white/15 mx-1" />

          {/* CTA */}
          <Link
            to="/propiedades"
            className="group relative flex items-center justify-center gap-2 px-6 sm:px-5 py-3.5 sm:py-3 bg-transparent overflow-hidden shrink-0 w-full sm:w-auto"
          >
            {/* Fondo dorado sutil en móvil, hover en desktop */}
            <span className="absolute inset-0 bg-gradient-to-r from-[hsl(38_72%_44%/0.2)] to-[hsl(38_72%_44%/0.08)] sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center gap-2">
              <span className="text-[hsl(38_72%_62%)] text-xs sm:text-[11px] font-semibold uppercase tracking-[0.15em] sm:tracking-[0.18em] whitespace-nowrap">
                Abrir fichas
              </span>
              <span className="flex items-center justify-center w-5 h-5 rounded-full border border-[hsl(38_72%_44%/0.5)] group-hover:border-[hsl(38_72%_62%)] group-hover:bg-[hsl(38_72%_44%/0.2)] transition-all duration-300">
                <ArrowRight className="w-2.5 h-2.5 text-[hsl(38_72%_62%)] group-hover:translate-x-0.5 transition-transform duration-300" />
              </span>
            </span>
          </Link>
    </div>
  );
};

export default StickyProofBar;
