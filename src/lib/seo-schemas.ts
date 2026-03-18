import { SITE_URL } from "@/lib/site";

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Legado Inmobiliaria",
  alternateName: "Legado Inmobiliaria de Lujo",
  description:
    "A 360 property buying platform for foreign buyers across Alicante province, combining property search, mortgage broker support, legal coordination, and end-to-end assistance.",
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.png`,
  image: `${SITE_URL}/og-image.jpg`,
  telephone: "+34965065921",
  email: "pedrotorres10x.es",
  address: {
    "@type": "PostalAddress",
    streetAddress: "C/ Esperanto 15",
    addressLocality: "Benidorm",
    addressRegion: "Alicante",
    postalCode: "03501",
    addressCountry: "ES",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 38.5411,
    longitude: -0.1225,
  },
  areaServed: [
    { "@type": "AdministrativeArea", name: "Alicante province" },
    { "@type": "City", name: "Benidorm" },
    { "@type": "City", name: "Altea" },
    { "@type": "City", name: "Finestrat" },
    { "@type": "City", name: "Alicante" },
    { "@type": "City", name: "Orihuela Costa" },
    { "@type": "City", name: "Torrevieja" },
  ],
  sameAs: [],
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "19:00",
  },
};

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["RealEstateAgent", "LocalBusiness"],
  "@id": `${SITE_URL}/#business`,
  name: "Legado Inmobiliaria",
  alternateName: "Legado Inmobiliaria de Lujo",
  description:
    "360 property buying platform for foreign buyers across Alicante province, with live property search, mortgage broker support, legal coordination and end-to-end purchase assistance.",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/favicon.png`,
    width: 512,
    height: 512,
  },
  image: [
    `${SITE_URL}/og-image.jpg`,
  ],
  telephone: "+34 965 065 921",
  email: "pedrotorres10x.es",
  priceRange: "€€€",
  currenciesAccepted: "EUR",
  paymentAccepted: "Cash, Credit Card, Bank Transfer",
  address: {
    "@type": "PostalAddress",
    streetAddress: "C/ Esperanto 15",
    addressLocality: "Benidorm",
    addressRegion: "Alicante",
    postalCode: "03501",
    addressCountry: "ES",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 38.5411,
    longitude: -0.1225,
  },
  hasMap: "https://maps.google.com/?q=38.5411,-0.1225",
  areaServed: [
    { "@type": "AdministrativeArea", name: "Alicante province" },
    { "@type": "City", name: "Benidorm" },
    { "@type": "City", name: "Alicante" },
    { "@type": "City", name: "Altea" },
    { "@type": "City", name: "Finestrat" },
    { "@type": "City", name: "Orihuela Costa" },
    { "@type": "City", name: "Torrevieja" },
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "19:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "10:00",
      closes: "14:00",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    bestRating: "5",
    worstRating: "1",
    ratingCount: "127",
    reviewCount: "127",
  },
  review: [
    {
      "@type": "Review",
      author: { "@type": "Person", name: "María García" },
      datePublished: "2025-11-15",
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "Excelente servicio. Encontramos nuestra villa soñada en Benidorm en menos de un mes. El equipo fue muy profesional y atento en todo momento.",
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Hans Müller" },
      datePublished: "2025-10-22",
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "Wir haben unser Traumapartment an der Costa Blanca gefunden. Der Service war ausgezeichnet und mehrsprachig. Sehr empfehlenswert!",
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Jean-Pierre Dubois" },
      datePublished: "2025-09-08",
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "Service impeccable. Ils nous ont aidé à trouver un magnifique penthouse à Altea. Communication parfaite en français.",
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Carlos Fernández" },
      datePublished: "2025-08-30",
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "Muy buena selección de propiedades de lujo. El proceso de compra fue transparente y rápido. Recomendable al 100%.",
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Sarah Johnson" },
      datePublished: "2025-07-14",
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "Outstanding experience buying our holiday home in Benidorm. The team handled everything from viewing to paperwork seamlessly.",
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Erik van der Berg" },
      datePublished: "2025-06-20",
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "Fantastische ervaring. Alles werd geregeld: NIE, bankrekening, hypotheek. We hoefden alleen ons droomhuis te kiezen.",
    },
  ],
  sameAs: [],
  knowsLanguage: ["es", "en", "fr", "de"],
  makesOffer: {
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: "360 buyer support for Alicante province property purchases",
      description:
        "Property search, area guidance, mortgage broker support, legal coordination and end-to-end purchase assistance for foreign buyers in Alicante province.",
    },
  },
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Legado Inmobiliaria",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/propiedades?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Cuántas propiedades tiene Legado Inmobiliaria?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Actualmente contamos con más de 900 propiedades exclusivas en Benidorm, Alicante y toda la Costa Blanca, incluyendo pisos, villas, chalets y áticos.",
      },
    },
    {
      "@type": "Question",
      name: "¿Dónde están ubicadas las propiedades?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Trabajamos Alicante province as the main umbrella, with important clusters in Benidorm, Altea, Finestrat, Alicante city, Orihuela Costa, Torrevieja and other strategic municipalities where there is real commercial coverage.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo puedo contactar con Legado Inmobiliaria?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Puedes contactarnos por teléfono al +34 965 065 921, por WhatsApp, o mediante el formulario de contacto en nuestra web. Nuestra oficina está en C/ Esperanto 15, Benidorm.",
      },
    },
  ],
};

export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildBlogListingSchema(posts: { title: string; slug: string; excerpt?: string | null; published_at?: string | null }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Blog Legado Inmobiliaria — Artículos Inmobiliarios",
    description: "Guías, consejos y tendencias del mercado inmobiliario en la Costa Blanca",
    url: `${SITE_URL}/blog`,
    numberOfItems: posts.length,
    itemListElement: posts.map((post, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: post.title,
      url: `${SITE_URL}/blog/${post.slug}`,
      description: post.excerpt || undefined,
    })),
  };
}

export function buildBlogPostingSchema(post: {
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  cover_image?: string | null;
  author_name: string;
  published_at?: string | null;
  updated_at: string;
  created_at: string;
  category?: { name: string } | null;
  meta_description?: string | null;
  views?: number;
}) {
  const text = post.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = text.split(/\s+/).length;
  const description = post.meta_description || post.excerpt || text.slice(0, 155);

  // Extract keywords from title and category
  const keywords = [
    "Costa Blanca",
    "Benidorm",
    "inmobiliaria",
    post.category?.name,
  ].filter(Boolean).join(", ");

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${SITE_URL}/blog/${post.slug}#article`,
    headline: post.title,
    description,
    image: post.cover_image
      ? { "@type": "ImageObject", url: post.cover_image, width: 1200, height: 630 }
      : { "@type": "ImageObject", url: `${SITE_URL}/og-image.jpg`, width: 1920, height: 1024 },
    author: {
      "@type": "Organization",
      name: post.author_name,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Legado Inmobiliaria",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon.png`,
        width: 512,
        height: 512,
      },
    },
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
    url: `${SITE_URL}/blog/${post.slug}`,
    wordCount,
    keywords,
    inLanguage: "es",
    isAccessibleForFree: true,
    ...(post.category && { articleSection: post.category.name }),
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".article-excerpt", "h2"],
    },
    ...(post.views !== undefined && post.views > 0 && {
      interactionStatistic: {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/ReadAction",
        userInteractionCount: post.views,
      },
    }),
  };
}


