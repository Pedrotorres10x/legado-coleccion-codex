import { useEffect, useRef } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trackLead } from "@/lib/metaPixel";

type ThankYouLeadState = {
  leadData?: Record<string, unknown>;
};

const ThankYou = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    const leadData = (location.state as ThankYouLeadState | null)?.leadData;
    trackLead(leadData || { content_name: "direct_visit" });
  }, [location.state]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="container max-w-2xl text-center">
          <div className="mb-8 enter-fade-up">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
          </div>

          <div className="enter-fade-up">
            <p className="text-primary font-medium tracking-[0.2em] uppercase text-sm mb-3">
              {t("thanks.tag")}
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t("thanks.title")}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-lg mx-auto">
              {t("thanks.desc")}
            </p>
          </div>

          <div className="glass-dark rounded-2xl p-8 mb-8 text-left space-y-4 enter-fade-up">
            <h3 className="font-serif text-lg font-semibold text-foreground">
              {t("thanks.nextTitle")}
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">1</span>
                <p className="text-muted-foreground text-sm">{t("thanks.step1")}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">2</span>
                <p className="text-muted-foreground text-sm">{t("thanks.step2")}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">3</span>
                <p className="text-muted-foreground text-sm">{t("thanks.step3")}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8 enter-fade-up">
            <Button
              size="lg"
              onClick={() => navigate("/propiedades")}
              className="bg-gradient-gold text-primary-foreground font-semibold hover:opacity-90"
            >
              {t("thanks.ctaProperties")} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ThankYou;
