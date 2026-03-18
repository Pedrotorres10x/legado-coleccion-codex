const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const CRM_BASE_URL = (Deno.env.get("CRM_BASE_URL") ?? "").replace(/\/+$/, "");
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

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

// ── REST helpers ─────────────────────────────────────────────────────

const supaRest = (table: string, params: string) =>
  fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });

async function lookupSlug(slug: string): Promise<string | null> {
  const res = await supaRest("property_slugs", `slug=eq.${encodeURIComponent(slug)}&select=property_id&limit=1`);
  if (!res.ok) return null;
  const rows = await res.json();
  return rows?.[0]?.property_id ?? null;
}

async function lookupSlugById(id: string): Promise<string | null> {
  const res = await supaRest("property_slugs", `property_id=eq.${encodeURIComponent(id)}&select=slug&limit=1`);
  if (!res.ok) return null;
  const rows = await res.json();
  return rows?.[0]?.slug ?? null;
}

async function fetchPropertyFromCRM(id: string): Promise<Record<string, unknown> | null> {
  if (!CRM_BASE_URL) return null;
  const url = `${CRM_BASE_URL}/public-properties?id=${encodeURIComponent(id)}`;
  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.property ?? data.properties?.[0] ?? null;
  } catch {
    return null;
  }
}

// ── Build OG HTML ───────────────────────────────────────────────────

function buildOgHtml(property: Record<string, unknown>, canonicalSlug: string): string {
  const title = (property.title as string) ?? "Propiedad";
  const city = ((property.city ?? property.location ?? "") as string);
  const province = ((property.province ?? "") as string);
  const priceNum = property.price as number | undefined;
  const priceStr = priceNum ? `${priceNum.toLocaleString("es-ES")} EUR` : "";
  const bedrooms = (property.bedrooms as number) ?? 0;
  const bathrooms = (property.bathrooms as number) ?? 0;
  const area = ((property.surface_area ?? property.area_m2 ?? 0) as number);
  const type = TYPE_LABELS[(property.property_type as string) ?? ""] ?? ((property.property_type as string) ?? "");
  const images = (property.images as string[]) ?? [];
  const image = images[0] ?? `${SITE_URL}/og-image.jpg`;
  const location = [city, province].filter(Boolean).join(", ");

  const descParts: string[] = [];
  if (type) descParts.push(type);
  if (location) descParts.push(`en ${location}`);
  if (priceStr) descParts.push(priceStr);
  if (bedrooms > 0) descParts.push(`${bedrooms} hab.`);
  if (bathrooms > 0) descParts.push(`${bathrooms} baños`);
  if (area > 0) descParts.push(`${area} m²`);
  const description = descParts.join(" · ");

  const pageUrl = `${SITE_URL}/propiedad/${canonicalSlug}`;
  const ogTitle = `${title} | ${priceStr} — Legado Inmobiliaria`;
  const ogDesc = description || `Descubre esta propiedad exclusiva en ${location} con Legado Inmobiliaria`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${esc(ogTitle)}</title>
  <meta name="description" content="${esc(ogDesc)}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Legado Inmobiliaria" />
  <meta property="og:title" content="${esc(ogTitle)}" />
  <meta property="og:description" content="${esc(ogDesc)}" />
  <meta property="og:image" content="${esc(image)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="800" />
  <meta property="og:url" content="${esc(pageUrl)}" />
  <meta property="og:locale" content="es_ES" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(ogTitle)}" />
  <meta name="twitter:description" content="${esc(ogDesc)}" />
  <meta name="twitter:image" content="${esc(image)}" />
  <meta http-equiv="refresh" content="0;url=${esc(pageUrl)}" />
</head>
<body>
  <p>Redirigiendo a <a href="${esc(pageUrl)}">${esc(ogTitle)}</a>…</p>
</body>
</html>`;
}

// ── Upload OG HTML to Storage ───────────────────────────────────────

async function uploadOgToStorage(slug: string, html: string): Promise<string | null> {
  const storagePath = `og/${slug}.html`;
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/property-images/${storagePath}`;

  try {
    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_KEY}`,
        apikey: SUPABASE_KEY,
        "Content-Type": "text/html; charset=UTF-8",
        "x-upsert": "true",
        "Cache-Control": "public, max-age=3600",
      },
      body: html,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Storage upload failed (${res.status}):`, errText);
      return null;
    }
    await res.text(); // consume body

    // Return public URL
    return `${SUPABASE_URL}/storage/v1/object/public/property-images/${storagePath}`;
  } catch (err) {
    console.error("Storage upload error:", err);
    return null;
  }
}

