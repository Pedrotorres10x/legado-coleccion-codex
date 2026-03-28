const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://tu-dominio.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const TYPE_LABELS: Record<string, string> = {
  piso: "Piso", casa: "Casa", villa: "Villa", atico: "Ático",
  duplex: "Dúplex", chalet: "Chalet", estudio: "Estudio",
  local: "Local", otro: "Otro", adosado: "Adosado",
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const buildPropertySlug = (title: string, city: string, id: string) =>
  `${slugify(`${title} ${city}`)}-${id.replace(/-/g, "").slice(-5)}`;

const getSlugBase = (slug: string) => {
  const parts = slug.split("-");
  const last = parts[parts.length - 1] ?? "";
  return /^[a-f0-9]{4,12}$/i.test(last) ? parts.slice(0, -1).join("-") : slug;
};

const toAbsoluteImageUrl = (image: string) => {
  if (/^https?:\/\//i.test(image)) return image;
  return `${SITE_URL}${image.startsWith("/") ? image : `/${image}`}`;
};

// Crawlers that need OG tags (WhatsApp, Facebook, Twitter, Telegram, etc.)
const CRAWLER_RE = /bot|crawl|spider|slurp|facebookexternalhit|WhatsApp|Twitterbot|TelegramBot|LinkedInBot|Discordbot|Slack/i;

// ── Cached index.html for proxied human requests ─────────────────────────
let cachedIndexHtml: string | null = null;
let cachedIndexAt = 0;
const INDEX_CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function getIndexHtml(): Promise<string> {
  const now = Date.now();
  if (cachedIndexHtml && (now - cachedIndexAt) < INDEX_CACHE_TTL) {
    return cachedIndexHtml;
  }
  const res = await fetch(`${SITE_URL}/index.html`);
  cachedIndexHtml = await res.text();
  cachedIndexAt = now;
  return cachedIndexHtml;
}

// ── Helpers ──────────────────────────────────────────────────────────────

async function lookupSlug(slug: string): Promise<string | null> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/property_slugs?slug=eq.${encodeURIComponent(slug)}&select=property_id&limit=1`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } },
  );
  if (res.ok) {
    const rows = await res.json();
    const propertyId = rows?.[0]?.property_id ?? null;
    if (propertyId) return propertyId;
  }

  const slugParts = slug.split("-");
  const suffix = slugParts[slugParts.length - 1];
  if (!suffix || !/^[a-f0-9]{4,12}$/i.test(suffix)) {
    return null;
  }

  const fallbackUrl = new URL(`${SUPABASE_URL}/functions/v1/crm-proxy`);
  fallbackUrl.searchParams.set("endpoint", "public-properties");
  fallbackUrl.searchParams.set("id_suffix", suffix);

  const fallbackRes = await fetch(fallbackUrl, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!fallbackRes.ok) return null;
  const fallbackData = await fallbackRes.json();
  return fallbackData?.property_id ?? null;
}

async function lookupSlugById(id: string): Promise<string | null> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/property_slugs?property_id=eq.${encodeURIComponent(id)}&select=slug&limit=1`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } },
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return rows?.[0]?.slug ?? null;
}

async function fetchProperty(id: string): Promise<Record<string, unknown> | null> {
  if (!SUPABASE_URL) return null;
  const url = new URL(`${SUPABASE_URL}/functions/v1/crm-proxy`);
  url.searchParams.set("endpoint", "public-properties");
  url.searchParams.set("id", id);
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.property ?? data.properties?.[0] ?? null;
}

async function findPropertyBySlugBase(slug: string): Promise<Record<string, unknown> | null> {
  if (!SUPABASE_URL) return null;

  const targetBase = getSlugBase(slug);
  let page = 1;
  let totalPages = 1;

  do {
    const url = new URL(`${SUPABASE_URL}/functions/v1/crm-proxy`);
    url.searchParams.set("endpoint", "public-properties");
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", "50");

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    const properties = Array.isArray(data?.properties) ? data.properties : [];
    const match = properties.find((property) => {
      const title = String(property?.title ?? "");
      const city = String(property?.city ?? property?.location ?? "");
      const id = String(property?.id ?? "");
      if (!title || !id) return false;
      return getSlugBase(buildPropertySlug(title, city, id)) === targetBase;
    });

    if (match) return match;

    totalPages = Number(data?.total_pages ?? page);
    page += 1;
  } while (page <= totalPages);

  return null;
}

// ── Build OG HTML ────────────────────────────────────────────────────────

