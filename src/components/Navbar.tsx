import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslation } from "@/contexts/LanguageContext";
import logo from "@/assets/logo_legado.png";
import { usePersonalization } from "@/hooks/usePersonalization";

const personalizedRouteLabels: Record<string, { label: string; href: string }> = {
  "property-for-sale-finestrat": { label: "Seguir Finestrat", href: "/property-for-sale-finestrat" },
  "new-build-property-finestrat": { label: "Seguir Finestrat", href: "/new-build-property-finestrat" },
  "property-for-sale-benidorm": { label: "Seguir Benidorm", href: "/property-for-sale-benidorm" },
  "apartments-for-sale-benidorm": { label: "Seguir Benidorm", href: "/apartments-for-sale-benidorm" },
  "sea-view-apartments-benidorm": { label: "Seguir Benidorm", href: "/sea-view-apartments-benidorm" },
  "property-for-sale-alicante-city": { label: "Seguir Alicante", href: "/property-for-sale-alicante-city" },
  "property-for-sale-orihuela-costa": { label: "Seguir Orihuela", href: "/property-for-sale-orihuela-costa" },
  "property-for-sale-torrevieja": { label: "Seguir Torrevieja", href: "/property-for-sale-torrevieja" },
  "property-for-sale-pilar-de-la-horadada": { label: "Seguir Pilar", href: "/property-for-sale-pilar-de-la-horadada" },
  "property-for-sale-ciudad-quesada-rojales": { label: "Seguir Quesada", href: "/property-for-sale-ciudad-quesada-rojales" },
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();
  const { hasSignal, profile } = usePersonalization();
  const topAreaSlug = profile.lastAreaSlug || Object.entries(profile.areaCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const personalizedRoute = topAreaSlug ? personalizedRouteLabels[topAreaSlug] : undefined;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const navLinks = [
    { to: "/", label: t("nav.home"), native: false },
    { to: "/propiedades", label: "Ver propiedades", native: false },
    { to: personalizedRoute?.href || "/property-for-sale-alicante-province", label: hasSignal && personalizedRoute ? personalizedRoute.label : "Alicante", native: false },
    { to: "/blog", label: "Blog", native: false },
    { to: "https://www.legadoinmobiliaria.es", label: t("nav.sell"), native: true },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || mobileOpen ? "glass-dark py-3" : "bg-transparent py-4 sm:py-6"
      }`}
    >
      <div className="container flex items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center flex-shrink-0">
          <img src={logo} alt="Legado Inmobiliaria" className="h-16 sm:h-20" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map(({ to, label, native }) =>
            native ? (
              <a key={to} href={to} target={to.startsWith("http") ? "_blank" : undefined} rel={to.startsWith("http") ? "noopener noreferrer" : undefined} className={`text-xs lg:text-sm font-medium transition-colors tracking-wide uppercase ${scrolled ? "text-foreground hover:text-primary" : "text-white hover:text-white/70"}`}>
                {label}
              </a>
            ) : (
              <Link key={to} to={to} className={`text-xs lg:text-sm font-medium transition-colors tracking-wide uppercase ${scrolled ? "text-foreground hover:text-primary" : "text-white hover:text-white/70"}`}>
                {label}
              </Link>
            )
          )}
          <LanguageSelector />
        </div>

        {/* Mobile toggle */}
        <button
          className={`md:hidden p-1 rounded-lg transition-colors hover:bg-white/10 ${scrolled ? "text-foreground hover:bg-black/5" : "text-white"}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
        >
          <span className="block enter-fade-in">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
          <div
            className="md:hidden mx-3 mt-2 rounded-2xl border border-border/30 bg-background/95 backdrop-blur-xl overflow-hidden enter-fade-up"
          >
            <div className="flex flex-col py-2">
              {navLinks.map(({ to, label, native }, i) => (
                <div key={to} className="enter-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                  {native ? (
                    <a
                      href={to}
                      target={to.startsWith("http") ? "_blank" : undefined}
                      rel={to.startsWith("http") ? "noopener noreferrer" : undefined}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center px-6 py-3.5 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all tracking-wide uppercase"
                    >
                      {label}
                    </a>
                  ) : (
                    <Link
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center px-6 py-3.5 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all tracking-wide uppercase"
                    >
                      {label}
                    </Link>
                  )}
                </div>
              ))}
              <div className="px-6 py-3 border-t border-border/30 mt-1">
                <LanguageSelector />
              </div>
            </div>
          </div>
        )}
    </nav>
  );
};

export default Navbar;