// ── Build Sitemap XML ───────────────────────────────────────────────

async function buildSitemapXml(): Promise<string> {
  const now = new Date().toISOString();
  const languages = ["es", "en", "fr", "de"];

  const [slugsRes, postsRes] = await Promise.all([
    supaRest("property_slugs", "select=slug,updated_at&order=updated_at.desc"),
    supaRest("blog_posts", "select=slug,updated_at,published_at&status=eq.published&order=published_at.desc"),
  ]);

  const propertySlugs = slugsRes.ok ? await slugsRes.json() : [];
  const blogPosts = postsRes.ok ? await postsRes.json() : [];

  const staticPages = [
    { loc: "/", priority: "1.0", changefreq: "daily" },
    { loc: "/propiedades", priority: "0.9", changefreq: "daily" },
    { loc: "/blog", priority: "0.8", changefreq: "weekly" },
    { loc: "/privacidad", priority: "0.2", changefreq: "yearly" },
    { loc: "/aviso-legal", priority: "0.2", changefreq: "yearly" },
    { loc: "/cookies", priority: "0.2", changefreq: "yearly" },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  for (const page of staticPages) {
    const loc = escapeXml(`${SITE_URL}${page.loc}`);
    xml += `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n`;
    for (const lang of languages) {
      xml += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(`${SITE_URL}${page.loc}?lang=${lang}`)}" />\n`;
    }
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />\n  </url>\n`;
  }

  for (const row of propertySlugs) {
    const lastmod = row.updated_at || now;
    const loc = escapeXml(`${SITE_URL}/propiedad/${row.slug}`);
    xml += `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n`;
    for (const lang of languages) {
      xml += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(`${SITE_URL}/propiedad/${row.slug}?lang=${lang}`)}" />\n`;
    }
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />\n  </url>\n`;
  }

  for (const post of blogPosts) {
    const lastmod = post.updated_at || post.published_at || now;
    const loc = escapeXml(`${SITE_URL}/blog/${post.slug}`);
    xml += `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n`;
    for (const lang of languages) {
      xml += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(`${SITE_URL}/blog/${post.slug}?lang=${lang}`)}" />\n`;
    }
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />\n  </url>\n`;
  }

  xml += `</urlset>`;
  console.log(`Sitemap generated: ${staticPages.length + propertySlugs.length + blogPosts.length} URLs`);
  return xml;
}

// ── Main handler ────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug") ?? "";
  const id = url.searchParams.get("id") ?? "";
  const isOgRequest = !!(slug || id);

  // ── OG mode ───────────────────────────────────────────────────────
  if (isOgRequest) {
    try {
      let propertyId: string | null = null;
      let canonicalSlug: string = slug;

      if (id) {
        propertyId = id;
        canonicalSlug = (await lookupSlugById(id)) ?? id;
      } else {
        propertyId = await lookupSlug(slug);
        if (!propertyId) {
          return Response.redirect(`${SITE_URL}/propiedades`, 302);
        }
      }

      // Fetch property data from CRM
      const property = await fetchPropertyFromCRM(propertyId);
      if (!property) {
        return Response.redirect(`${SITE_URL}/propiedades`, 302);
      }

      // Generate OG HTML and upload to Storage
      const ogHtml = buildOgHtml(property, canonicalSlug);
      const storageUrl = await uploadOgToStorage(canonicalSlug, ogHtml);

      if (storageUrl) {
        // Redirect everyone to Storage URL (serves text/html correctly)
        console.log(`OG redirecting to storage: ${storageUrl}`);
        return Response.redirect(storageUrl, 302);
      }

      // Fallback: redirect to SPA page directly
      console.warn("Storage upload failed, falling back to SPA redirect");
      return Response.redirect(`${SITE_URL}/propiedad/${canonicalSlug}`, 302);
    } catch (err) {
      console.error("OG error:", err);
      return Response.redirect(`${SITE_URL}/propiedades`, 302);
    }
  }

  // ── Sitemap XML mode ──────────────────────────────────────────────
  try {
    const xml = await buildSitemapXml();
    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Sitemap error:", error);
    return new Response("Error generating sitemap", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
