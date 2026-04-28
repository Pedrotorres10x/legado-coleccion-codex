import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, "dist");
const SITE_URL = "https://legadocoleccion.es";
const SITE_NAME = "Legado Inmobiliaria";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
const DEFAULT_DESCRIPTION =
  "Residencias singulares, villas frente al mar, aticos y propiedades exclusivas en Benidorm y Costa Blanca. Asesoramiento discreto, internacional y altamente personalizado.";

const STATIC_ROUTES = [
  {
    path: "/",
    title: "Legado Inmobiliaria | Boutique inmobiliaria en Benidorm y Costa Blanca",
    description:
      "Boutique inmobiliaria en Benidorm y Costa Blanca con mas de 900 propiedades exclusivas, soporte de compra y acompanamiento integral para compradores exigentes.",
    h1: "Legado Inmobiliaria",
    summary:
      "Boutique inmobiliaria con propiedades singulares, soporte de compra y acompanamiento integral en Benidorm y Costa Blanca.",
    type: "WebPage",
    priority: 1,
  },
  {
    path: "/propiedades",
    title: "Propiedades en Venta en Benidorm y Costa Blanca | Legado Inmobiliaria",
    description:
      "Explora mas de 900 propiedades exclusivas en venta: pisos, villas, chalets y aticos en Benidorm, Alicante y la Costa Blanca. Filtra por precio, tipo y ubicacion.",
    h1: "Propiedades en venta en Costa Blanca",
    summary:
      "Catalogo vivo de propiedades en Benidorm, Alicante y Costa Blanca con filtros, fichas completas y contexto de compra.",
    type: "CollectionPage",
    priority: 0.95,
  },
  {
    path: "/blog",
    title: "Blog Inmobiliario | Legado Inmobiliaria — Guias y Consejos Costa Blanca",
    description:
      "Articulos expertos sobre compraventa de propiedades en la Costa Blanca. Guias para compradores, tendencias del mercado, aspectos legales y fiscales.",
    h1: "Blog inmobiliario Costa Blanca",
    summary:
      "Guias y analisis para comprar mejor en Alicante, Benidorm y Costa Blanca con mas criterio financiero, legal y de ubicacion.",
    type: "CollectionPage",
    priority: 0.8,
  },
  {
    path: "/privacidad",
    title: "Politica de Privacidad | Legado Inmobiliaria",
    description:
      "Consulta la politica de privacidad de Legado Inmobiliaria y como tratamos los datos personales enviados desde formularios y solicitudes de informacion.",
    h1: "Politica de Privacidad",
    summary: "Informacion sobre tratamiento de datos personales, derechos y contacto del responsable.",
    type: "WebPage",
    priority: 0.45,
  },
  {
    path: "/aviso-legal",
    title: "Aviso Legal | Legado Inmobiliaria",
    description:
      "Consulta el aviso legal de Legado Inmobiliaria con informacion identificativa, condiciones de uso y limitacion de responsabilidad.",
    h1: "Aviso Legal",
    summary: "Pagina legal corporativa con informacion identificativa, propiedad intelectual y jurisdiccion.",
    type: "WebPage",
    priority: 0.45,
  },
  {
    path: "/cookies",
    title: "Politica de Cookies | Legado Inmobiliaria",
    description:
      "Informacion sobre el uso de cookies, almacenamiento local y tecnologias de seguimiento en la web de Legado Inmobiliaria.",
    h1: "Politica de Cookies",
    summary: "Informacion sobre cookies tecnicas, analiticas y configuracion de consentimiento.",
    type: "WebPage",
    priority: 0.4,
  },
];

function normalizeText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function scoreLength(value, min, max, idealMin, idealMax) {
  const length = value.length;
  if (length >= idealMin && length <= idealMax) return 20;
  if (length >= min && length <= max) return 14;
  return 6;
}

async function readText(filePath) {
  return fs.readFile(filePath, "utf8");
}

function extractSeoEntries(source) {
  const regex =
    /slug:\s*"([^"]+)"[\s\S]*?seoTitle:\s*"([^"]+)"[\s\S]*?seoDescription:\s*"([^"]+)"[\s\S]*?h1:\s*"([^"]+)"/g;
  const items = [];
  let match;

  while ((match = regex.exec(source)) !== null) {
    const [, slug, title, description, h1] = match;
    items.push({
      path: `/${slug}`,
      title: normalizeText(title),
      description: normalizeText(description),
      h1: normalizeText(h1),
      summary: normalizeText(description),
      type: slug.startsWith("guides/") ? "WebPage" : "CollectionPage",
      priority: slug.includes("alicante-province") ? 0.9 : 0.8,
    });
  }

  return items;
}

function buildSchema(route) {
  const canonical = `${SITE_URL}${route.path}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": route.type,
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: route.title,
        description: route.description,
        inLanguage: "es",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: DEFAULT_OG_IMAGE,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        itemListElement: route.path === "/"
          ? [{ "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL }]
          : [
              { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: route.h1, item: canonical },
            ],
      },
    ],
  };
}

function buildNoScript(route) {
  const cta =
    route.path === "/"
      ? `${SITE_URL}/propiedades`
      : route.type === "CollectionPage"
        ? `${SITE_URL}${route.path}`
        : `${SITE_URL}/propiedades`;

  return `
    <noscript>
      <header>
        <nav>
          <a href="${SITE_URL}/">Inicio</a>
          <a href="${SITE_URL}/propiedades">Propiedades</a>
          <a href="${SITE_URL}/blog">Blog</a>
        </nav>
      </header>
      <main>
        <h1>${escapeHtml(route.h1)}</h1>
        <p>${escapeHtml(route.summary)}</p>
        <p>${escapeHtml(route.description)}</p>
        <p><a href="${cta}">Continuar</a></p>
      </main>
    </noscript>
  `;
}

function injectHead(template, route) {
  const canonical = `${SITE_URL}${route.path}`;
  const schema = JSON.stringify(buildSchema(route));

  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(route.title)}</title>`);
  html = html.replace(
    /<meta name="description" content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(route.description)}">`
  );
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${canonical}" />`);
  html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${canonical}" />`);
  html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escapeHtml(route.title)}">`);
  html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escapeHtml(route.description)}">`);
  html = html.replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${escapeHtml(route.title)}">`);
  html = html.replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${escapeHtml(route.description)}">`);
  html = html.replace(/<link rel="alternate" hreflang="es" href="[^"]*"\s*\/?>/i, `<link rel="alternate" hreflang="es" href="${canonical}" />`);
  html = html.replace(/<link rel="alternate" hreflang="x-default" href="[^"]*"\s*\/?>/i, `<link rel="alternate" hreflang="x-default" href="${canonical}" />`);
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, `<script type="application/ld+json">${schema}</script>`);
  html = html.replace(/<noscript>[\s\S]*?<\/noscript>/i, buildNoScript(route));
  html = html.replace(
    /<body>/i,
    `<body>\n    <script>window.__SEO_PRERENDERED_ROUTE__=${JSON.stringify(route.path)};</script>`
  );

  return html;
}

