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

const LOCALIZED_OVERRIDES: Partial<Record<Language, Record<string, string>>> = {
  en: {
    "featured.tag": "Start with better options",
    "featured.title": "Properties worth",
    "featured.title2": "a real look",
    "nav.home": "Home",
    "nav.properties": "Properties",
    "nav.contact": "Contact",
    "nav.sell": "Thinking of selling?",
    "nav.call": "Call us",
    "hero.tagline": "Your real-estate boutique",
    "hero.title1": "Your next home,",
    "hero.title2": "without the hassle",
    "hero.desc":
      "Over 900 homes across the Costa Blanca, plus a handpicked selection in international destinations. We take care of the full journey: search, paperwork, mortgage support and a true turnkey experience.",
    "hero.cta1": "Browse properties",
    "hero.cta2": "Speak with us",
    "hero.socialProof": "Trusted by more than 1,500 families",
    "hero.search.type": "Property type",
    "hero.search.zone": "Area",
    "hero.search.budget": "Budget",
    "hero.search.btn": "Find properties",
    "hero.search.advisor": "Talk to an advisor",
    "hero.trust1": "Trusted network",
    "hero.trust2": "Support in 4 languages",
    "hero.trust3": "Reply within 24h",
    "why.tag": "Why buyers move forward",
    "why.title1": "Not just more",
    "why.title2": "listings",
    "why.feat1.title": "The hard parts stay organised",
    "why.feat1.desc": "NIE, bank account, mortgage and legal steps. We coordinate the pieces that usually slow buyers down.",
    "why.feat2.title": "Selection before noise",
    "why.feat2.desc": "If everything looks right, nothing is filtered. We help you focus on homes that actually deserve a closer look.",
    "why.feat3.title": "One advisor, clear language",
    "why.feat3.desc": "A dedicated contact who speaks your language and keeps the process understandable from first call to completion.",
    "why.feat4.title": "Remote buying, handled properly",
    "why.feat4.desc": "Video viewings, digital signing and power of attorney options let you move forward without turning distance into friction.",
    "legal.tag": "End-to-end support",
    "legal.title1": "We guide you through",
    "legal.title2": "every step",
    "legal.desc": "Buying in Spain feels straightforward when the right team is beside you. You choose the home, we handle the process.",
    "legal.s1.title": "NIE application",
    "legal.s1.desc": "We sort it out for you, so you can avoid the paperwork and admin headaches.",
    "legal.s2.title": "Spanish bank account",
    "legal.s2.desc": "We guide you through the process so it can be resolved quickly and smoothly.",
    "legal.s3.title": "Specialist property lawyers",
    "legal.s3.desc": "Trusted law firms in Alicante with strong experience helping international buyers.",
    "legal.s4.title": "Digital signing",
    "legal.s4.desc": "Sign documents from wherever you are, with full legal validity and no unnecessary travel.",
    "legal.s5.title": "Certified translation",
    "legal.s5.desc": "Officially translated paperwork, with no language barrier slowing things down.",
    "legal.footer":
      "We work with some of the most respected legal firms in Alicante province. Your only job is to choose the right home.",
    "footer.desc": "Your real-estate boutique on the Costa Blanca. A smoother, safer way to buy in Spain.",
    "blog.desc": "Practical guides, legal insight and market know-how to help you buy on the Costa Blanca with confidence.",
    "blog.ctaTitle1": "Ready to find your",
    "blog.ctaTitle2": "ideal home",
    "blog.ctaDesc": "Explore more than 900 handpicked new-build homes across Spain's Costa Blanca.",
    "blog.articleCtaTitle1": "Your ideal home on the",
    "blog.articleCtaTitle2": "Costa Blanca",
    "blog.articleCtaTitle3": "is waiting",
    "blog.articleCtaDesc": "Browse over 900 exclusive new-build properties selected by our local experts.",
    "newsletter.title": "Get the best opportunities first",
    "newsletter.desc": "Subscribe for exclusive listings, buyer guides and handpicked market updates.",
    "newsletter.btn": "Subscribe",
    "newsletter.success": "You're in",
    "newsletter.successDesc": "We'll send our best opportunities straight to your inbox.",
    "newsletter.blogBanner": "Enjoyed this article?",
    "newsletter.blogBannerDesc": "Get more content like this delivered directly to your inbox.",
    "thanks.tag": "Request received",
    "thanks.title": "Thank you for getting in touch",
    "thanks.desc": "A personal advisor will contact you within 24 hours. We handle the complexity so you can focus on the decision.",
    "purpose.tag": "Why we do this",
    "purpose.title1": "The only hard decision should be",
    "purpose.title2": "choosing the view",
    "purpose.desc":
      "Buying a home should feel like arriving where you belong. That first coffee on your terrace, with the Mediterranean in front of you, is the moment we work towards. We take care of everything else so you can simply live it.",
    "purpose.team.intro": "Behind every set of keys we hand over, there is a team making it happen.",
    "purpose.member1.bio": "With solid experience in the sector, he supports every client with dedication and professional rigour.",
    "purpose.member2.bio": "She coordinates each transaction down to the last detail so the process feels smooth from start to finish.",
    "purpose.member1.role": "Property consultant",
    "purpose.member2.role": "Operations coordinator",
    "purpose.member3.role": "Sales Director · Founder",
    "purpose.founder.hook": "In 2011, while almost everyone else was looking for shelter, I chose the opposite.",
    "purpose.founder.body1":
      "After 15 years in banking, with a stable career and a comfortable office, I decided to walk away at what seemed like the worst possible time: right in the middle of a crisis.\nIt was not a romantic act of bravery.\nIt was conviction.",
    "purpose.founder.body2":
      "I had seen too many life-changing decisions made from fear.\nToo many families feeling lost at one of the most delicate financial moments of their lives.\nAnd I understood something important: a home is not a product. It is wealth. It is memory. It is future.",
    "purpose.founder.body3":
      "I am an economist. I hold an MBA, a master's degree in Project Management, the CRS designation, and I am a member of RAICV.\nBut none of that truly explains why I do what I do.",
    "purpose.founder.body4":
      "What shaped me were those years of crisis.\nI learned that markets rise and fall.\nHeadlines change.\nNoise never stops.\nBut people always need the same things: clarity, direction and someone willing to tell them the truth, even when it is not the easiest thing to hear.",
    "purpose.founder.body5":
      "When I founded my own company, I did not want to open just another estate agency.\nI wanted to build something different.\nMore strategic. Better prepared. More human.",
    "purpose.founder.body6":
      "That is why I became obsessed with learning.\nMarketing, negotiation, sales psychology, artificial intelligence, technology applied to real estate.\nBecause the market changes, and anyone entrusted with someone else's assets has a duty to evolve.",
    "purpose.founder.body7":
      "But there is one thing that never changes.\n\nWork done properly.\nReturning the call.\nExplaining things calmly.\nDesigning the strategy as if it were for your own home.",
    "purpose.founder.body8":
      "Today I combine financial analysis, strategic thinking and advanced technology.\nBut what truly sets me apart is not my training.\n\nIt is that I genuinely care about people.",
    "purpose.founder.body9":
      "I care that an owner sleeps well after signing.\nI care that they understand every step.\nI care that they feel they are not improvising with something too important to leave to chance.",
    "purpose.founder.body10":
      "I have lived through strong cycles and difficult ones.\nI have negotiated in moments of euphoria and in moments of fear.\nAnd if there is one thing I know, it is this:",
    "purpose.founder.quote":
      "Deals are closed with technique.\nTrust is built through consistency.",
    "purpose.founder.closing":
      "I do not work to sell properties.\nI work to make sure every decision makes sense.\n\nAnd in this industry, that changes everything.",
    "purpose.founder.readMore": "Read my story",
    "purpose.founder.readLess": "Close",
    "purpose.p1.title": "We know every corner",
    "purpose.p1.desc":
      "With 15 years on the Costa Blanca and access to carefully selected homes abroad, we know where the light is best and which streets still feel like a neighbourhood.",
    "purpose.p2.title": "We speak your language",
    "purpose.p2.desc": "Spanish, English, French and German. When communication feels effortless, everything else becomes easier.",
    "purpose.p3.title": "You only need to choose",
    "purpose.p3.desc": "Search, paperwork, mortgage, keys. We handle every step so your only task is deciding.",
  },
  fr: {
    "nav.home": "Accueil",
    "nav.properties": "Biens",
    "nav.contact": "Contact",
    "nav.sell": "Vous souhaitez vendre ?",
    "nav.call": "Appelez-nous",
    "hero.tagline": "Votre boutique immobilière",
    "hero.title1": "Votre futur chez-vous,",
    "hero.title2": "sans les complications",
    "hero.desc":
      "Plus de 900 biens sur la Costa Blanca et une sélection exclusive à l'international. Recherche, démarches, financement, remise des clés: nous orchestrons tout de A à Z.",
    "hero.cta1": "Voir les biens",
    "hero.cta2": "Nous contacter",
    "hero.socialProof": "Plus de 1 500 familles déjà accompagnées",
    "hero.search.type": "Type de bien",
    "hero.search.zone": "Secteur",
    "hero.search.budget": "Budget",
    "hero.search.btn": "Rechercher un bien",
    "hero.search.advisor": "Parler à un conseiller",
    "hero.trust1": "Réseau de confiance",
    "hero.trust2": "Accompagnement en 4 langues",
    "hero.trust3": "Réponse sous 24 h",
    "why.tag": "Tout devient plus simple",
    "why.title1": "Pourquoi nous",
    "why.title2": "choisir",
    "why.feat1.title": "On s'occupe de tout",
    "why.feat1.desc": "NIE, compte bancaire, financement, avocat: nous coordonnons chaque étape pour vous simplifier la vie.",
    "why.feat2.title": "Biens rigoureusement sélectionnés",
    "why.feat2.desc": "Chaque propriété passe par notre propre filtre qualité. Nous ne vous présentons que ce qui mérite vraiment votre attention.",
    "why.feat3.title": "Un seul conseiller, dans votre langue",
    "why.feat3.desc": "Un interlocuteur dédié qui parle votre langue et vous accompagne du premier échange jusqu'à la signature.",
    "why.feat4.title": "Acheter à distance",
    "why.feat4.desc": "Visites vidéo, signature électronique, procuration: vous pouvez acheter sereinement, même sans vous déplacer.",
    "legal.tag": "Accompagnement global",
    "legal.title1": "Nous sommes à vos côtés",
    "legal.title2": "à chaque étape",
    "legal.desc": "Acheter en Espagne devient simple quand on est bien entouré. Vous choisissez le bien, nous gérons le reste.",
    "legal.s1.title": "Obtention du NIE",
    "legal.s1.desc": "Nous nous en chargeons pour vous afin de vous éviter les démarches administratives.",
    "legal.s2.title": "Compte bancaire espagnol",
    "legal.s2.desc": "Nous vous accompagnons pour que tout soit réglé rapidement et sereinement.",
    "legal.s3.title": "Avocats spécialisés",
    "legal.s3.desc": "Des cabinets de référence à Alicante, habitués à défendre les intérêts des acheteurs internationaux.",
    "legal.s4.title": "Signature à distance",
    "legal.s4.desc": "Signez vos documents où que vous soyez, avec une pleine validité juridique.",
    "legal.s5.title": "Traduction assermentée",
    "legal.s5.desc": "Des documents traduits officiellement pour avancer sans friction ni zone d'ombre.",
    "legal.footer":
      "Nous travaillons avec certains des meilleurs cabinets d'avocats de la province d'Alicante. Il ne vous reste qu'à choisir votre maison.",
    "footer.desc": "Votre boutique immobilière sur la Costa Blanca. Une façon plus fluide, plus sûre et plus sereine d'acheter en Espagne.",
    "blog.desc": "Guides concrets, éclairage juridique et conseils de terrain pour acheter sur la Costa Blanca en toute confiance.",
    "newsletter.title": "Recevez les meilleures opportunités",
    "newsletter.desc": "Inscrivez-vous pour recevoir des biens exclusifs, des conseils d'achat et les évolutions du marché.",
    "thanks.title": "Merci de nous avoir contactés",
    "thanks.desc": "Un conseiller dédié vous recontactera sous 24 heures. Nous gérons la complexité pour que vous puissiez avancer l'esprit tranquille.",
    "purpose.tag": "Notre raison d'être",
    "purpose.title1": "La seule vraie difficulté devrait être",
    "purpose.title2": "de choisir la vue",
    "purpose.desc":
      "Acheter un bien devrait ressembler à une évidence. Ce premier café sur votre terrasse, face à la Méditerranée, c'est ce moment-là que nous poursuivons. Pour tout le reste, nous sommes là.",
    "purpose.team.intro": "Derrière chaque remise de clés, il y a une équipe qui rend tout cela possible.",
    "purpose.member1.bio": "Fort d'une solide expérience du secteur, il accompagne chaque client avec exigence et implication.",
    "purpose.member2.bio": "Elle orchestre chaque opération dans le détail pour que tout avance avec fluidité du début à la fin.",
    "purpose.member1.role": "Conseiller immobilier",
    "purpose.member2.role": "Coordinatrice",
    "purpose.member3.role": "Directeur commercial · Fondateur",
    "purpose.founder.hook": "En 2011, alors que presque tout le monde cherchait à se mettre à l'abri, j'ai choisi de faire l'inverse.",
    "purpose.founder.body1":
      "Après 15 années dans la banque, avec une carrière stable et un bureau confortable, j'ai décidé de partir au moment qui semblait le pire: en pleine crise.\nCe n'était pas un geste romantique de courage.\nC'était une conviction.",
    "purpose.founder.body2":
      "J'avais vu trop de décisions importantes prises sous l'effet de la peur.\nTrop de familles désorientées à l'un des moments financiers les plus sensibles de leur vie.\nEt j'ai compris quelque chose d'essentiel: le logement n'est pas un produit. C'est du patrimoine. C'est une histoire. C'est un avenir.",
    "purpose.founder.body3":
      "Je suis économiste. J'ai un MBA, un master en Project Management, la désignation CRS et je fais partie de la RAICV.\nMais rien de tout cela n'explique vraiment pourquoi je fais ce métier.",
    "purpose.founder.body4":
      "Ce qui m'a façonné, ce sont ces années de crise.\nJ'y ai appris que les marchés montent et descendent.\nQue les titres changent.\nQue le bruit ne s'arrête jamais.\nMais que les personnes ont toujours besoin des mêmes repères: de la clarté, de la direction et de quelqu'un capable de dire la vérité, même lorsqu'elle n'est pas la plus confortable.",
    "purpose.founder.body5":
      "Quand j'ai créé ma propre entreprise, je ne voulais pas ouvrir une agence immobilière de plus.\nJe voulais construire un autre modèle.\nPlus stratégique. Mieux préparé. Plus humain.",
    "purpose.founder.body6":
      "C'est pour cela que je me suis passionné pour la formation.\nMarketing, négociation, psychologie de la vente, intelligence artificielle, technologie appliquée au secteur.\nParce que le marché évolue, et que celui qui représente le patrimoine des autres a le devoir d'évoluer aussi.",
    "purpose.founder.body7":
      "Mais il y a une chose qui ne change pas.\n\nLe travail bien fait.\nLe rappel que l'on n'oublie pas.\nL'explication donnée avec calme.\nLa stratégie préparée comme s'il s'agissait de votre propre maison.",
    "purpose.founder.body8":
      "Aujourd'hui, je combine analyse financière, vision stratégique et technologie avancée.\nMais ce qui me distingue vraiment, ce n'est pas ma formation.\n\nC'est l'importance que j'accorde aux personnes.",
    "purpose.founder.body9":
      "Je veux qu'un propriétaire dorme sereinement après la signature.\nJe veux qu'il comprenne chaque étape.\nJe veux qu'il sente qu'il n'improvise pas lorsqu'il s'agit de quelque chose d'aussi important.",
    "purpose.founder.body10":
      "J'ai connu des cycles favorables et des périodes plus dures.\nJ'ai négocié dans l'euphorie comme dans la peur.\nEt s'il y a une chose dont je suis certain, c'est celle-ci:",
    "purpose.founder.quote":
      "Une opération se conclut avec de la méthode.\nLa confiance, elle, se construit par la cohérence.",
    "purpose.founder.closing":
      "Je ne travaille pas pour vendre des biens.\nJe travaille pour que chaque décision ait du sens.\n\nEt dans ce secteur, cela change tout.",
    "purpose.founder.readMore": "Lire mon histoire",
    "purpose.founder.readLess": "Fermer",
    "purpose.p1.title": "Nous connaissons le terrain",
    "purpose.p1.desc":
      "Avec 15 ans d'expérience sur la Costa Blanca et un accès à des biens soigneusement choisis à l'international, nous savons où se trouvent les vraies opportunités.",
    "purpose.p2.title": "Nous parlons votre langue",
    "purpose.p2.desc": "Espagnol, anglais, français, allemand. Quand tout est limpide, chaque décision devient plus simple.",
    "purpose.p3.title": "Vous n'avez plus qu'à choisir",
    "purpose.p3.desc": "Recherche, démarches, financement, remise des clés: nous pilotons chaque étape pour vous.",
  },
  de: {
    "nav.home": "Start",
    "nav.properties": "Immobilien",
    "nav.contact": "Kontakt",
    "nav.sell": "Moechten Sie verkaufen?",
    "nav.call": "Jetzt anrufen",
    "hero.tagline": "Ihre Immobilienboutique",
    "hero.title1": "Ihr neues Zuhause,",
    "hero.title2": "ganz ohne Umwege",
    "hero.desc":
      "Mehr als 900 Immobilien an der Costa Blanca und eine exklusive Auswahl an internationalen Standorten. Suche, Unterlagen, Finanzierung und Schluesseluebergabe: Wir begleiten den gesamten Prozess.",
    "hero.cta1": "Immobilien ansehen",
    "hero.cta2": "Kontakt aufnehmen",
    "hero.socialProof": "Mehr als 1.500 Familien erfolgreich begleitet",
    "hero.search.type": "Immobilienart",
    "hero.search.zone": "Lage",
    "hero.search.budget": "Budget",
    "hero.search.btn": "Immobilien finden",
    "hero.search.advisor": "Mit einem Berater sprechen",
    "hero.trust1": "Vertrauensvolles Netzwerk",
    "hero.trust2": "Beratung in 4 Sprachen",
    "hero.trust3": "Antwort innerhalb von 24 Std.",
    "why.tag": "Darum fuehlt es sich leicht an",
    "why.title1": "Warum",
    "why.title2": "mit uns",
    "why.feat1.title": "Alles aus einer Hand",
    "why.feat1.desc": "NIE, Bankkonto, Finanzierung, Rechtsberatung: Wir koordinieren jeden Schritt, damit Sie sich auf das Wesentliche konzentrieren koennen.",
    "why.feat2.title": "Sorgfaeltig gepruefte Immobilien",
    "why.feat2.desc": "Jede Immobilie durchlaeuft unseren eigenen Qualitaetsfilter. Wir zeigen Ihnen nur, was Ihre Zeit wirklich wert ist.",
    "why.feat3.title": "Ein Ansprechpartner, Ihre Sprache",
    "why.feat3.desc": "Eine feste Bezugsperson, die Ihre Sprache spricht und Sie vom ersten Gespraech bis zum Abschluss begleitet.",
    "why.feat4.title": "Kauf aus der Ferne",
    "why.feat4.desc": "Videobesichtigungen, digitale Unterschrift und Vollmacht machen einen sicheren Immobilienkauf auch aus dem Ausland moeglich.",
    "legal.tag": "Rundum-Begleitung",
    "legal.title1": "Wir begleiten Sie",
    "legal.title2": "Schritt fuer Schritt",
    "legal.desc": "Mit dem richtigen Team an Ihrer Seite wird der Immobilienkauf in Spanien deutlich einfacher. Sie waehlen die Immobilie, wir kuemmern uns um den Rest.",
    "legal.s1.title": "NIE beantragen",
    "legal.s1.desc": "Wir uebernehmen die Abwicklung, damit Sie sich nicht mit Formularen und Behoerdengaengen aufhalten muessen.",
    "legal.s2.title": "Spanisches Bankkonto",
    "legal.s2.desc": "Wir begleiten den Prozess, damit alles schnell und reibungslos erledigt ist.",
    "legal.s3.title": "Spezialisierte Anwaelte",
    "legal.s3.desc": "Erfahrene Kanzleien in Alicante mit klarem Fokus auf internationale Immobilienkaeufer.",
    "legal.s4.title": "Digitale Unterschrift",
    "legal.s4.desc": "Unterzeichnen Sie Unterlagen von ueberall aus, rechtsgueltig und ohne unnoetige Reisen.",
    "legal.s5.title": "Beglaubigte Uebersetzung",
    "legal.s5.desc": "Offiziell uebersetzte Dokumente fuer einen klaren und reibungslosen Ablauf.",
    "legal.footer":
      "Wir arbeiten mit renommierten Kanzleien in der Provinz Alicante zusammen. Sie muessen nur noch die passende Immobilie waehlen.",
    "footer.desc": "Ihre Immobilienboutique an der Costa Blanca. Ein sicherer, klarer und entspannter Weg zum Immobilienkauf in Spanien.",
    "blog.desc": "Praxisnahe Ratgeber, rechtliche Orientierung und Marktwissen fuer einen sicheren Immobilienkauf an der Costa Blanca.",
    "newsletter.title": "Die besten Chancen zuerst erhalten",
    "newsletter.desc": "Abonnieren Sie exklusive Immobilien, Kaufguides und sorgfaeltig ausgewaehlte Marktupdates.",
    "thanks.title": "Vielen Dank fuer Ihre Anfrage",
    "thanks.desc": "Ein persoenlicher Berater meldet sich innerhalb von 24 Stunden bei Ihnen. Wir uebernehmen die Komplexitaet, damit Sie sich auf die Entscheidung konzentrieren koennen.",
    "purpose.tag": "Unser Antrieb",
    "purpose.title1": "Die einzige schwierige Entscheidung sollte sein,",
    "purpose.title2": "den Ausblick zu waehlen",
    "purpose.desc":
      "Ein Immobilienkauf sollte sich so anfuehlen, als wuerden Sie ankommen. Dieser erste Kaffee auf Ihrer Terrasse mit Blick aufs Mittelmeer ist der Moment, auf den wir hinarbeiten. Um alles andere kuemmern wir uns.",
    "purpose.team.intro": "Hinter jeder Schluesseluebergabe steht ein Team, das all das moeglich macht.",
    "purpose.member1.bio": "Mit fundierter Branchenerfahrung begleitet er jeden Kunden mit Engagement und professioneller Sorgfalt.",
    "purpose.member2.bio": "Sie organisiert jede Transaktion bis ins Detail, damit der gesamte Ablauf vom Anfang bis zum Ende rund wirkt.",
    "purpose.member1.role": "Immobilienberater",
    "purpose.member2.role": "Koordinatorin",
    "purpose.member3.role": "Vertriebsleiter · Gruender",
    "purpose.founder.hook": "Im Jahr 2011, als fast alle nur noch Sicherheit suchten, entschied ich mich fuer den entgegengesetzten Weg.",
    "purpose.founder.body1":
      "Nach 15 Jahren im Bankwesen, mit einer stabilen Laufbahn und einem komfortablen Buero, entschied ich mich genau zum scheinbar unguenstigsten Zeitpunkt zu gehen: mitten in der Krise.\nEs war kein romantischer Akt von Mut.\nEs war Ueberzeugung.",
    "purpose.founder.body2":
      "Ich hatte zu viele wichtige Entscheidungen gesehen, die aus Angst getroffen wurden.\nZu viele Familien, die in einem der sensibelsten finanziellen Momente ihres Lebens orientierungslos waren.\nUnd ich verstand etwas Grundsaetzliches: Wohnen ist kein Produkt. Es ist Vermoegen. Es ist Geschichte. Es ist Zukunft.",
    "purpose.founder.body3":
      "Ich bin Oekonom. Ich habe einen MBA, einen Master in Project Management, die CRS-Auszeichnung und bin Mitglied der RAICV.\nAber all das erklaert noch nicht wirklich, warum ich tue, was ich tue.",
    "purpose.founder.body4":
      "Gepraegt haben mich jene Krisenjahre.\nIch habe gelernt, dass Maerkte steigen und fallen.\nDass Schlagzeilen sich aendern.\nDass das Rauschen nie aufhoert.\nAber Menschen brauchen immer dasselbe: Klarheit, Richtung und jemanden, der die Wahrheit sagt, auch wenn sie nicht bequem ist.",
    "purpose.founder.body5":
      "Als ich mein eigenes Unternehmen gruendete, wollte ich nicht einfach nur eine weitere Immobilienagentur eroefnen.\nIch wollte ein anderes Modell aufbauen.\nStrategischer. Besser vorbereitet. Menschlicher.",
    "purpose.founder.body6":
      "Deshalb habe ich mich regelrecht aufs Lernen fokussiert.\nMarketing, Verhandlung, Verkaufspsychologie, kuenstliche Intelligenz, Technologie fuer die Immobilienbranche.\nDenn der Markt veraendert sich und wer fremdes Vermoegen vertritt, hat die Pflicht, sich mitzuentwickeln.",
    "purpose.founder.body7":
      "Aber eines veraendert sich nie.\n\nSaubere Arbeit.\nDer Rueckruf, der wirklich erfolgt.\nDie ruhige Erklaerung.\nEine Strategie, die so vorbereitet wird, als ginge es um Ihr eigenes Zuhause.",
    "purpose.founder.body8":
      "Heute verbinde ich Finanzanalyse, strategischen Weitblick und moderne Technologie.\nDoch was mich wirklich unterscheidet, ist nicht meine Ausbildung.\n\nEs ist, dass mir Menschen wichtig sind.",
    "purpose.founder.body9":
      "Mir ist wichtig, dass ein Eigentuemer nach der Unterschrift ruhig schlafen kann.\nMir ist wichtig, dass er jeden Schritt versteht.\nMir ist wichtig, dass er spuert, nicht improvisieren zu muessen, wenn so viel auf dem Spiel steht.",
    "purpose.founder.body10":
      "Ich habe starke und schwierige Marktphasen erlebt.\nIch habe in Euphorie und in Angst verhandelt.\nUnd wenn ich eines mit Sicherheit sagen kann, dann das:",
    "purpose.founder.quote":
      "Abschluesse entstehen durch Technik.\nVertrauen entsteht durch Konsequenz.",
    "purpose.founder.closing":
      "Ich arbeite nicht dafuer, Immobilien zu verkaufen.\nIch arbeite dafuer, dass jede Entscheidung Sinn ergibt.\n\nUnd genau das macht in dieser Branche den Unterschied.",
    "purpose.founder.readMore": "Meine Geschichte lesen",
    "purpose.founder.readLess": "Schliessen",
    "purpose.p1.title": "Wir kennen jede Lage",
    "purpose.p1.desc":
      "Mit 15 Jahren Erfahrung an der Costa Blanca und Zugang zu sorgfaeltig ausgewaehlten internationalen Immobilien wissen wir, wo echte Chancen liegen.",
    "purpose.p2.title": "Wir sprechen Ihre Sprache",
    "purpose.p2.desc": "Spanisch, Englisch, Franzoesisch, Deutsch. Wenn die Kommunikation klar ist, wird der gesamte Prozess leichter.",
    "purpose.p3.title": "Sie muessen nur noch waehlen",
    "purpose.p3.desc": "Suche, Unterlagen, Finanzierung, Schluessel: Wir kuemmern uns um jeden Schritt.",
  },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isTranslating: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const TRANSLATION_CACHE_VERSION = "v3";
const CACHE_KEY = `luxestate_translations_${TRANSLATION_CACHE_VERSION}`;

function buildTranslations(lang: Language, translated?: Record<string, string>) {
  return {
    ...BASE_TEXTS,
    ...(translated ?? {}),
    ...(LOCALIZED_OVERRIDES[lang] ?? {}),
  };
}

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
      setTranslations(buildTranslations("es"));
      return;
    }

    const cached = getCachedTranslations(lang);
    if (cached) {
      setTranslations(buildTranslations(lang, cached));
      return;
    }

    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke("translate", {
        body: { texts: BASE_TEXTS, targetLang: lang },
      });
      if (error) throw error;
      if (data?.translations) {
        const merged = buildTranslations(lang, data.translations);
        setTranslations(merged);
        setCachedTranslations(lang, data.translations);
      }
    } catch (err) {
      console.error("Translation error:", err);
      toast({ title: "Error de traducción", description: "No se pudo traducir. Mostrando en español.", variant: "destructive" });
      setTranslations(buildTranslations("es"));
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
