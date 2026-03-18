import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Bell, X, Sparkles, Home, TrendingDown, Megaphone } from "lucide-react";
import { usePersonalization } from "@/hooks/usePersonalization";
import {
  isPushSupported,
  wasPushAsked,
  setPushAsked,
  isPushSubscribed,
  subscribeToPush,
} from "@/lib/pushNotifications";

const areaLabels: Record<string, string> = {
  "property-for-sale-finestrat": "Finestrat",
  "new-build-property-finestrat": "obra nueva en Finestrat",
  "property-for-sale-benidorm": "Benidorm",
  "apartments-for-sale-benidorm": "apartamentos en Benidorm",
  "sea-view-apartments-benidorm": "apartamentos con vistas en Benidorm",
  "property-for-sale-alicante-city": "Alicante city",
  "property-for-sale-orihuela-costa": "Orihuela Costa",
  "property-for-sale-torrevieja": "Torrevieja",
  "property-for-sale-pilar-de-la-horadada": "Pilar de la Horadada",
  "property-for-sale-ciudad-quesada-rojales": "Ciudad Quesada / Rojales",
};

const PushNotificationModal = () => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const readyRef = useRef(false);
  const { hasSignal, profile, intentStage } = usePersonalization();
  const topAreaSlug = profile.lastAreaSlug || Object.entries(profile.areaCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topTopic = Object.entries(profile.topicCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const areaLabel = topAreaSlug ? areaLabels[topAreaSlug] : undefined;

  useEffect(() => {
    const canShow = () =>
      !wasPushAsked() && !isPushSubscribed() && isPushSupported();

    if (!canShow()) return;

    // Wait 15s before arming exit-intent
    const timer = setTimeout(() => { readyRef.current = true; }, 15000);

    const trigger = () => {
      if (!canShow()) return;
      setVisible(true);
      document.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("scroll", handleScroll);
    };

    // Desktop: mouse leaves viewport top
    const handleMouseOut = (e: MouseEvent) => {
      if (!readyRef.current) return;
      if (e.clientY < 0) trigger();
    };

    // Mobile: fast scroll up
    let lastY = 0;
    let lastT = 0;
    const handleScroll = () => {
      if (!readyRef.current) return;
      const y = window.scrollY;
      const t = Date.now();
      if (lastT && y < lastY && lastY - y > 100 && t - lastT < 300) trigger();
      lastY = y;
      lastT = t;
    };

    document.addEventListener("mouseout", handleMouseOut);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await subscribeToPush();
    } catch (err) {
      console.error("Push subscription error:", err);
    } finally {
      setPushAsked();
      setLoading(false);
      setVisible(false);
    }
  };

  const handleReject = () => {
    setPushAsked();
    setVisible(false);
  };

  const features = [
    { icon: Home, text: areaLabel ? `Nuevas propiedades en ${areaLabel}` : "Nuevas propiedades en las zonas que ya te interesan" },
    { icon: TrendingDown, text: "Bajadas de precio en tus favoritas" },
    { icon: Megaphone, text: topTopic === "mortgage" ? "Avisos relevantes mientras comparas compra e hipoteca" : "Avisos más relevantes, menos ruido genérico" },
  ];
  const title =
    intentStage === "late" ? "Mantén viva esta búsqueda" : "No te pierdas nada";
  const description = hasSignal && areaLabel
    ? intentStage === "late"
      ? `Ya hay señales claras de que ${areaLabel} te importa de verdad. Activa las notificaciones y te avisaremos de nuevas viviendas o cambios relevantes en esa ruta, no de zonas que no encajan contigo.`
      : `Activa las notificaciones y te avisaremos mejor según lo que ya has explorado. Ahora mismo parece mucho más útil avisarte de ${areaLabel} que de zonas irrelevantes para ti.`
    : "Activa las notificaciones y te avisaremos mejor según lo que ya has explorado. Si has mostrado interés en Finestrat, por ejemplo, tiene más sentido avisarte de Finestrat que de una zona irrelevante para ti.";
  const ctaLabel =
    intentStage === "late" && areaLabel ? `Seguir ${areaLabel} por push` : "Activar notificaciones";

  return (
    <>
      {visible && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={handleReject}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 enter-fade-up">
            <div className="w-full max-w-md glass-dark rounded-3xl border border-border p-8 shadow-2xl relative overflow-hidden">
              {/* Decorative glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />

              {/* Close button */}
              <button
                onClick={handleReject}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div className="flex justify-center mb-5">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                      <Bell className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-1 -right-1 animate-pulse">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-serif text-2xl font-bold text-foreground text-center mb-2">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm text-center mb-6 leading-relaxed">
                  {description}
                </p>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {features.map((feat, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-sm enter-fade-up"
                      style={{ animationDelay: `${100 + i * 100}ms` }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <feat.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-foreground/90">{feat.text}</span>
                    </div>
                  ))}
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleAccept}
                    disabled={loading}
                    className="w-full bg-gradient-gold text-primary-foreground font-semibold hover:opacity-90 h-12 text-sm rounded-xl shadow-lg shadow-primary/20"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>
                        <Bell className="w-4 h-4 mr-2" />
                        {ctaLabel}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleReject}
                    className="w-full text-muted-foreground hover:text-foreground text-xs h-10"
                  >
                    Ahora no, gracias
                  </Button>
                </div>

                <p className="text-muted-foreground/60 text-[10px] text-center mt-4">
                  Puedes desactivar las notificaciones en cualquier momento desde tu navegador.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default PushNotificationModal;
