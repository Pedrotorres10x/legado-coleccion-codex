import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type Language = "es" | "en" | "fr" | "de";

export const LANGUAGE_LABELS: Record<Language, string> = {
  es: "Español",
  en: "English",
  fr: "Français",
  de: "Deutsch",
};

const SUPPORTED_LANGUAGES: Language[] = ["es", "en", "fr", "de"];

function detectBrowserLanguage(): Language {
  const browserLang = navigator.language?.split("-")[0]?.toLowerCase();
  if (browserLang && SUPPORTED_LANGUAGES.includes(browserLang as Language)) {
    return browserLang as Language;
  }
  // Check navigator.languages
  for (const lang of navigator.languages || []) {
    const code = lang.split("-")[0].toLowerCase();
    if (SUPPORTED_LANGUAGES.includes(code as Language)) {
      return code as Language;
    }
  }
  return "es";
}

function getSavedLanguage(): Language | null {
  try {
    const saved = localStorage.getItem("luxestate_lang");
    if (saved && SUPPORTED_LANGUAGES.includes(saved as Language)) return saved as Language;
  } catch {
    // Ignore localStorage access errors and fall back to browser detection.
  }
  return null;
}

// All translatable strings with Spanish as base
export const BASE_TEXTS: Record<string, string> = {
  // Navbar
  "nav.home": "Inicio",
  "nav.properties": "Propiedades",
  "nav.contact": "Contacto",
  "nav.sell": "¿Quieres vender?",
  "nav.call": "Llámanos",
  // Hero
  "hero.tagline": "Tu boutique inmobiliaria",
  "hero.title1": "Tu nuevo hogar,",
  "hero.title2": "sin complicaciones",
  "hero.desc": "Más de 900 propiedades en la Costa Blanca y una selección exclusiva en destinos internacionales. Nos encargamos de todo: búsqueda, documentación, hipoteca y llaves en mano.",
  "hero.cta1": "Ver propiedades",
  "hero.cta2": "Contactar",
  "hero.socialProof": "Más de 1.500 familias asesoradas",
  "hero.search.type": "Tipo de propiedad",
  "hero.search.zone": "Zona",
  "hero.search.budget": "Presupuesto",
  "hero.search.btn": "Buscar propiedades",
  "hero.search.advisor": "Hablar con un asesor",
  "hero.trust1": "Red de confianza",
  "hero.trust2": "Atención en 4 idiomas",
  "hero.trust3": "Respuesta en < 24h",
  // Featured
  "featured.tag": "Selección exclusiva",
  "featured.title": "Propiedades",
  "featured.title2": "seleccionadas",
  "featured.prop1.title": "Ático de lujo con vistas panorámicas",
  "featured.prop1.tag": "Destacado",
  "featured.prop2.title": "Villa mediterránea con piscina",
  "featured.prop2.tag": "Exclusivo",
  "featured.prop3.title": "Penthouse con terraza privada",
  "featured.prop3.tag": "Nuevo",
  // Stats
  "stats.properties": "Propiedades",
  "stats.clients": "Clientes satisfechos",
  "stats.experience": "Años de experiencia",
  "stats.success": "Tasa de éxito",
  // Why choose us
  "why.tag": "Así de fácil",
  "why.title1": "¿Por qué",
  "why.title2": "elegirnos",
  "why.feat1.title": "Todo resuelto",
  "why.feat1.desc": "NIE, cuenta bancaria, hipoteca, abogados — nos encargamos de cada gestión para que tú solo disfrutes.",
  "why.feat2.title": "Propiedades verificadas",
  "why.feat2.desc": "Cada inmueble pasa por nuestro control de calidad. Solo te mostramos lo que merece tu atención.",
  "why.feat3.title": "Un asesor, tu idioma",
  "why.feat3.desc": "Una persona dedicada que habla tu idioma y te acompaña de principio a fin. Sin intermediarios.",
  "why.feat4.title": "Compra desde casa",
  "why.feat4.desc": "Video visitas, firma digital y poder notarial. Puedes comprar sin moverte de tu sofá.",
  // Legal services for foreigners
  "legal.tag": "Servicio integral",
  "legal.title1": "Te acompañamos en",
  "legal.title2": "cada paso",
  "legal.desc": "Comprar en España es sencillo con el equipo adecuado. Tú decides, nosotros resolvemos.",
  "legal.s1.title": "Obtención del NIE",
  "legal.s1.desc": "Lo gestionamos por ti. Olvídate del papeleo y los trámites.",
  "legal.s2.title": "Cuenta bancaria",
  "legal.s2.desc": "Te acompañamos al banco. En una mañana queda resuelto.",
  "legal.s3.title": "Abogados expertos",
  "legal.s3.desc": "Despachos de referencia en Alicante, especializados en compradores internacionales.",
  "legal.s4.title": "Firma digital",
  "legal.s4.desc": "Firma contratos desde cualquier lugar. Sin desplazamientos, con total validez legal.",
  "legal.s5.title": "Traducción jurada",
  "legal.s5.desc": "Todos tus documentos traducidos oficialmente. Sin barreras.",
  "legal.footer": "Trabajamos con los mejores despachos de abogados de la provincia de Alicante. Tú solo tienes que elegir tu casa.",
  // Mortgage
  "mortgage.tag": "Planifica tu inversión",
  "mortgage.title": "Calculadora de",
  "mortgage.title2": "Hipoteca",
  "mortgage.desc": "Simula tu cuota mensual y descubre cuánto necesitas para tu próximo hogar.",
  "mortgage.price": "Precio de la vivienda",
  "mortgage.down": "Entrada",
  "mortgage.interest": "Tipo de interés (%)",
  "mortgage.years": "Plazo (años)",
  "mortgage.monthly": "Tu cuota mensual",
  "mortgage.month": "/ mes",
  "mortgage.financed": "Importe financiado",
  "mortgage.downPayment": "Entrada",
  "mortgage.totalInterest": "Total intereses",
  "mortgage.totalPay": "Total a pagar",
  // Testimonials
  "test.tag": "Testimonios",
  "test.title1": "Lo que dicen nuestros",
  "test.title2": "clientes",
  "test.t1.name": "María García",
  "test.t1.role": "Compró un ático en Benidorm",
  "test.t1.text": "No vivo en España y pensaba que comprar sería complicado. Legado Inmobiliaria se encargó de todo: NIE, banco, abogado, firma. Yo solo elegí la casa.",
  "test.t2.name": "James Wilson",
  "test.t2.role": "Compró un chalet en Finestrat",
  "test.t2.text": "Profesionalidad absoluta. Me hicieron video visitas, firmé digitalmente y solo viajé para recoger las llaves. Increíblemente fácil.",
  "test.t3.name": "Sophie Dubois",
  "test.t3.role": "Compró un piso en Torrevieja",
  "test.t3.text": "Desde la primera llamada me sentí segura. Todo fluyó con naturalidad. Mi asesora hablaba francés y resolvió cada duda al momento.",
  // Footer
  "footer.desc": "Tu boutique inmobiliaria. Hacemos que comprar en la Costa Blanca sea fácil, seguro y sin estrés.",
  "footer.nav": "Navegación",
  "footer.propTypes": "Propiedades",
  "footer.type1": "Pisos y apartamentos",
  "footer.type2": "Casas y chalets",
  "footer.type3": "Villas de lujo",
  "footer.type4": "Áticos y dúplex",
  "footer.contact": "Contacto",
  "footer.rights": "Todos los derechos reservados.",
  // Blog
  "blog.tag": "Artículos expertos",
  "blog.title": "El",
  "blog.title2": "Diario",
  "blog.desc": "Guías prácticas, consejos legales y todo lo que necesitas para comprar con confianza en la Costa Blanca.",
  "blog.all": "Todos",
  "blog.readArticle": "Leer artículo",
  "blog.readMore": "Leer más",
  "blog.comingSoon": "Próximamente",
  "blog.comingDesc": "Estamos preparando contenido experto para ti.",
  "blog.ctaTitle1": "¿Listo para encontrar tu",
  "blog.ctaTitle2": "hogar ideal",
  "blog.ctaDesc": "Explora más de 900 propiedades exclusivas de obra nueva en la Costa Blanca de España.",
  "blog.ctaBtn": "Explorar propiedades",
  "blog.backToJournal": "Volver al blog",
  "blog.minRead": "min de lectura",
  "blog.articleCtaTitle1": "Tu hogar ideal en la",
  "blog.articleCtaTitle2": "Costa Blanca",
  "blog.articleCtaTitle3": "te espera",
  "blog.articleCtaDesc": "Descubre más de 900 propiedades exclusivas de obra nueva, seleccionadas por nuestros expertos locales.",
  "blog.notFound": "Artículo no encontrado",
  // Newsletter
  "newsletter.title": "Recibe las mejores oportunidades",
  "newsletter.desc": "Suscríbete y recibe propiedades exclusivas, guías de compra y novedades del mercado.",
  "newsletter.placeholder": "Tu email",
  "newsletter.btn": "Suscribirme",
  "newsletter.success": "¡Suscripción confirmada!",
  "newsletter.successDesc": "Recibirás nuestras mejores oportunidades en tu email.",
  "newsletter.error": "No se pudo completar la suscripción.",
  "newsletter.already": "Ya estás suscrito a nuestra newsletter.",
  "newsletter.blogBanner": "¿Te ha gustado este artículo?",
  "newsletter.blogBannerDesc": "Recibe más contenido como este directamente en tu bandeja de entrada.",
  "newsletter.consent": "Deseo recibir novedades y propiedades por email",
  // Thank you page
  "thanks.tag": "Solicitud recibida",
  "thanks.title": "¡Gracias por contactarnos!",
  "thanks.desc": "Un asesor personal te contactará en menos de 24 horas. Nos encargamos de todo para que tú solo tengas que decidir.",
  "thanks.nextTitle": "¿Qué ocurrirá ahora?",
  "thanks.step1": "Un asesor experto revisará tu solicitud y seleccionará propiedades que encajen con tus preferencias.",
  "thanks.step2": "Te contactaremos por email o teléfono en menos de 24 horas laborables.",
  "thanks.step3": "Organizaremos visitas virtuales o presenciales a las propiedades que más te interesen.",
  "thanks.ctaProperties": "Seguir explorando propiedades",
  "thanks.urgentText": "¿Es urgente? Llámanos directamente al",
  // Purpose + Team section
  "purpose.tag": "Nuestro propósito",
  "purpose.title1": "Que la única decisión difícil",
  "purpose.title2": "sea elegir las vistas",
  "purpose.desc": "Comprar una casa debería sentirse como llegar a casa. Esa primera mañana en tu terraza, con el café entre las manos y el Mediterráneo delante — ese momento es el que nos mueve. Existimos para encargarnos de todo lo demás, para que tú solo tengas que vivirlo.",
  "purpose.team.intro": "Y detrás de cada llave entregada, hay un equipo que lo hace posible.",
  "purpose.team.title": "Nuestro equipo",
  "purpose.member1.bio": "Con amplia experiencia en el sector, acompaña a cada cliente con dedicación y rigor profesional.",
  "purpose.member2.bio": "Organiza cada operación al detalle para que el proceso sea fluido de principio a fin.",
  "purpose.member1.name": "José Manuel Rodríguez",
  "purpose.member1.role": "Consultor inmobiliario",
  "purpose.member2.name": "Lorena Rivero",
  "purpose.member2.role": "Coordinadora",
  "purpose.member3.name": "Pedro Torres",
  "purpose.member3.role": "Director comercial · Fundador",
  "purpose.founder.hook": "En 2011, cuando casi todo el mundo buscaba refugio, yo hice lo contrario.",
  "purpose.founder.body1": "Después de 15 años en banca, con una carrera estable y un despacho cómodo, decidí salir en el peor momento posible: en plena crisis.\nNo fue un acto de valentía romántica.\nFue una convicción.",
  "purpose.founder.body2": "Había visto demasiadas decisiones importantes tomadas con miedo.\nDemasiadas familias desorientadas en uno de los momentos financieros más delicados de su vida.\nY entendí algo: la vivienda no es un producto. Es patrimonio. Es historia. Es futuro.",
  "purpose.founder.body3": "Soy economista. Tengo un MBA, un máster en Project Management, la designación CRS y pertenezco a RAICV.\nPero nada de eso explica realmente por qué hago lo que hago.",
  "purpose.founder.body4": "Lo que me marcó fueron aquellos años de crisis.\nAprendí que los mercados suben y bajan.\nQue los titulares cambian.\nQue el ruido es constante.\nPero que las personas siempre necesitan lo mismo: claridad, dirección y alguien que les diga la verdad, incluso cuando no es lo más cómodo.",
  "purpose.founder.body5": "Cuando fundé mi propia empresa no quería abrir «otra inmobiliaria».\nQuería construir un modelo distinto.\nMás estratégico. Más preparado. Más humano.",
  "purpose.founder.body6": "Por eso me obsesioné con formarme.\nMarketing, negociación, psicología de ventas, inteligencia artificial, tecnología aplicada al sector.\nPorque el mercado cambia. Y quien representa patrimonio ajeno tiene la obligación de evolucionar.",
  "purpose.founder.body7": "Pero hay algo que no cambia.\n\nEl trabajo bien hecho.\nLa llamada que se devuelve.\nLa explicación que se da con calma.\nLa estrategia que se prepara como si fuera para tu propia casa.",
  "purpose.founder.body8": "Hoy combino análisis financiero, visión estratégica y tecnología avanzada.\nPero lo que realmente me diferencia no es la formación.\n\nEs que me importan las personas.",
  "purpose.founder.body9": "Me importa que un propietario duerma tranquilo después de firmar.\nMe importa que entienda cada paso.\nMe importa que sienta que no está improvisando.",
  "purpose.founder.body10": "He vivido ciclos buenos y ciclos duros.\nHe negociado en euforia y en miedo.\nY si algo tengo claro es esto:",
  "purpose.founder.quote": "Las operaciones se cierran con técnica.\nLa confianza se construye con coherencia.",
  "purpose.founder.closing": "No trabajo para vender propiedades.\nTrabajo para que cada decisión tenga sentido.\n\nY eso, en este sector, marca la diferencia.",
  "purpose.founder.readMore": "Leer mi historia",
  "purpose.founder.readLess": "Cerrar",
  "purpose.p1.title": "Conocemos cada rincón",
  "purpose.p1.desc": "15 años en la Costa Blanca y acceso a propiedades seleccionadas en destinos internacionales. Sabemos dónde sale el mejor sol y qué calles tienen vida de barrio.",
  "purpose.p2.title": "Hablamos tu idioma",
  "purpose.p2.desc": "Español, inglés, francés, alemán. Nos entendemos sin esfuerzo, y eso lo cambia todo.",
  "purpose.p3.title": "Solo tienes que elegir",
  "purpose.p3.desc": "Búsqueda, papeles, hipoteca, llaves. Nos encargamos de cada paso para que tu única tarea sea decidir.",
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isTranslating: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const CACHE_KEY = "luxestate_translations";

function getCachedTranslations(lang: Language): Record<string, string> | null {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY}_${lang}`);
    if (cached) return JSON.parse(cached);
  } catch {
    // Ignore malformed or inaccessible cache entries.
  }
  return null;
}

function setCachedTranslations(lang: Language, translations: Record<string, string>) {
  try {
    localStorage.setItem(`${CACHE_KEY}_${lang}`, JSON.stringify(translations));
  } catch {
    // Ignore localStorage write failures.
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es");
  const [translations, setTranslations] = useState<Record<string, string>>(BASE_TEXTS);
  const [isTranslating, setIsTranslating] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const applyLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("luxestate_lang", lang);
    } catch {
      // Ignore localStorage write failures.
    }

    if (lang === "es") {
      setTranslations(BASE_TEXTS);
      return;
    }

    const cached = getCachedTranslations(lang);
    if (cached) {
      setTranslations(cached);
      return;
    }

    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke("translate", {
        body: { texts: BASE_TEXTS, targetLang: lang },
      });
      if (error) throw error;
      if (data?.translations) {
        setTranslations(data.translations);
        setCachedTranslations(lang, data.translations);
      }
    } catch (err) {
      console.error("Translation error:", err);
      toast({ title: "Error de traducción", description: "No se pudo traducir. Mostrando en español.", variant: "destructive" });
      setTranslations(BASE_TEXTS);
      setLanguageState("es");
    } finally {
      setIsTranslating(false);
    }
  }, []);

  // Auto-detect on first load
  useEffect(() => {
    if (initialized) return;
    setInitialized(true);
    const saved = getSavedLanguage();
    const detected = saved || detectBrowserLanguage();
    if (detected !== "es") {
      applyLanguage(detected);
    }
  }, [initialized, applyLanguage]);

  const t = useCallback((key: string) => translations[key] || BASE_TEXTS[key] || key, [translations]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: applyLanguage, t, isTranslating }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useTranslation must be used within LanguageProvider");
  return ctx;
}
