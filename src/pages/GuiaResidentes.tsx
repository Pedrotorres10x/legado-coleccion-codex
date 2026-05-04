import { useEffect, useState } from "react";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

const GuiaResidentes = () => {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    document.title = "Tu Hogar en España — Guía del Comprador · Legado Colección";
    window.scrollTo(0, 0);
    fetch("/guia-residentes-content.html")
      .then(r => r.text())
      .then(text => {
        const match = text.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        setHtml(sanitizeHtml(match ? match[1] : text));
      })
      .catch(() => setHtml("<p>Error cargando el contenido.</p>"));
    return () => { document.title = "Legado Colección"; };
  }, []);

  return (
    <div
      id="guia-residentes-root"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default GuiaResidentes;
