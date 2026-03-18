import { useLocation } from "react-router-dom";
import { trackContact } from "@/lib/metaPixel";

const WhatsAppIcon = () => (
  <svg viewBox="0 0 32 32" className="w-7 h-7 fill-current">
    <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.128 6.744 3.046 9.378L1.054 31.29l6.154-1.97A15.9 15.9 0 0016.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.35 22.614c-.396 1.116-1.958 2.042-3.21 2.312-.858.182-1.978.328-5.752-1.236-4.828-2.002-7.932-6.904-8.174-7.222-.232-.318-1.95-2.598-1.95-4.956s1.234-3.516 1.672-3.996c.438-.48.958-.6 1.278-.6.318 0 .636.002.914.016.294.016.688-.112 1.076.82.396.956 1.352 3.296 1.47 3.534.12.238.198.516.038.834-.16.318-.238.516-.478.796-.238.278-.502.622-.716.834-.238.238-.486.496-.21.974.278.478 1.236 2.038 2.654 3.302 1.822 1.626 3.358 2.128 3.836 2.366.478.238.756.198 1.034-.12.278-.318 1.194-1.394 1.512-1.874.318-.478.636-.396 1.074-.238.438.16 2.794 1.318 3.272 1.556.478.238.796.358.914.556.12.198.12 1.146-.276 2.262z" />
  </svg>
);

const WhatsAppButton = () => {
  const location = useLocation();

  const getMessage = () => {
    if (location.pathname.startsWith("/propiedad/")) {
      return "Hola, estoy viendo una propiedad en su web y me gustaría más información.";
    }
    if (location.pathname === "/propiedades") {
      return "Hola, estoy buscando propiedades en su catálogo. ¿Podrían ayudarme?";
    }
    return "Hola, visito su web y me gustaría recibir información sobre sus propiedades.";
  };

  const url = `https://wa.me/644245670?text=${encodeURIComponent(getMessage())}`;

  const handleClick = () => {
    trackContact({
      method: "whatsapp",
      content_name: location.pathname,
    });
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      onClick={handleClick}
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[55] flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110 transition-transform duration-300 hover:shadow-[0_0_20px_rgba(37,211,102,0.4)]"
    >
      <WhatsAppIcon />
    </a>
  );
};

export default WhatsAppButton;