function buildScorecard(html, route) {
  const checks = {
    title: html.includes(`<title>${escapeHtml(route.title)}</title>`),
    description: html.includes(`content="${escapeHtml(route.description)}"`),
    canonical: html.includes(`rel="canonical" href="${SITE_URL}${route.path}"`),
    og: html.includes('property="og:title"') && html.includes('property="og:description"') && html.includes('property="og:url"'),
    twitter: html.includes('name="twitter:title"') && html.includes('name="twitter:description"'),
    schema: html.includes('"@context":"https://schema.org"') || html.includes('"@context": "https://schema.org"'),
    noscript: html.includes("<noscript>") && html.includes(`<h1>${escapeHtml(route.h1)}</h1>`),
  };

  const score =
    scoreLength(route.title, 30, 70, 45, 65) +
    scoreLength(route.description, 70, 180, 120, 165) +
    (checks.canonical ? 12 : 0) +
    (checks.og ? 12 : 0) +
    (checks.twitter ? 8 : 0) +
    (checks.schema ? 18 : 0) +
    (checks.noscript ? 10 : 0);

  return {
    path: route.path,
    score,
    titleLength: route.title.length,
    descriptionLength: route.description.length,
    checks,
    priority: route.priority,
  };
}

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function main() {
  const [landingSource, guideSource, template] = await Promise.all([
    readText(path.join(ROOT, "src", "lib", "seoLandingPages.ts")),
    readText(path.join(ROOT, "src", "lib", "seoGuidePages.ts")),
    readText(path.join(DIST_DIR, "index.html")),
  ]);

  const discoveredRoutes = [
    ...STATIC_ROUTES,
    ...extractSeoEntries(landingSource),
    ...extractSeoEntries(guideSource),
  ];

  const dedupedRoutes = discoveredRoutes.filter(
    (route, index, arr) => arr.findIndex((item) => item.path === route.path) === index
  );

  const manifest = [];
  const scorecards = [];

  for (const route of dedupedRoutes) {
    const html = injectHead(template, route);
    const routeFile = route.path === "/" ? path.join(DIST_DIR, "index.html") : path.join(DIST_DIR, route.path.slice(1), "index.html");

    if (route.path !== "/") {
      await ensureDir(routeFile);
      await fs.writeFile(routeFile, html, "utf8");
    }

    manifest.push({
      path: route.path,
      output: path.relative(DIST_DIR, routeFile).replaceAll("\\", "/"),
      type: route.type,
      priority: route.priority,
    });
    scorecards.push(buildScorecard(html, route));
  }

  const auditDir = path.join(DIST_DIR, "seo");
  await fs.mkdir(auditDir, { recursive: true });

  const ordered = [...scorecards].sort((a, b) => b.score - a.score || b.priority - a.priority);
  const markdown = [
    "# Enterprise SEO Scorecard",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "| Route | Score | Title | Description | Canonical | OG | Schema | NoScript |",
    "| --- | ---: | --- | --- | --- | --- | --- | --- |",
    ...ordered.map((item) => {
      const yesNo = (value) => (value ? "yes" : "no");
      return `| ${item.path} | ${item.score} | ${item.titleLength} | ${item.descriptionLength} | ${yesNo(item.checks.canonical)} | ${yesNo(item.checks.og)} | ${yesNo(item.checks.schema)} | ${yesNo(item.checks.noscript)} |`;
    }),
    "",
  ].join("\n");

  await Promise.all([
    fs.writeFile(path.join(DIST_DIR, "prerender-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8"),
    fs.writeFile(path.join(auditDir, "scorecard.json"), `${JSON.stringify(ordered, null, 2)}\n`, "utf8"),
    fs.writeFile(path.join(auditDir, "scorecard.md"), markdown, "utf8"),
  ]);

  console.log(`Enterprise SEO prerender complete for ${dedupedRoutes.length} routes.`);
}

main().catch((error) => {
  console.error("Enterprise SEO build failed.");
  console.error(error);
  process.exit(1);
});