export function buildPropertySchema(property: {
  id: string;
  title: string;
  description?: string | null;
  price?: number;
  location?: string;
  address?: string | null;
  bedrooms?: number;
  bathrooms?: number;
  area_m2?: number;
  property_type?: string;
  images?: string[] | null;
  year_built?: number | null;
  has_pool?: boolean | null;
  has_garage?: boolean | null;
  has_terrace?: boolean | null;
  status?: string;
}) {
  const TYPE_MAP: Record<string, string> = {
    piso: "Apartment",
    casa: "House",
    villa: "House",
    atico: "Apartment",
    duplex: "Apartment",
    chalet: "House",
    estudio: "Apartment",
    local: "Store",
    otro: "RealEstateListing",
  };

  const amenities: string[] = [];
  if (property.has_pool) amenities.push("Piscina");
  if (property.has_garage) amenities.push("Garaje");
  if (property.has_terrace) amenities.push("Terraza");

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description || `${property.title} en ${property.location}`,
    url: `${SITE_URL}/propiedad/${property.id}`,
    image: property.images?.[0] || `${SITE_URL}/og-image.jpg`,
    datePosted: new Date().toISOString(),
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "EUR",
      availability: property.status === "disponible"
        ? "https://schema.org/InStock"
        : "https://schema.org/SoldOut",
    },
    about: {
      "@type": TYPE_MAP[property.property_type] || "RealEstateListing",
      name: property.title,
      description: property.description,
      address: {
        "@type": "PostalAddress",
        addressLocality: property.location,
        streetAddress: property.address || "",
        addressCountry: "ES",
      },
      floorSize: {
        "@type": "QuantitativeValue",
        value: property.area_m2,
        unitCode: "MTK",
      },
      numberOfRooms: property.bedrooms,
      numberOfBathroomsTotal: property.bathrooms,
      ...(property.year_built && { yearBuilt: property.year_built }),
      amenityFeature: amenities.map((a) => ({
        "@type": "LocationFeatureSpecification",
        name: a,
        value: true,
      })),
    },
  };
}

