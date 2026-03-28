import { Phone, Mail, MapPin, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/contexts/LanguageContext";
import logo from "@/assets/logo_legado.webp";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="py-10 md:py-16 bg-card border-t border-border">
      <div className="container px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-8 md:mb-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/">
              <img
                src={logo}
                alt="Legado Inmobiliaria"
                width="320"
                height="122"
                className="h-20 md:h-24 w-auto"
                loading="lazy"
                decoding="async"
              />
            </Link>
            <p className="text-muted-foreground text-sm mt-4 leading-relaxed max-w-xs">{t("footer.desc")}</p>
          </div>
          <div>
            <h4 className="font-serif text-sm md:text-base font-semibold mb-3 md:mb-4 text-foreground">{t("footer.nav")}</h4>
            <div className="flex flex-col gap-2.5 md:gap-3">
              <Link to="/" className="text-muted-foreground text-sm hover:text-primary transition-colors">{t("nav.home")}</Link>
              <Link to="/propiedades" className="text-muted-foreground text-sm hover:text-primary transition-colors">Ver propiedades</Link>
              <Link to="/property-for-sale-alicante-province" className="text-muted-foreground text-sm hover:text-primary transition-colors">Alicante Province</Link>
              <Link to="/best-areas-to-buy-property-in-alicante-province" className="text-muted-foreground text-sm hover:text-primary transition-colors">Best Areas Guide</Link>
              <Link to="/blog" className="text-muted-foreground text-sm hover:text-primary transition-colors">Blog</Link>
              <a href="/#contacto" className="text-muted-foreground text-sm hover:text-primary transition-colors">{t("nav.contact")}</a>
            </div>
            <p className="mt-4 max-w-xs text-xs leading-6 text-muted-foreground">
              Usa estas rutas para llegar a viviendas concretas, abrir sus fichas completas y consultar cuando una propiedad encaje de verdad.
            </p>
          </div>
          <div>
            <h4 className="font-serif text-sm md:text-base font-semibold mb-3 md:mb-4 text-foreground">{t("footer.propTypes")}</h4>
            <div className="flex flex-col gap-2.5 md:gap-3">
              <span className="text-muted-foreground text-sm">{t("footer.type1")}</span>
              <span className="text-muted-foreground text-sm">{t("footer.type2")}</span>
              <span className="text-muted-foreground text-sm">{t("footer.type3")}</span>
              <span className="text-muted-foreground text-sm">{t("footer.type4")}</span>
            </div>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="font-serif text-sm md:text-base font-semibold mb-3 md:mb-4 text-foreground">{t("footer.contact")}</h4>
            <div className="flex flex-col gap-2.5 md:gap-3">
              <a href="tel:+34965065921" className="flex items-center gap-2 text-muted-foreground text-sm hover:text-primary transition-colors">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" /> +34 965 065 921
              </a>
              <a href="https://pedrotorres10x.es" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground text-sm hover:text-primary transition-colors">
                <Globe className="w-4 h-4 text-primary flex-shrink-0" /> pedrotorres10x.es
              </a>
              <a href="https://maps.google.com/?q=C/+Esperanto+15,+03501+Benidorm,+Alicante,+Spain" target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 text-muted-foreground text-sm hover:text-primary transition-colors">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" /> <span>C/ Esperanto 15,<br className="sm:hidden" /> Benidorm</span>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-6 md:pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-muted-foreground text-xs tracking-wide text-center sm:text-left">
              © <Link to="/admin" className="text-muted-foreground hover:text-muted-foreground no-underline">{new Date().getFullYear()}</Link> Legado Inmobiliaria. {t("footer.rights")}
            </p>
            <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-center">
              <Link to="/privacidad" className="text-muted-foreground text-xs hover:text-primary transition-colors">
                Privacidad
              </Link>
              <Link to="/aviso-legal" className="text-muted-foreground text-xs hover:text-primary transition-colors">
                Aviso Legal
              </Link>
              <Link to="/cookies" className="text-muted-foreground text-xs hover:text-primary transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