function buildOgHtml(property: Record<string, unknown>, canonicalSlug: string): string {
  const title = (property.title as string) ?? "Propiedad";
  const city = ((property.city ?? property.location ?? "") as string);
  const province = ((property.province ?? "") as string);
  const priceNum = property.price as number | undefined;
  const priceStr = priceNum ? `${priceNum.toLocaleString("es-ES")} €` : "";
  const bedrooms = (property.bedrooms as number) ?? 0;
  const bathrooms = (property.bathrooms as number) ?? 0;
  const area = ((property.surface_area ?? property.area_m2 ?? 0) as number);
  const type = TYPE_LABELS[(property.property_type as string) ?? ""] ?? ((property.property_type as string) ?? "");
  const images = (property.images as string[]) ?? [];
  // Skip logo images — use first real property photo
  const image = toAbsoluteImageUrl(
    images.find(img => !img.toLowerCase().includes("/logo."))
      ?? images[0]
      ?? `${SITE_URL}/og-image.jpg`
  );
  const location = [city, province].filter(Boolean).join(", ");

  const pageUrl = `${SITE_URL}/propiedad/${canonicalSlug}`;
  const headline = [type, location ? `en ${location}` : undefined].filter(Boolean).join(" ");
  const facts = [
    priceStr || undefined,
    bedrooms > 0 ? `${bedrooms} dormitorios` : undefined,
    bathrooms > 0 ? `${bathrooms} baños` : undefined,
    area > 0 ? `${area} m²` : undefined,
  ].filter(Boolean);
  const teaser = typeof property.description === "string"
    ? property.description.replace(/\s+/g, " ").trim().slice(0, 150)
    : "";
  const ogTitle = [title, priceStr, "Legado Inmobiliaria"].filter(Boolean).join(" | ");
  const ogDesc = [
    headline || "Propiedad exclusiva en Costa Blanca",
    facts.length ? facts.join(" · ") : undefined,
    teaser || "Una oportunidad singular para compradores que valoran ubicación, imagen y patrimonio.",
  ]
    .filter(Boolean)
    .join(" — ");
  const imageAlt = [title, location, "Legado Inmobiliaria"].filter(Boolean).join(" | ");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${esc(ogTitle)}</title>
  <meta name="description" content="${esc(ogDesc)}" />
  <meta property="og:type" content="product" />
  <meta property="og:site_name" content="Legado Inmobiliaria" />
  <meta property="og:title" content="${esc(ogTitle)}" />
  <meta property="og:description" content="${esc(ogDesc)}" />
  <meta property="og:url" content="${esc(pageUrl)}" />
  <meta property="og:image" content="${esc(image)}" />
  <meta property="og:image:secure_url" content="${esc(image)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${esc(imageAlt)}" />
  <meta property="og:locale" content="es_ES" />
  <meta property="product:price:amount" content="${priceNum ? esc(String(priceNum)) : ""}" />
  <meta property="product:price:currency" content="EUR" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(ogTitle)}" />
  <meta name="twitter:description" content="${esc(ogDesc)}" />
  <meta name="twitter:image" content="${esc(image)}" />
  <meta name="twitter:image:alt" content="${esc(imageAlt)}" />
  <meta name="twitter:url" content="${esc(pageUrl)}" />
  <link rel="canonical" href="${esc(pageUrl)}" />
</head>
<body>
  <p><a href="${esc(pageUrl)}">${esc(ogTitle)}</a></p>
