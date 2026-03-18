import { useParams, Link } from "react-router-dom";
import {
  MapPin, BedDouble, Bath, Maximize, Calendar, Car, Waves,
  Sun, ArrowUp, ArrowLeft, ChevronLeft, ChevronRight,
  Flower2, ExternalLink, Zap, Building, Ruler, X, Camera,
  Shield, Clock, Star, Send, Share2, Copy, Check, Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import LeadForm from "@/components/LeadForm";
import { useExternalProperties, useSimilarProperties, usePropertyBySlug } from "@/hooks/useExternalProperties";
import { Skeleton } from "@/components/ui/skeleton";
import React, { useState, useEffect, useCallback } from "react";
import { trackViewContent, setupScrollTracking, setupTimeOnPage, trackContact, trackShare } from "@/lib/metaPixel";
import SEOHead from "@/components/SEOHead";
import { buildPropertySchema, buildBreadcrumbSchema } from "@/lib/seo-schemas";
import { propertyUrl, propertyShareUrl, ensurePropertyOg } from "@/lib/utils";
import { SITE_URL } from "@/lib/site";
import {
  getAreaIntentFilters,
  getAreaRouteMeta,
  getTopAreaSlug,
  getTopTopic,
  recordPropertyIntent,
} from "@/lib/personalization";
import { usePersonalization } from "@/hooks/usePersonalization";

const formatPrice = (v: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);

const TYPE_LABELS: Record<string, string> = {
  piso: "Piso", casa: "Casa", villa: "Villa", atico: "Ático",
  duplex: "Dúplex", chalet: "Chalet", estudio: "Estudio", local: "Local", otro: "Otro",
  adosado: "Adosado",
};

const PropertyDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  // Un solo hook que maneja: BD lookup → fallback CRM → propiedad completa
  const { data: property, isLoading } = usePropertyBySlug(slug);
  const { hasSignal, profile } = usePersonalization();

  const { data: similarProps } = useSimilarProperties(property ?? undefined);
  const topAreaSlug = getTopAreaSlug(profile);
  const topArea = getAreaRouteMeta(topAreaSlug);
  const topTopic = getTopTopic(profile);
  const personalizedFilters =
    getAreaIntentFilters(topAreaSlug) ||
    (topTopic === "apartments" ? { type: "piso" } : undefined) ||
    (topTopic === "villa" ? { type: "villa" } : undefined);
  const { data: personalizedProps } = useExternalProperties(
    personalizedFilters || {},
    "newest",
    1,
    !!property && hasSignal && !!personalizedFilters
  );

  const [currentImage, setCurrentImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showMobileCTA, setShowMobileCTA] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (property) {
      trackViewContent({
        content_name: property.title,
        content_ids: [property.id],
        content_type: "property",
        value: property.price,
        currency: "EUR",
        property_type: property.property_type,
        city: property.city || property.location,
        zone: property.zone || undefined,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area_m2: property.area_m2 || property.surface_area,
        built_area: property.built_area || undefined,
        operation: property.operation,
        has_pool: property.has_pool || undefined,
        has_garage: property.has_garage || undefined,
        has_terrace: property.has_terrace || undefined,
        has_elevator: property.has_elevator || undefined,
        has_garden: property.has_garden || undefined,
        energy_cert: property.energy_cert || undefined,
        year_built: property.year_built || undefined,
        floor: property.floor,
        num_images: property.images?.length || 0,
      });
    }
  }, [property]);

  useEffect(() => {
    if (!property) return;

    recordPropertyIntent({
      id: property.id,
      title: property.title,
      href: propertyUrl(property),
      city: property.city || property.location,
      price: property.price,
    });
  }, [property]);

  useEffect(() => {
    const cleanupScroll = setupScrollTracking();
    const cleanupTime = setupTimeOnPage(30);
    return () => { cleanupScroll?.(); cleanupTime?.(); };
  }, []);

  // Show mobile CTA after scrolling past hero
  useEffect(() => {
    const handler = () => setShowMobileCTA(window.scrollY > 600);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const nextImage = useCallback(() => {
    if (!property) return;
    const imgs = property.images?.length ? property.images : [];
    if (imgs.length === 0) return;
    setCurrentImage((prev) => (prev + 1) % imgs.length);
  }, [property]);

  const prevImage = useCallback(() => {
    if (!property) return;
    const imgs = property.images?.length ? property.images : [];
    if (imgs.length === 0) return;
    setCurrentImage((prev) => (prev - 1 + imgs.length) % imgs.length);
  }, [property]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, nextImage, prevImage]);

  // Ensure OG HTML file exists in Storage for social sharing
  useEffect(() => {
    if (property) ensurePropertyOg(property);
  }, [property]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-0">
          <Skeleton className="w-full h-[70vh]" />
          <div className="container pt-10">
            <Skeleton className="w-2/3 h-12 mb-4" />
            <Skeleton className="w-1/3 h-6" />
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!property) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-24">
          <div className="text-center max-w-lg w-full enter-fade-up">
            {/* 404 decorative */}
            <div className="relative mb-8 flex items-center justify-center">
              <span className="font-serif text-[9rem] leading-none font-bold text-primary/10 select-none">
                404
              </span>
              <div className="absolute flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-gold flex items-center justify-center shadow-lg shadow-primary/20">
                  <MapPin className="w-9 h-9 text-primary-foreground" />
                </div>
              </div>
            </div>

            <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3">
              Propiedad no encontrada
            </h1>
            <p className="text-muted-foreground text-sm md:text-base mb-8 leading-relaxed">
              Es posible que esta propiedad haya sido vendida, retirada del mercado o que el enlace no sea válido.
            </p>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-border/50" />
              <span className="text-muted-foreground text-xs tracking-widest uppercase">¿Qué deseas hacer?</span>
              <div className="flex-1 h-px bg-border/50" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/propiedades">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-gold text-primary-foreground font-semibold px-8 hover:opacity-90 shadow-md shadow-primary/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Abrir más fichas de propiedades
                </Button>
              </Link>
              <Link to="/">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-border/60 hover:border-primary/40 font-semibold px-8"
                >
                  Ir al inicio
                </Button>
              </Link>
            </div>

            <p className="text-muted-foreground/60 text-xs mt-8">
              Si crees que esto es un error, escríbenos por{" "}
              <a
                href="https://wa.me/34600000000"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                WhatsApp
              </a>
            </p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const images = property.images?.length ? property.images : [];
  const hasImages = images.length > 0;
  const similar = similarProps?.filter((p) => p.id !== property.id).slice(0, 3) || [];
  const personalizedAlternatives =
    personalizedProps?.properties.filter((p) => p.id !== property.id).slice(0, 3) || [];
  const alternativeHomes =
    personalizedAlternatives.length > 0 ? personalizedAlternatives : similar;
  const alternativeTitle =
    personalizedAlternatives.length > 0 && topArea
      ? `Más viviendas para seguir por ${topArea.label}`
      : "Propiedades similares";
  const alternativeDescription =
    personalizedAlternatives.length > 0 && topArea
      ? `Como ya has mostrado interés en ${topArea.label}, aquí te enseñamos otras fichas alineadas con esa ruta. Úsalas para comparar, pero vuelve a esta vivienda si sigue siendo la que mejor encaja contigo.`
      : "Úsalas para comparar mejor, pero intenta volver a la ficha que más encaje contigo y consulta desde ahí cuando estés listo.";
  const leadContext = (() => {
    if (topTopic === "mortgage") {
      return {
        panelTitle: "¿Te interesa esta propiedad y quieres valorar hipoteca?",
        panelDescription:
          "Si esta vivienda encaja contigo, podemos ayudarte a avanzar también con la parte financiera para que sepas si tiene sentido reservar, visitar o estructurar la compra.",
        formTitle: "Cuéntanos cómo encaja esta vivienda",
        formDescription:
          "Si además te interesa la parte hipotecaria, dínoslo aquí y te responderemos con el siguiente paso útil sobre la vivienda y la financiación.",
        messagePlaceholder: "Mensaje (por ejemplo: me interesa esta vivienda y quiero valorar opciones de hipoteca)",
        submitLabel: "Enviar interés por esta vivienda",
      };
    }

    if (topTopic === "legal") {
      return {
        panelTitle: "¿Te interesa esta propiedad y quieres claridad legal?",
        panelDescription:
          "Si esta vivienda te encaja, este es el momento de consultarnos para ayudarte a avanzar con revisión documental, proceso y siguientes pasos sin perder tiempo.",
        formTitle: "Cuéntanos qué necesitas revisar",
        formDescription:
          "Puedes decirnos si te preocupa la parte legal, la reserva o el proceso de compra. Cuanto más claro sea el contexto, mejor podremos ayudarte.",
        messagePlaceholder: "Mensaje (por ejemplo: me interesa esta vivienda y quiero entender bien el proceso legal)",
        submitLabel: "Enviar consulta sobre esta vivienda",
      };
    }

    if (topTopic === "new_build") {
      return {
        panelTitle: "¿Te interesa esta vivienda y quieres avanzar bien la compra?",
        panelDescription:
          "Si vienes comparando obra nueva o producto moderno, te ayudamos a aterrizar esta propiedad concreta con documentación, timings y siguientes pasos claros.",
        formTitle: "Cuéntanos qué necesitas confirmar",
        formDescription:
          "Usa este formulario para decirnos si quieres más detalle sobre estado, proceso, visita o encaje real con tu búsqueda.",
        messagePlaceholder: "Mensaje (por ejemplo: me interesa esta vivienda y quiero confirmar disponibilidad o proceso)",
        submitLabel: "Enviar interés por esta vivienda",
      };
    }

    return {
      panelTitle: "¿Te interesa esta propiedad?",
      panelDescription:
        "Si esta vivienda encaja contigo, este es el mejor momento para enviarnos el formulario y ayudarte a avanzar con información útil, visitas o siguientes pasos.",
      formTitle: "Cuéntanos qué buscas",
      formDescription:
        "Cuanto más claro tengamos el encaje con esta vivienda o con tu búsqueda, mejor podremos responderte con el siguiente paso útil.",
      messagePlaceholder: "Mensaje (opcional)",
      submitLabel: "Enviar interés",
    };
  })();
  const trustSignals = [
    { icon: Shield, label: "Datos\nprotegidos" },
    topTopic === "mortgage"
      ? { icon: Clock, label: "Hipoteca\nno residente" }
      : topTopic === "legal"
        ? { icon: Shield, label: "Proceso\nmás claro" }
        : topTopic === "new_build"
          ? { icon: Clock, label: "Compra\ncoordinada" }
          : { icon: Clock, label: "Respuesta\nen 24h" },
    { icon: Star, label: "15+ años\nexperiencia" },
  ];

  const features = [
    { icon: BedDouble, label: "Habitaciones", value: property.bedrooms },
    { icon: Bath, label: "Baños", value: property.bathrooms },
    ...(property.area_m2 ? [{ icon: Maximize, label: "Superficie", value: `${property.area_m2} m²` }] : []),
    ...(property.built_area ? [{ icon: Ruler, label: "Construidos", value: `${property.built_area} m²` }] : []),
    ...(property.year_built ? [{ icon: Calendar, label: "Año", value: property.year_built }] : []),
    ...(property.floor != null ? [{ icon: ArrowUp, label: "Planta", value: typeof property.floor === "number" ? `${property.floor}ª` : property.floor }] : []),
    ...(property.operation ? [{ icon: Building, label: "Operación", value: property.operation === "venta" ? "Venta" : property.operation === "alquiler" ? "Alquiler" : property.operation }] : []),
  ];

  const amenities = [
    ...(property.has_garage ? [{ icon: Car, label: "Garaje" }] : []),
    ...(property.has_pool ? [{ icon: Waves, label: "Piscina" }] : []),
    ...(property.has_terrace ? [{ icon: Sun, label: "Terraza" }] : []),
    ...(property.has_elevator ? [{ icon: ArrowUp, label: "Ascensor" }] : []),
    ...(property.has_garden ? [{ icon: Flower2, label: "Jardín" }] : []),
  ];

  const energyCert = property.energy_cert
    ? property.energy_cert.replace(/<[^>]*>/g, "").trim()
    : null;

  const propertyPageUrl = `${SITE_URL}${propertyUrl(property)}`;
  const socialShareUrl = propertyShareUrl(property);
  const propertyJsonLd = buildPropertySchema(property);
  const breadcrumbJsonLd = buildBreadcrumbSchema([
    { name: "Inicio", url: SITE_URL },
    { name: "Propiedades", url: `${SITE_URL}/propiedades` },
    { name: property.title, url: propertyPageUrl },
  ]);

  const seoTitle = `${property.title} en ${property.location} | ${formatPrice(property.price)} — Legado Inmobiliaria`;
  const seoDesc = `${TYPE_LABELS[property.property_type] || property.property_type} en ${property.location}: ${property.bedrooms} hab, ${property.bathrooms} baños, ${property.area_m2 || ""} m². ${property.description?.slice(0, 100) || ""}`;

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(socialShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: textarea trick
      const ta = document.createElement("textarea");
      ta.value = socialShareUrl;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const whatsappShareText = `🏡 ${property.title} | ${formatPrice(property.price)}\n📍 ${property.location}${property.province ? `, ${property.province}` : ""}\n🛏 ${property.bedrooms} hab · 🚿 ${property.bathrooms} baños · 📐 ${property.area_m2 || property.surface_area} m²\n\n${socialShareUrl}`;
  const whatsappShareHref = `https://wa.me/?text=${encodeURIComponent(whatsappShareText)}`;

  const handleWhatsAppShare = () => {
    trackShare({ method: "whatsapp", content_name: property.title, property_id: property.id, value: property.price });
  };

  const handleEmailShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const subject = encodeURIComponent(`${property.title} | ${formatPrice(property.price)} — Legado Inmobiliaria`);
    const body = encodeURIComponent(`Hola,\n\nTe comparto esta propiedad que podría interesarte:\n\n🏡 ${property.title}\n📍 ${property.location}${property.province ? `, ${property.province}` : ""}\n💶 ${formatPrice(property.price)}\n🛏 ${property.bedrooms} hab · 🚿 ${property.bathrooms} baños · 📐 ${property.area_m2 || property.surface_area} m²\n\nVer ficha completa: ${socialShareUrl}\n\nUn saludo,\nLegado Inmobiliaria`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    trackShare({ method: "email", content_name: property.title, property_id: property.id, value: property.price });
  };

  const handleFacebookShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(socialShareUrl)}`, "_blank", "width=600,height=400,noopener,noreferrer");
    trackShare({ method: "facebook", content_name: property.title, property_id: property.id, value: property.price });
  };

  const scrollToForm = () => {
    document.getElementById("lead-form-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-background">
      <SEOHead
        title={seoTitle}
        description={seoDesc}
        canonical={propertyPageUrl}
        ogImage={hasImages ? images[0] : `${SITE_URL}/og-image.jpg`}
        ogType="product"
        jsonLd={[propertyJsonLd, breadcrumbJsonLd]}
      />
      <Navbar />

      {/* ═══════════════ HERO CINEMATIC ═══════════════ */}
      <section className="relative h-[60vh] md:h-[85vh] overflow-hidden watermark-full" data-protected>
        {hasImages ? (
            <div
              key={currentImage}
              role="img"
              aria-label={property.title}
              className="absolute inset-0 w-full h-full bg-cover bg-center cursor-pointer enter-fade-in"
              style={{ backgroundImage: `url(${images[currentImage]})` }}
              onClick={() => setLightboxOpen(true)}
            />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-muted to-muted/60 flex flex-col items-center justify-center gap-4">
            <Camera className="w-16 h-16 text-muted-foreground/40" />
            <p className="text-muted-foreground/60 text-sm font-medium tracking-wide uppercase">Sin fotos disponibles</p>
          </div>
        )}

        {/* Cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-transparent" />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full glass-dark flex items-center justify-center text-white hover:bg-white/20 transition-all z-10"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full glass-dark flex items-center justify-center text-white hover:bg-white/20 transition-all z-10"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </>
        )}

        {/* Photo counter - only when there are real images */}
        {hasImages && (
          <button
            onClick={() => setLightboxOpen(true)}
            className="absolute top-20 md:top-24 right-4 md:right-6 bg-white/95 backdrop-blur-sm shadow-md rounded-full px-3 md:px-4 py-1.5 md:py-2 flex items-center gap-2 text-foreground text-xs md:text-sm hover:bg-white transition-all z-10 border border-border/50"
          >
            <Camera className="w-3.5 h-3.5 md:w-4 md:h-4" />
            {currentImage + 1} / {images.length}
          </button>
        )}

        {/* Back link + share buttons */}
        <div className="absolute top-20 md:top-24 left-4 md:left-6 flex items-center gap-2 z-10">
          <Link
            to="/propiedades"
            className="bg-white/95 backdrop-blur-sm shadow-md rounded-full px-3 md:px-4 py-1.5 md:py-2 flex items-center gap-1.5 md:gap-2 text-foreground text-xs md:text-sm hover:bg-white transition-all border border-border/50"
          >
            <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" /> Catálogo
          </Link>

          {/* WhatsApp share */}
          <a
            href={whatsappShareHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppShare}
            className="bg-white/95 backdrop-blur-sm shadow-md rounded-full px-3 py-1.5 flex items-center gap-1.5 text-foreground text-xs hover:bg-white transition-all border border-border/50"
            title="Compartir en WhatsApp"
          >
            <svg viewBox="0 0 32 32" className="w-3.5 h-3.5 shrink-0 fill-[#25D366]">
              <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.128 6.744 3.046 9.378L1.054 31.29l6.154-1.97A15.9 15.9 0 0016.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.35 22.614c-.396 1.116-1.958 2.042-3.21 2.312-.858.182-1.978.328-5.752-1.236-4.828-2.002-7.932-6.904-8.174-7.222-.232-.318-1.95-2.598-1.95-4.956s1.234-3.516 1.672-3.996c.438-.48.958-.6 1.278-.6.318 0 .636.002.914.016.294.016.688-.112 1.076.82.396.956 1.352 3.296 1.47 3.534.12.238.198.516.038.834-.16.318-.238.516-.478.796-.238.278-.502.622-.716.834-.238.238-.486.496-.21.974.278.478 1.236 2.038 2.654 3.302 1.822 1.626 3.358 2.128 3.836 2.366.478.238.756.198 1.034-.12.278-.318 1.194-1.394 1.512-1.874.318-.478.636-.396 1.074-.238.438.16 2.794 1.318 3.272 1.556.478.238.796.358.914.556.12.198.12 1.146-.276 2.262z" />
            </svg>
            <span className="hidden sm:inline">WhatsApp</span>
          </a>

          {/* Facebook share */}
          <button
            onClick={handleFacebookShare}
            className="bg-white/95 backdrop-blur-sm shadow-md rounded-full px-3 py-1.5 flex items-center gap-1.5 text-foreground text-xs hover:bg-white transition-all border border-border/50"
            title="Compartir en Facebook"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0 fill-[#1877F2]">
              <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
            </svg>
            <span className="hidden sm:inline">Facebook</span>
          </button>

          {/* Email share */}
          <button
            onClick={handleEmailShare}
            className="bg-white/95 backdrop-blur-sm shadow-md rounded-full px-3 py-1.5 flex items-center gap-1.5 text-foreground text-xs hover:bg-white transition-all border border-border/50"
          >
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Email</span>
          </button>

          {/* Copy link */}
          <button
            onClick={handleCopyLink}
            className="bg-white/95 backdrop-blur-sm shadow-md rounded-full px-3 py-1.5 flex items-center gap-1.5 text-foreground text-xs hover:bg-white transition-all border border-border/50"
            title="Copiar enlace"
          >
            {copied
              ? <Check className="w-3.5 h-3.5 text-primary" />
              : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? "¡Copiado!" : "Copiar"}</span>
          </button>
        </div>

        {/* Hero content overlay */}
        <div className="absolute bottom-0 left-0 right-0 pb-6 md:pb-16 px-4 md:px-12 lg:px-20 z-10">
          <div className="max-w-7xl mx-auto">
            <div className="enter-fade-up" style={{ animationDelay: "300ms" }}>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <span className="bg-gradient-gold text-primary-foreground text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase px-3 md:px-4 py-1.5 md:py-2 rounded-full">
                  {TYPE_LABELS[property.property_type] || property.property_type}
                </span>
                {property.operation && (
                  <span className="bg-accent text-accent-foreground text-[10px] md:text-xs font-semibold tracking-wider uppercase px-2.5 md:px-3 py-1 md:py-1.5 rounded-full">
                    {property.operation === "venta" ? "En venta" : property.operation}
                  </span>
                )}
                {property.status !== "disponible" && (
                  <span className="bg-destructive text-destructive-foreground text-[10px] md:text-xs font-bold px-2.5 md:px-3 py-1 md:py-1.5 rounded-full uppercase">
                    {property.status}
                  </span>
                )}
              </div>

              <h1 className="font-serif text-2xl md:text-5xl lg:text-6xl font-bold text-white mb-2 md:mb-3 leading-tight" style={{textShadow: "0 2px 12px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.5)"}}>
                {property.title}
              </h1>

              <div className="flex items-center gap-2 text-white/95 mb-1 md:mb-0" style={{textShadow: "0 1px 6px rgba(0,0,0,0.6)"}}>
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-primary drop-shadow-md" />
                <span className="text-sm md:text-lg">{property.location}{property.province ? `, ${property.province}` : ""}</span>
              </div>

              <span className="font-serif text-2xl md:text-4xl font-bold text-gradient-gold drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                {formatPrice(property.price)}
              </span>
            </div>
          </div>
        </div>

        {/* Thumbnail strip - hidden on mobile to avoid overlap */}
        {images.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex gap-2 max-w-[80%] overflow-x-auto scrollbar-hide px-3 py-2 rounded-xl glass-dark z-10">
            {images.slice(0, 15).map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentImage(i)}
                className={`w-12 h-9 rounded-md overflow-hidden border-2 transition-all flex-shrink-0 ${
                  i === currentImage ? "border-primary scale-110 opacity-100" : "border-transparent opacity-50 hover:opacity-80"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════ FEATURES BAR ═══════════════ */}
      <section className="relative z-20 -mt-6">
        <div className="max-w-5xl mx-auto px-4">
          <div className="card-med rounded-2xl p-4 md:p-8 enter-fade-up" style={{ animationDelay: "500ms" }}>
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 md:gap-6">
              {features.map((f, i) => (
                <div key={f.label} className="text-center enter-fade-up" style={{ animationDelay: `${600 + i * 50}ms` }}>
                  <f.icon className="w-5 h-5 md:w-6 md:h-6 text-primary mx-auto mb-1.5 md:mb-2" />
                  <p className="text-foreground font-bold text-base md:text-lg">{f.value}</p>
                  <p className="text-muted-foreground text-[9px] md:text-[10px] uppercase tracking-[0.15em]">{f.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ MAIN CONTENT ═══════════════ */}
      <section className="py-8 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-16">

            {/* Left column - 3/5 */}
            <div className="lg:col-span-3 space-y-12">

              {/* Amenities pills */}
              {amenities.length > 0 && (
                <div className="reveal-up">
                  <div className="flex flex-wrap gap-3">
                    {amenities.map((a) => (
                      <span
                        key={a.label}
                        className="flex items-center gap-2 glass-premium rounded-full px-5 py-2.5 text-sm text-foreground"
                      >
                        <a.icon className="w-4 h-4 text-primary" /> {a.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {property.description && (
                <div className="reveal-up">
                  <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">
                    Sobre esta <span className="text-gradient-gold">propiedad</span>
                  </h2>
                  <div className="luxury-divider mb-8" />
                  <div className="prose-luxury space-y-6">
                    {property.description.split("\n").reduce<{ sections: React.ReactNode[]; key: number }>(
                      (acc, line) => {
                        const trimmed = line.trim();
                        if (!trimmed) return acc;
                        // Detect section headers: ALL CAPS lines or lines ending with ":"
                        const isHeader = /^[A-ZÁÉÍÓÚÑÜ\s/&-]{3,}$/.test(trimmed) && trimmed.length < 60;
                        if (isHeader) {
                          acc.sections.push(
                            <h3
                              key={acc.key++}
                              className="font-serif text-lg md:text-xl font-semibold text-foreground tracking-wide pt-4 first:pt-0 flex items-center gap-3"
                            >
                              <span className="w-8 h-px bg-primary/50" />
                              {trimmed.charAt(0) + trimmed.slice(1).toLowerCase()}
                            </h3>
                          );
                        } else {
                          acc.sections.push(
                            <p
                              key={acc.key++}
                              className="text-muted-foreground/90 leading-[1.9] text-[15px] md:text-base font-light"
                            >
                              {trimmed}
                            </p>
                          );
                        }
                        return acc;
                      },
                      { sections: [], key: 0 }
                    ).sections}
                  </div>
                </div>
              )}

              {/* Energy Certificate */}
              {energyCert && energyCert !== "not-available" && (
                <div className="flex items-center gap-3 glass-premium rounded-xl px-5 py-4 reveal-up">
                  <Zap className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Certificado energético</p>
                    <p className="text-foreground font-medium">{energyCert}</p>
                  </div>
                </div>
              )}

              {/* Virtual Tour */}
              {property.virtual_tour_url && (
                <div className="reveal-up">
                  <a
                    href={property.virtual_tour_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-gradient-gold text-primary-foreground px-6 py-4 rounded-xl font-semibold hover:opacity-90 transition-opacity text-lg shimmer-gold"
                  >
                    <ExternalLink className="w-5 h-5" /> Ver tour virtual 360°
                  </a>
                </div>
              )}

              {/* Image gallery grid */}
              {images.length > 3 && (
                <div className="reveal-up">
                  <h2 className="font-serif text-2xl md:text-3xl font-bold mb-6">
                    Galería <span className="text-gradient-gold">({images.length} fotos)</span>
                  </h2>
                  <div className="luxury-divider mb-6" />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {images.slice(0, 9).map((img, i) => (
                      <button
                        key={i}
                        onClick={() => { setCurrentImage(i); setLightboxOpen(true); }}
                        className={`rounded-xl overflow-hidden group relative watermark-full reveal-up ${
                          i === 0 ? "col-span-2 row-span-2 aspect-[4/3]" : "aspect-[4/3]"
                        }`}
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        <div
                          role="img"
                          aria-label={`${property.title} - ${i + 1}`}
                          className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                          style={{ backgroundImage: `url(${img})` }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      </button>
                    ))}
                    {images.length > 9 && (
                      <button
                        onClick={() => { setCurrentImage(9); setLightboxOpen(true); }}
                        className="rounded-xl overflow-hidden relative aspect-[4/3] glass-premium flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors"
                      >
                        <Camera className="w-8 h-8 text-primary" />
                        <span className="text-foreground font-serif text-lg font-bold">+{images.length - 9}</span>
                        <span className="text-muted-foreground text-xs">Ver todas</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right column - 2/5 — STICKY CONVERSION PANEL */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-24 space-y-6" id="lead-form-section">

                {/* Price card */}
                <div className="glass-premium rounded-2xl p-8 text-center border-glow-gold enter-fade-up" style={{ animationDelay: "400ms" }}>
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] mb-3">Precio exclusivo</p>
                  <p className="font-serif text-4xl md:text-5xl font-bold text-gradient-gold mb-4">
                    {formatPrice(property.price)}
                  </p>
                  <div className="luxury-divider mb-4" />
                  <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                    {property.province && <span>{property.city}, {property.province}</span>}
                    <span>Ref: {property.reference || property.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                </div>

                {/* Lead form */}
                <div className="glass-premium rounded-2xl p-6 md:p-8 border-glow-gold enter-fade-up" style={{ animationDelay: "500ms" }}>
                <div className="text-center mb-6">
                  <h3 className="font-serif text-xl font-bold text-foreground mb-2">
                    {leadContext.panelTitle}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {leadContext.panelDescription}
                  </p>
                </div>
                  <LeadForm
                    propertyId={property.id}
                    propertyTitle={property.title}
                    introTitle={leadContext.formTitle}
                    introDescription={leadContext.formDescription}
                    messagePlaceholder={leadContext.messagePlaceholder}
                    submitLabel={leadContext.submitLabel}
                    propertyPrice={property.price}
                    propertyType={property.property_type}
                    propertyCity={property.city || property.location}
                    propertyBedrooms={property.bedrooms}
                    propertyBathrooms={property.bathrooms}
                    propertyArea={property.area_m2 || property.surface_area}
                    propertyOperation={property.operation}
                    propertyHasPool={property.has_pool || undefined}
                    propertyHasGarage={property.has_garage || undefined}
                  />
                </div>

                {hasSignal && topArea ? (
                  <div className="glass-premium rounded-2xl p-5 border border-border/40 enter-fade-up" style={{ animationDelay: "620ms" }}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                      Siguiente paso útil
                    </p>
                    <h4 className="mt-2 font-serif text-lg font-semibold text-foreground">
                      No vuelvas a una interfaz genérica
                    </h4>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      Si todavía quieres comparar antes de enviar el formulario, sigue por {topArea.label} y abre más fichas alineadas con esta búsqueda.
                    </p>
                    <div className="mt-4 flex flex-col gap-2">
                      <Link to={`${topArea.href}#live-inventory`}>
                        <Button variant="outline" className="w-full border-primary/35 hover:bg-primary/10">
                          Seguir por {topArea.label}
                        </Button>
                      </Link>
                      <button
                        type="button"
                        onClick={scrollToForm}
                        className="text-sm font-medium text-primary underline-offset-4 transition hover:underline"
                      >
                        O quedarme en esta ficha y enviar interés
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Trust signals */}
                <div className="grid grid-cols-3 gap-3 enter-fade-up" style={{ animationDelay: "700ms" }}>
                  {trustSignals.map(({ icon: Icon, label }) => (
                    <div key={label} className="glass-premium rounded-xl p-3 text-center">
                      <Icon className="w-5 h-5 text-primary mx-auto mb-1.5" />
                      <p className="text-[10px] text-muted-foreground whitespace-pre-line leading-tight">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ SIMILAR ═══════════════ */}
      {alternativeHomes.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-12 reveal-up">
              <p className="text-primary font-medium tracking-[0.2em] uppercase text-sm mb-3">
                Descubre más
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold">{alternativeTitle}</h2>
              <p className="mt-4 mx-auto max-w-2xl text-sm leading-7 text-muted-foreground">
                {alternativeDescription}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {alternativeHomes.map((p, i) => (
                <PropertyCard key={p.id} property={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ MOBILE FLOATING CTA ═══════════════ */}
      {showMobileCTA && (
          <div className="fixed bottom-4 left-4 right-4 z-50 lg:hidden enter-fade-up">
            <button
              onClick={scrollToForm}
              className="w-full bg-gradient-gold text-primary-foreground font-bold py-4 rounded-2xl flex items-center justify-center gap-3 text-lg shadow-2xl shimmer-gold pulse-ring"
            >
              <Send className="w-5 h-5" />
              Me interesa esta vivienda
            </button>
          </div>
        )}

      {/* ═══════════════ FULLSCREEN LIGHTBOX ═══════════════ */}
      {lightboxOpen && (
          <div
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center enter-fade-in"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full glass-dark flex items-center justify-center text-white hover:bg-white/20 z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full glass-dark flex items-center justify-center text-white hover:bg-white/20 z-10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <div className="relative watermark-full" onClick={(e) => e.stopPropagation()}>
              <div
                key={currentImage}
                role="img"
                aria-label={`${property.title} - ${currentImage + 1}`}
                className="max-h-[85vh] max-w-[90vw] bg-contain bg-center bg-no-repeat rounded-xl enter-fade-up"
                style={{
                  backgroundImage: `url(${images[currentImage]})`,
                  width: "90vw",
                  height: "85vh",
                }}
              />
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full glass-dark flex items-center justify-center text-white hover:bg-white/20 z-10"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium">
              {currentImage + 1} / {images.length}
            </div>

            {/* Lightbox thumbnails */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1.5 max-w-[80vw] overflow-x-auto scrollbar-hide px-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setCurrentImage(i); }}
                  className={`w-12 h-9 rounded-md overflow-hidden border-2 transition-all flex-shrink-0 ${
                    i === currentImage ? "border-primary opacity-100" : "border-transparent opacity-40 hover:opacity-70"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

      <Footer />
    </main>
  );
};

export default PropertyDetail;
