import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";

const COOKIE_KEY = "cookie_consent";

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      // Small delay so page loads first
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
    window.dispatchEvent(new Event("cookie_consent_given"));
  };

  const reject = () => {
    localStorage.setItem(COOKIE_KEY, "rejected");
    setVisible(false);
    window.dispatchEvent(new Event("cookie_consent_given"));
  };

  return (
    <>
      {visible && (
        <div
          aria-hidden="true"
          data-nosnippet
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-[60] enter-fade-up"
        >
          <div className="glass-dark rounded-2xl border border-border p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <Cookie className="w-6 h-6 text-primary shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-serif text-sm font-semibold text-foreground mb-2">
                  Usamos cookies 🍪
                </h4>
                <p className="text-muted-foreground text-xs leading-relaxed mb-4">
                  Utilizamos cookies propias y técnicas para mejorar tu experiencia de navegación. 
                  Puedes leer más en nuestra{" "}
                  <Link to="/cookies" className="text-primary hover:underline">
                    Política de Cookies
                  </Link>.
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={accept}
                    className="bg-gradient-gold text-primary-foreground font-semibold hover:opacity-90 text-xs px-4"
                  >
                    Aceptar todas
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={reject}
                    className="border-border text-foreground hover:bg-muted text-xs px-4"
                  >
                    Solo necesarias
                  </Button>
                </div>
              </div>
              <button onClick={reject} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieBanner;