</body>
</html>`;
}

// ── Inject OG tags into index.html for proxied human requests ────────────

function injectOgIntoIndex(indexHtml: string, property: Record<string, unknown>, canonicalSlug: string): string {
  const title = (property.title as string) ?? "Propiedad";
  const city = ((property.city ?? property.location ?? "") as string);
  const province = ((property.province ?? "") as string);
  const priceNum = property.price as number | undefined;
  const priceStr = priceNum ? `${priceNum.toLocaleString("es-ES")} €` : "";
  const bedrooms = (property.bedrooms as number) ?? 0;
  const bathrooms = (property.bathrooms as number) ?? 0;
  const area = ((property.surface_area ?? property.area_m2 ?? 0) as number);
  const type = TYPE_LABELS[(property.property_type as string) ?? ""] ?? ((property.property_type as string) ?? "");
  const images = (property.images as string[]) ?? [];
  const image = toAbsoluteImageUrl(
    images.find(img => !img.toLowerCase().includes("/logo."))
      ?? images[0]
      ?? `${SITE_URL}/og-image.jpg`
  );
  const location = [city, province].filter(Boolean).join(", ");

  const pageUrl = `${SITE_URL}/propiedad/${canonicalSlug}`;
  const headline = [type, location ? `en ${location}` : undefined].filter(Boolean).join(" ");
  const facts = [
    priceStr || undefined,
    bedrooms > 0 ? `${bedrooms} dormitorios` : undefined,
    bathrooms > 0 ? `${bathrooms} baños` : undefined,
    area > 0 ? `${area} m²` : undefined,
  ].filter(Boolean);
  const teaser = typeof property.description === "string"
    ? property.description.replace(/\s+/g, " ").trim().slice(0, 150)
    : "";
  const ogTitle = [title, priceStr, "Legado Inmobiliaria"].filter(Boolean).join(" | ");
  const ogDesc = [
    headline || "Propiedad exclusiva en Costa Blanca",
    facts.length ? facts.join(" · ") : undefined,
    teaser || "Una oportunidad singular para compradores que valoran ubicación, imagen y patrimonio.",
  ]
    .filter(Boolean)
    .join(" — ");
  const imageAlt = [title, location, "Legado Inmobiliaria"].filter(Boolean).join(" | ");

  let html = indexHtml;

  // Replace title
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(ogTitle)}</title>`);

  // Replace meta description
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${esc(ogDesc)}">`
  );

  // Replace OG tags
  html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/g, `<meta property="og:title" content="${esc(ogTitle)}">`);
  html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/g, `<meta property="og:description" content="${esc(ogDesc)}">`);
  html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/g, `<meta property="og:url" content="${esc(pageUrl)}">`);
  html = html.replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/g, `<meta property="og:image" content="${esc(image)}">`);
  html = html.replace(/<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/?>/g, `<meta property="og:image:alt" content="${esc(imageAlt)}">`);
  html = html.replace(/<meta\s+property="og:image:height"\s+content="[^"]*"\s*\/?>/g, `<meta property="og:image:height" content="630">`);
  html = html.replace(/<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/g, `<meta property="og:type" content="product">`);

  // Replace Twitter tags
  html = html.replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/g, `<meta name="twitter:title" content="${esc(ogTitle)}">`);
  html = html.replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/g, `<meta name="twitter:description" content="${esc(ogDesc)}">`);
  html = html.replace(/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/g, `<meta name="twitter:image" content="${esc(image)}">`);
  html = html.replace(/<meta\s+name="twitter:image:alt"\s+content="[^"]*"\s*\/?>/g, `<meta name="twitter:image:alt" content="${esc(imageAlt)}">`);

  // Replace canonical
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${esc(pageUrl)}" />`);

  return html;
}

// ── Main handler ─────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug") ?? "";
  const id = url.searchParams.get("id") ?? "";
  const isProxy = url.searchParams.get("via") === "proxy";

  if (!slug && !id) {
    return new Response("Missing slug or id", { status: 400, headers: corsHeaders });
  }

  const ua = req.headers.get("user-agent") ?? "";
  const isCrawler = CRAWLER_RE.test(ua);

  try {
    let propertyId: string | null = null;
    let canonicalSlug: string = slug;

    if (id) {
      propertyId = id;
      const foundSlug = await lookupSlugById(id);
      canonicalSlug = foundSlug ?? id;
    } else {
      propertyId = await lookupSlug(slug);
    }

    // Humans arriving via direct Edge Function URL (not proxied) → redirect to SPA
    if (!isCrawler && !isProxy) {
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          Location: `${SITE_URL}/propiedad/${canonicalSlug}`,
          "Cache-Control": "no-store",
        },
      });
    }

    // Fetch property data (needed for both crawlers and proxied humans)
    let property = propertyId ? await fetchProperty(propertyId) : null;

    if (!property && slug) {
      property = await findPropertyBySlugBase(slug);
      if (property) {
        const propertyIdFromFallback = String(property.id ?? "");
        if (propertyIdFromFallback) {
          propertyId = propertyIdFromFallback;
          canonicalSlug = (await lookupSlugById(propertyIdFromFallback))
            ?? buildPropertySlug(
              String(property.title ?? ""),
              String(property.city ?? property.location ?? ""),
              propertyIdFromFallback,
            );
        }
      }
    }

    if (!property) {
      return Response.redirect(`${SITE_URL}/propiedades`, 302);
    }

    // Crawlers → serve OG HTML inline
    if (isCrawler) {
      const ogHtml = buildOgHtml(property, canonicalSlug);
      return new Response(ogHtml, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/html; charset=UTF-8",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // Humans via proxy → serve index.html with injected OG tags (SPA loads normally)
    const indexHtml = await getIndexHtml();
    const enrichedHtml = injectOgIntoIndex(indexHtml, property, canonicalSlug);

    return new Response(enrichedHtml, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=UTF-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("property-og error:", err);
    return Response.redirect(`${SITE_URL}/propiedades`, 302);
  }
});
