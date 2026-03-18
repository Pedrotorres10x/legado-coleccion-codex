import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";
import { getUtmSource } from "@/lib/utm";
import { isDisposableEmail, checkSessionLimit, incrementSessionCount } from "@/lib/antispam";
import { createLocalLead, syncLeadStatusToCRM } from "@/lib/leads";
import { useToast } from "@/hooks/use-toast";
import { getIntentSummaryPayload } from "@/lib/personalization";

const SESSION_KEY = "exit_intent_shown";

const ExitIntentPopup = () => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const readyRef = useRef(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const timer = setTimeout(() => { readyRef.current = true; }, 15000);

    // Desktop: mouse leaves viewport
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

    const trigger = () => {
      sessionStorage.setItem(SESSION_KEY, "1");
      setShow(true);
      document.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("scroll", handleScroll);
    };

    document.addEventListener("mouseout", handleMouseOut);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    if (isDisposableEmail(email)) {
      toast({ title: "Email no válido", variant: "destructive" });
      return;
    }
    if (checkSessionLimit()) {
      toast({ title: "Demasiadas solicitudes", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const source = getUtmSource();
      const gdprTimestamp = new Date().toISOString();
      const msg = "Exit intent – solicitud de propiedades personalizadas";
      const localLead: TablesInsert<"leads"> = {
        name,
        email: email.trim().toLowerCase(),
        source,
        message: msg,
        metadata: getIntentSummaryPayload(),
        gdpr_accepted_at: gdprTimestamp,
      };
      const insertedLead = await createLocalLead(localLead);

      // Fire-and-forget: notify team + sync CRM
      supabase.functions.invoke("notify-lead", { body: { name, email, message: msg, metadata: getIntentSummaryPayload() } }).catch(() => {});
      void syncLeadStatusToCRM(insertedLead.id, {
        full_name: name,
        email: email.trim().toLowerCase(),
        property_id: null,
        gdpr_consent: true,
        gdpr_timestamp: gdprTimestamp,
        metadata: getIntentSummaryPayload(),
      });

      incrementSessionCount();
      setDone(true);

      // Redirect to /gracias after 2s
      setTimeout(() => navigate("/gracias", {
        state: {
          leadData: { content_name: "exit_intent", email, name, source },
        },
      }), 2000);
    } catch {
      toast({ title: "Error al enviar", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
      show && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 enter-fade-in"
          onClick={() => setShow(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl enter-fade-up"
          >
            <button onClick={() => setShow(false)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>

            {done ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground text-xl font-bold">✓</div>
                <p className="text-foreground font-semibold">¡Listo!</p>
                <p className="text-muted-foreground text-sm">Te enviaremos propiedades seleccionadas para ti.</p>
                <Button variant="ghost" size="sm" onClick={() => setShow(false)}>Cerrar</Button>
              </div>
            ) : (
              <>
                <h3 className="font-serif text-xl font-bold text-foreground mb-1">
                  Antes de irte…
                </h3>
                <p className="text-muted-foreground text-sm mb-5">
                  Si todavía no has encontrado una vivienda clara, te ayudamos a volver con propiedades que sí merezca la pena abrir en ficha. Sin spam, sin compromiso.
                </p>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <Input placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} required className="bg-background/60" />
                  <Input type="email" placeholder="Tu email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-background/60" />
                  <div className="flex items-start gap-2">
                    <Checkbox id="gdpr-exit" checked={gdprAccepted} onCheckedChange={(c) => setGdprAccepted(c === true)} className="mt-0.5" />
                    <label htmlFor="gdpr-exit" className="text-muted-foreground text-[11px] leading-snug cursor-pointer">
                      Acepto la{" "}
                      <a href="/politica-privacidad" target="_blank" className="text-primary underline">política de privacidad</a>
                    </label>
                  </div>
                  <Button type="submit" disabled={loading || !gdprAccepted} className="w-full bg-gradient-gold text-primary-foreground font-semibold hover:opacity-90">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                    Recibir propiedades que encajen
                  </Button>
                </form>
                <button
                  type="button"
                  onClick={() => {
                    setShow(false);
                    navigate("/propiedades");
                  }}
                  className="mt-3 w-full text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Prefiero seguir abriendo fichas de propiedades
                </button>
              </>
            )}
          </div>
        </div>
      )
  );
};

export default ExitIntentPopup;