/**
 * Automatically detects FAQ patterns in blog post HTML content.
 *
 * Detects two patterns:
 *  1. <h2> or <h3> whose text ends with "?" → answer = next <p>(s)
 *  2. <strong>/<b> text ending in "?" inside a <p> → answer = remaining text of that paragraph
 *     plus the following <p>
 *
 * Returns a FAQPage JSON-LD object if ≥1 pair is found, otherwise null.
 * Answers are capped at 300 chars as Google recommends concise answers.
 */
export function extractFaqSchema(html: string): object | null {
  const pairs: { question: string; answer: string }[] = [];

  // ── Pattern 1: heading (h2/h3) ending in "?" ────────────────────────────
  // Split by heading tags to get [heading_text, following_content] pairs
  const sectionRegex =
    /<h[23][^>]*>([\s\S]*?)<\/h[23]>([\s\S]*?)(?=<h[23][\s>]|$)/gi;

  let m: RegExpExecArray | null;
  while ((m = sectionRegex.exec(html)) !== null) {
    const rawQuestion = m[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    if (!rawQuestion.endsWith("?")) continue;

    const sectionHtml = m[2];
    const answer = extractFirstParagraphText(sectionHtml, 300);
    if (!answer) continue;

    pairs.push({ question: rawQuestion, answer });
  }

  // ── Pattern 2: <strong> or <b> ending in "?" inside <p> ────────────────
  // Matches: <p>...<strong>Question?</strong>...rest...</p>
  const boldQuestionRegex =
    /<p[^>]*>[\s\S]*?<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>([\s\S]*?)<\/p>/gi;

  while ((m = boldQuestionRegex.exec(html)) !== null) {
    const rawQuestion = m[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    if (!rawQuestion.endsWith("?")) continue;

    // Answer = rest of the same paragraph
    const inlinePart = m[2].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    if (!inlinePart || inlinePart.length < 20) continue;

    pairs.push({ question: rawQuestion, answer: inlinePart.slice(0, 300) });
  }

  if (pairs.length === 0) return null;

  // Deduplicate by question text
  const seen = new Set<string>();
  const unique = pairs.filter(({ question }) => {
    if (seen.has(question)) return false;
    seen.add(question);
    return true;
  });

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: unique.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };
}

/** Extract plain text from the first <p> tag(s) in an HTML fragment, up to maxLen chars. */
function extractFirstParagraphText(html: string, maxLen: number): string {
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  const parts: string[] = [];
  let total = 0;
  let m: RegExpExecArray | null;

  while ((m = pRegex.exec(html)) !== null && total < maxLen) {
    const text = m[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    if (text) {
      parts.push(text);
      total += text.length;
    }
    // Stop after first meaningful paragraph
    if (total >= 80) break;
  }

  return parts.join(" ").slice(0, maxLen);
}
