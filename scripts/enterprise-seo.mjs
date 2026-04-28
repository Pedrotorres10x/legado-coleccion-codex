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

// ── GUIA RESIDENTES: write standalone HTML directly ──
const guiaDir = path.join(DIST_DIR, "guia-residentes");
await fs.mkdir(guiaDir, { recursive: true });
await fs.writeFile(path.join(guiaDir, "index.html"), GUIA_HTML, "utf-8");
console.log("Guia residentes HTML written to dist/guia-residentes/index.html");

const GUIA_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- OG / WhatsApp -->
<meta property="og:type" content="website">
<meta property="og:title" content="Tu hogar en España — Guía del comprador · Legado Colección">
<meta property="og:description" content="Has visto la vivienda. Has sentido que es la correcta. Aquí tienes todo lo que necesitas saber antes de firmar — sin letra pequeña, con plena seguridad jurídica.">
<meta property="og:image" content="https://www.legadocoleccion.es/og.jpg">
<meta property="og:url" content="https://www.legadocoleccion.es">
<meta property="og:site_name" content="Legado Colección · Inmobiliaria">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Tu hogar en España — Guía del comprador · Legado Colección">
<meta name="twitter:description" content="Toda la información que necesitas para comprar obra nueva con plena certeza. Obra nueva · Costa Blanca · Alicante.">
<meta name="twitter:image" content="https://www.legadocoleccion.es/og.jpg">

<title>Tu Hogar en España · Legado Colección</title>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap" rel="stylesheet">

<style>
:root {
  --forest:       #2C4A32;
  --forest-mid:   #3D6645;
  --forest-light: #5A8A63;
  --forest-pale:  #E8F0E9;
  --green-acc:    #A8D08D;
  --cream:        #F8F5EF;
  --warm:         #FDFBF7;
  --stone:        #E0DAD0;
  --stone-dk:     #C8BFB0;
  --gold:         #B8955A;
  --dark:         #1C2B1E;
  --darker:       #141A15;
  --black:        #18181A;
  --txt:          #1A1C18;
  --txt-2:        #5A5C56;
  --txt-3:        #9A9C96;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; font-size: 16px; }

body {
  font-family: 'DM Sans', sans-serif;
  background: var(--warm);
  color: var(--txt);
  overflow-x: hidden;
}

/* ── SCROLL REVEAL ── */
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.75s ease, transform 0.75s ease;
}
.reveal.on { opacity: 1; transform: none; }
.reveal-delay-1 { transition-delay: 0.1s; }
.reveal-delay-2 { transition-delay: 0.2s; }
.reveal-delay-3 { transition-delay: 0.3s; }
.reveal-delay-4 { transition-delay: 0.4s; }

/* ── NAV ── */
nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  height: 64px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 48px;
  background: rgba(253,251,247,0.94);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(200,191,176,0.25);
}
.nav-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
.nav-mark {
  width: 36px; height: 36px;
  border: 1.5px solid var(--forest);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Cormorant Garamond', serif;
  font-size: 20px; color: var(--forest);
}
.nav-name {
  font-size: 10px; font-weight: 500;
  letter-spacing: 3px; color: var(--forest);
  text-transform: uppercase;
}
.nav-sub {
  font-size: 8px; font-weight: 300;
  letter-spacing: 2px; color: var(--txt-3);
  text-transform: uppercase; margin-top: 1px;
}
.nav-links { display: flex; gap: 32px; list-style: none; }
.nav-links a {
  font-size: 11px; font-weight: 400;
  letter-spacing: 0.5px; color: var(--txt-2);
  text-decoration: none; transition: color .2s;
}
.nav-links a:hover { color: var(--forest); }

/* ── HERO ── */
.hero {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: flex-end;
  padding-top: 64px;
  overflow: hidden;
}
.hero-bg {
  position: absolute; inset: 0;
  background: var(--dark);
}
.hero-img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover; object-position: center 35%;
  opacity: 0.45;
}
.hero-grad {
  position: absolute; inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(28,43,30,0.3) 0%,
    rgba(28,43,30,0.7) 60%,
    rgba(28,43,30,0.97) 100%
  );
}
.hero-content {
  position: relative; z-index: 2;
  width: 100%;
  padding: 0 80px 80px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: end;
}
.hero-left {}
.hero-tag {
  font-size: 9px; font-weight: 500;
  letter-spacing: 5px; color: var(--green-acc);
  text-transform: uppercase; margin-bottom: 24px;
  display: flex; align-items: center; gap: 12px;
  opacity: 0.8;
}
.hero-tag::before {
  content: ''; width: 28px; height: 1px;
  background: var(--green-acc); opacity: 0.6;
}
.hero-h1 {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(46px, 6vw, 72px);
  font-weight: 300; line-height: 1.03;
  color: #F5F2EC; margin-bottom: 28px;
  letter-spacing: -0.5px;
}
.hero-h1 em { font-style: italic; color: var(--green-acc); }
.hero-body {
  font-size: 15px; font-weight: 300;
  line-height: 1.85; color: rgba(245,242,236,0.6);
  max-width: 460px; margin-bottom: 48px;
}
.hero-body strong { color: rgba(245,242,236,0.9); font-weight: 400; }

.hero-right {
  display: flex; flex-direction: column;
  align-items: flex-end; gap: 32px;
}
.stat-stack { display: flex; flex-direction: column; gap: 20px; width: 100%; max-width: 280px; }
.stat-item {
  border-top: 1px solid rgba(168,208,141,0.25);
  padding-top: 14px;
}
.stat-num {
  font-family: 'Cormorant Garamond', serif;
  font-size: 38px; font-weight: 300;
  color: var(--green-acc); line-height: 1;
  margin-bottom: 4px;
}
.stat-lbl {
  font-size: 9px; font-weight: 500;
  letter-spacing: 2.5px; color: rgba(168,208,141,0.4);
  text-transform: uppercase;
}

/* ── SECTION BASE ── */
.section { padding: 100px 80px; }
.section.alt { background: var(--cream); }
.section.dark { background: var(--dark); }
.section.black { background: var(--black); }

.sec-inner { max-width: 1100px; margin: 0 auto; }

.sec-eyebrow {
  font-size: 9px; font-weight: 500;
  letter-spacing: 5px; text-transform: uppercase;
  color: var(--forest-light);
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 16px;
}
.sec-eyebrow::before {
  content: ''; width: 24px; height: 1px;
  background: var(--forest-light);
}
.sec-eyebrow-dk {
  font-size: 9px; font-weight: 500;
  letter-spacing: 5px; text-transform: uppercase;
  color: var(--green-acc);
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 16px; opacity: 0.7;
}
.sec-eyebrow-dk::before {
  content: ''; width: 24px; height: 1px;
  background: var(--green-acc); opacity: 0.5;
}
.sec-eyebrow-gold {
  font-size: 9px; font-weight: 500;
  letter-spacing: 5px; text-transform: uppercase;
  color: var(--gold);
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 16px; opacity: 0.7;
}
.sec-eyebrow-gold::before {
  content: ''; width: 24px; height: 1px;
  background: var(--gold); opacity: 0.5;
}

.sec-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(34px, 4vw, 50px);
  font-weight: 300; line-height: 1.1;
  color: var(--txt); margin-bottom: 24px;
}
.sec-title em { font-style: italic; color: var(--forest); }
.sec-title-dk {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(34px, 4vw, 50px);
  font-weight: 300; line-height: 1.1;
  color: #F0EDE6; margin-bottom: 24px;
}
.sec-title-dk em { font-style: italic; color: var(--green-acc); }
.sec-title-gold {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(34px, 4vw, 50px);
  font-weight: 300; line-height: 1.1;
  color: #E8E4DE; margin-bottom: 24px;
}
.sec-title-gold em { font-style: italic; color: var(--gold); }

.sec-lead {
  font-size: 16px; font-weight: 300;
  line-height: 1.85; color: var(--txt-2);
  max-width: 600px; margin-bottom: 56px;
}
.sec-lead-dk {
  font-size: 16px; font-weight: 300;
  line-height: 1.85; color: rgba(240,237,230,0.55);
  max-width: 600px; margin-bottom: 56px;
}
.sec-lead strong { color: var(--txt); font-weight: 500; }
.sec-lead-dk strong { color: rgba(240,237,230,0.85); font-weight: 400; }

/* ── CARDS GRID ── */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }

.card {
  background: var(--warm);
  border: 1px solid var(--stone);
  padding: 28px 24px 24px;
  position: relative;
  transition: border-color .3s, box-shadow .3s;
}
.card::before {
  content: ''; position: absolute;
  top: 0; left: 0; width: 3px; height: 40px;
  background: linear-gradient(180deg, var(--forest), transparent);
}
.card:hover {
  border-color: rgba(44,74,50,0.3);
  box-shadow: 0 8px 32px rgba(28,43,30,0.08);
}
.card-dk {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  padding: 24px;
  position: relative;
  transition: border-color .3s;
}
.card-dk::before {
  content: ''; position: absolute;
  top: 0; left: 0; width: 3px; height: 32px;
  background: linear-gradient(180deg, var(--green-acc), transparent);
  opacity: 0.5;
}
.card-dk:hover { border-color: rgba(168,208,141,0.2); }

.c-bignum {
  font-family: 'Cormorant Garamond', serif;
  font-size: 44px; font-weight: 300;
  color: var(--stone); line-height: 1;
  margin-bottom: 12px;
  transition: color .3s;
}
.card:hover .c-bignum { color: var(--stone-dk); }
.c-title {
  font-size: 14px; font-weight: 500;
  color: var(--txt); margin-bottom: 8px;
}
.c-title-dk {
  font-size: 14px; font-weight: 500;
  color: #D0CCC4; margin-bottom: 8px;
}
.c-text {
  font-size: 13px; font-weight: 300;
  color: var(--txt-2); line-height: 1.7;
}
.c-text-dk {
  font-size: 13px; font-weight: 300;
  color: #5A6A5C; line-height: 1.7;
}
.c-pct {
  font-family: 'Cormorant Garamond', serif;
  font-size: 48px; font-weight: 300;
  color: var(--forest); line-height: 1;
  margin-bottom: 8px;
}

/* ── HIGHLIGHT ── */
.hl {
  background: var(--forest-pale);
  border-left: 4px solid var(--forest);
  padding: 24px 28px;
  margin-bottom: 32px;
}
.hl-dk {
  background: rgba(44,74,50,0.2);
  border-left: 4px solid var(--green-acc);
  padding: 24px 28px;
  margin-bottom: 32px;
}
.hl-gold {
  background: rgba(184,149,90,0.08);
  border-left: 4px solid var(--gold);
  padding: 24px 28px;
  margin-bottom: 32px;
}
.hl-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 20px; color: var(--forest);
  margin-bottom: 10px;
}
.hl-title-dk { font-family: 'Cormorant Garamond', serif; font-size: 20px; color: var(--green-acc); margin-bottom: 10px; }
.hl-title-gold { font-family: 'Cormorant Garamond', serif; font-size: 20px; color: var(--gold); margin-bottom: 10px; }
.hl-text {
  font-size: 14px; font-weight: 300;
  color: var(--txt-2); line-height: 1.8;
}
.hl-text-dk { font-size: 14px; font-weight: 300; color: #6A7A6C; line-height: 1.8; }
.hl-text-gold { font-size: 14px; font-weight: 300; color: #5A6A5C; line-height: 1.8; }

/* ── QUOTE ── */
.quote {
  border-left: 3px solid var(--forest);
  background: rgba(44,74,50,0.04);
  padding: 24px 28px;
  margin: 32px 0;
}
.quote-text {
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px; font-style: italic;
  color: var(--txt); line-height: 1.45;
  margin-bottom: 10px;
}
.quote-attr {
  font-size: 10px; letter-spacing: 3px;
  text-transform: uppercase; color: var(--forest-light);
}

/* ── STEPS ── */
.steps { display: flex; flex-direction: column; }
.step {
  display: flex; gap: 20px;
  padding: 20px 0;
  border-bottom: 1px solid var(--stone);
}
.step-dk {
  display: flex; gap: 20px;
  padding: 20px 0;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}
.step:last-child { border-bottom: none; }
.step-dk:last-child { border-bottom: none; }
.step-num {
  font-family: 'Cormorant Garamond', serif;
  font-size: 15px; font-style: italic;
  color: var(--forest-light); min-width: 52px;
  padding-top: 2px;
}
.step-num-dk {
  font-family: 'Cormorant Garamond', serif;
  font-size: 15px; font-style: italic;
  color: var(--green-acc); min-width: 52px;
  padding-top: 2px; opacity: 0.6;
}
.step-title { font-size: 14px; font-weight: 500; color: var(--txt); margin-bottom: 4px; }
.step-title-dk { font-size: 14px; font-weight: 500; color: #D0CCC4; margin-bottom: 4px; }
.step-desc { font-size: 13px; font-weight: 300; color: var(--txt-2); line-height: 1.65; }
.step-desc-dk { font-size: 13px; font-weight: 300; color: #5A6A5C; line-height: 1.65; }

/* ── BULLETS ── */
.bul { list-style: none; }
.bul li {
  display: flex; gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--stone);
  font-size: 14px; font-weight: 300;
  color: var(--txt-2); line-height: 1.55;
  align-items: flex-start;
}
.bul li:last-child { border-bottom: none; }
.bul li::before {
  content: ''; width: 5px; height: 5px; min-width: 5px;
  background: var(--forest-light); border-radius: 50%;
  margin-top: 6px;
}
.bul-dk li {
  color: #6A7A6C;
  border-bottom-color: rgba(255,255,255,0.07);
}
.bul-dk li::before { background: var(--green-acc); opacity: 0.5; }

/* ── TWO COL ── */
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start; }
.two-col-img { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }

/* ── IMAGE ── */
.img-cover {
  width: 100%; display: block;
  object-fit: cover; object-position: center;
}

/* ── TOTAL BAR ── */
.total-bar {
  background: var(--forest);
  padding: 32px 36px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
  margin-top: 32px;
}
.tb-text { font-size: 14px; font-weight: 300; color: #8AAA8C; line-height: 1.7; max-width: 460px; }
.tb-right {}
.tb-label {
  font-size: 9px; letter-spacing: 3px; text-transform: uppercase;
  color: #4A6A4C; text-align: right; margin-bottom: 4px;
}
.tb-pct {
  font-family: 'Cormorant Garamond', serif;
  font-size: 56px; color: var(--green-acc);
  line-height: 1; text-align: right;
}

/* ── INDEPENDENCE ── */
.ind-box {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-left: 3px solid var(--gold);
  padding: 24px 28px;
  margin-bottom: 32px;
}
.ind-title { font-size: 15px; font-weight: 500; color: #8A9A8C; margin-bottom: 10px; }
.ind-text { font-size: 13.5px; font-weight: 300; color: #5A6A5C; line-height: 1.8; }

/* ── LEGAL BADGE ── */
.legal-badge {
  display: inline-flex; align-items: center; gap: 8px;
  border: 1px solid rgba(184,149,90,0.25);
  padding: 6px 14px; margin-bottom: 28px;
}
.legal-dot { width: 5px; height: 5px; background: var(--gold); border-radius: 50%; }
.legal-txt {
  font-size: 9px; font-weight: 500;
  letter-spacing: 3px; color: var(--gold);
  text-transform: uppercase; opacity: 0.7;
}

/* ── CONTACT FOOTER ── */
.contact-section {
  background: var(--forest);
  padding: 64px 80px;
}
.contact-grid {
  max-width: 1100px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  gap: 40px;
}
.ct-item { border-top: 1px solid rgba(168,208,141,0.2); padding-top: 20px; }
.ct-label {
  font-size: 9px; font-weight: 500;
  letter-spacing: 4px; text-transform: uppercase;
  color: rgba(168,208,141,0.4); margin-bottom: 8px;
}
.ct-value {
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px; color: var(--green-acc);
  text-decoration: none;
}
.ct-value-link {
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px; color: var(--green-acc);
  text-decoration: none;
  transition: opacity .2s;
}
.ct-value-link:hover { opacity: 0.75; }

.footer-bar {
  background: var(--darker);
  padding: 20px 80px;
  display: flex; align-items: center; justify-content: space-between;
}
.footer-copy {
  font-size: 10px; font-weight: 300;
  letter-spacing: 1.5px; color: rgba(168,208,141,0.2);
}

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  nav { padding: 0 24px; }
  .nav-links { display: none; }
  .hero-content { grid-template-columns: 1fr; padding: 0 28px 60px; }
  .hero-right { display: none; }
  .section { padding: 72px 28px; }
  .contact-section { padding: 48px 28px; }
  .footer-bar { padding: 16px 28px; }
  .two-col, .two-col-img, .grid-2, .grid-3, .contact-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .total-bar { flex-direction: column; align-items: flex-start; }
  .tb-pct { text-align: left; }
}
</style>
</head>
<body>

<!-- NAV -->
<nav>
  <a href="#" class="nav-logo">
    <div class="nav-mark">L</div>
    <div>
      <div class="nav-name">Legado Colección</div>
      <div class="nav-sub">Benidorm · Alicante</div>
    </div>
  </a>
  <ul class="nav-links">
    <li><a href="#obra-nueva">Obra nueva</a></li>
    <li><a href="#garantias">Garantías</a></li>
    <li><a href="#proceso">El proceso</a></li>
    <li><a href="#gastos">Gastos</a></li>
    <li><a href="#asesoria">Asesoría</a></li>
    <li><a href="#contacto">Contacto</a></li>
  </ul>
</nav>


<!-- ══════════════════════
     HERO
══════════════════════ -->
<section class="hero">
  <div class="hero-bg"></div>
  <img class="hero-img" src="data:image/jpeg;base64,{imgs['hero']}" alt="Villa Costa Blanca">
  <div class="hero-grad"></div>
  <div class="hero-content">
    <div class="hero-left">
      <div class="hero-tag">Guía del comprador · Obra nueva · Residente</div>
      <h1 class="hero-h1">
        Todo lo que<br>necesitas<br><em>saber</em><br>antes de firmar
      </h1>
      <p class="hero-body">
        Has visto la vivienda. Has sentido que es la correcta.
        Este documento es para ti: <strong>toda la información que necesitas
        para tomar la decisión con plena certeza.</strong>
      </p>
    </div>
    <div class="hero-right">
      <div class="stat-stack">
        <div class="stat-item">
          <div class="stat-num">10+</div>
          <div class="stat-lbl">Años en el mercado</div>
        </div>
        <div class="stat-item">
          <div class="stat-num">500+</div>
          <div class="stat-lbl">Familias acompañadas</div>
        </div>
        <div class="stat-item">
          <div class="stat-num">100%</div>
          <div class="stat-lbl">A tu lado, sin coste</div>
        </div>
      </div>
    </div>
  </div>
</section>


<!-- ══════════════════════
     OBRA NUEVA
══════════════════════ -->
<section class="section" id="obra-nueva">
  <div class="sec-inner">
    <div class="two-col-img">
      <div class="reveal">
        <div class="sec-eyebrow">La decisión correcta</div>
        <h2 class="sec-title">Por qué obra nueva es<br>objetivamente <em>mejor</em></h2>
        <p class="sec-lead">
          La comparativa entre obra nueva y segunda mano no es solo cuestión de gusto.
          Los números, las garantías y el coste real a 10 años hablan con claridad.
        </p>

        <div class="quote" style="margin-top:0;">
          <div class="quote-text">"La obra nueva no es más cara. Es más barata cuando calculas el coste total a 10 años."</div>
          <div class="quote-attr">Análisis de coste total de propiedad</div>
        </div>
      </div>
      <div class="reveal reveal-delay-2">
        <img class="img-cover" style="height:520px; object-position:center 30%;"
             src="data:image/jpeg;base64,{imgs['interior2']}" alt="Interior obra nueva">
      </div>
    </div>

    <div class="grid-2" style="margin-top:56px;">
      <div class="card reveal reveal-delay-1">
        <div class="c-bignum">A/B</div>
        <div class="c-title">Eficiencia energética certificada</div>
        <div class="c-text">La segunda mano media tiene calificación E o F. La diferencia en factura anual supera los 1.500€. En 10 años, es un coche. En 20, es otra vivienda.</div>
      </div>
      <div class="card reveal reveal-delay-2">
        <div class="c-bignum">10</div>
        <div class="c-title">Años de garantía estructural</div>
        <div class="c-text">Más 3 de habitabilidad y 1 de acabados. En segunda mano compras lo que hay, con lo que hay. Sin red de seguridad legal.</div>
      </div>
      <div class="card reveal reveal-delay-3">
        <div class="c-bignum">0€</div>
        <div class="c-title">Reformas inmediatas</div>
        <div class="c-text">Una vivienda de más de 20 años tiene reformas pendientes. Cocina, baños, instalaciones: mínimo 20.000€ que nadie te dice antes de comprar.</div>
      </div>
      <div class="card reveal reveal-delay-4">
        <div class="c-bignum">+%</div>
        <div class="c-title">Revalorización desde el contrato</div>
        <div class="c-text">Comprar en planos es adquirir al precio de hoy con entrega futura. El diferencial entre firma y entrega ha sido históricamente positivo en esta zona.</div>
      </div>
    </div>

    <div class="grid-2" style="margin-top:16px;">
      <div class="card reveal reveal-delay-1">
        <div class="c-title">Personalización antes de la entrega</div>
        <div class="c-text">Acabados, distribución, equipamiento — elegidos por ti antes de que se ejecute la obra. Tu vivienda diseñada desde cero, no adaptada.</div>
      </div>
      <div class="card reveal reveal-delay-2">
        <div class="c-title">Domótica y tecnología integrada</div>
        <div class="c-text">Aerotermia, domótica y conectividad incluidas en la normativa actual. Incorporarlo a segunda mano supone una obra mayor adicional.</div>
      </div>
    </div>
  </div>
</section>


<!-- ══════════════════════
     GARANTÍAS
══════════════════════ -->
<section class="section dark" id="garantias">
  <div class="sec-inner">
    <div class="reveal">
      <div class="sec-eyebrow-dk">Lo que la ley pone de tu parte</div>
      <h2 class="sec-title-dk">Tus garantías como<br>comprador de <em>obra nueva</em></h2>
      <p class="sec-lead-dk">
        Estas garantías no son opcionales. El promotor no puede eliminarlas ni reducirlas.
        Son tuyas por ley desde el momento en que firmas el contrato.
      </p>
    </div>

    <div class="hl-dk reveal">
      <div class="hl-title-dk">Tu dinero tiene cobertura legal total</div>
      <div class="hl-text-dk">
        La LOE y la Ley 57/1968 obligan al promotor a garantizar cada euro entregado
        mediante aval bancario o seguro de caución. Si la promoción no concluye,
        <strong style="color:#A0B0A0;">recuperas el 100% de tu inversión más los intereses legales.</strong>
        No es una promesa del promotor — es una obligación exigible ante los tribunales.
      </div>
    </div>

    <div class="two-col reveal">
      <div class="steps">
        <div class="step-dk">
          <div class="step-num-dk">10 años</div>
          <div>
            <div class="step-title-dk">Garantía decenal — defectos estructurales</div>
            <div class="step-desc-dk">Cimientos, estructura, cubierta. Defectos que afecten a la solidez del edificio cubiertos durante 10 años desde la entrega.</div>
          </div>
        </div>
        <div class="step-dk">
          <div class="step-num-dk">3 años</div>
          <div>
            <div class="step-title-dk">Garantía trienal — habitabilidad</div>
            <div class="step-desc-dk">Defectos que comprometan el uso normal: impermeabilización, instalaciones de agua, calefacción, ventilación.</div>
          </div>
        </div>
        <div class="step-dk">
          <div class="step-num-dk">1 año</div>
          <div>
            <div class="step-title-dk">Garantía anual — acabados</div>
            <div class="step-desc-dk">Revestimientos, pavimentos, carpintería, pintura. Todo lo visible y tangible en el momento de la entrega.</div>
          </div>
        </div>
      </div>
      <div>
        <div class="grid-2" style="gap:12px; margin-bottom:16px;">
          <div class="card-dk">
            <div class="c-title-dk">Aval bancario obligatorio</div>
            <div class="c-text-dk">Cada pago durante la construcción está cubierto. Obligación legal que el promotor no puede eludir.</div>
          </div>
          <div class="card-dk">
            <div class="c-title-dk">Inscripción registral plena</div>
            <div class="c-text-dk">Escritura pública notarial e inscripción en el Registro. La máxima protección jurídica en España.</div>
          </div>
        </div>
        <ul class="bul bul-dk">
          <li>Derecho a revisar la memoria de calidades antes de firmar</li>
          <li>Visita de inspección previa a escrituras — puedes señalar defectos</li>
          <li>Plazo máximo de entrega fijado en contrato con penalizaciones al promotor</li>
          <li>Subrogación a hipoteca del promotor o contratación de la tuya propia</li>
        </ul>
      </div>
    </div>
  </div>
</section>


<!-- ══════════════════════
     PROCESO
══════════════════════ -->
<section class="section alt" id="proceso">
  <div class="sec-inner">
    <div class="reveal">
      <div class="sec-eyebrow">Los próximos pasos</div>
      <h2 class="sec-title">De aquí a las llaves:<br><em>sin sorpresas</em></h2>
      <p class="sec-lead">Conocer el camino completo elimina la incertidumbre. Cada fase tiene sus plazos y sus protecciones.</p>
    </div>

    <div class="two-col-img">
      <div class="steps reveal">
        <div class="step">
          <div class="step-num">1</div>
          <div>
            <div class="step-title">Reserva</div>
            <div class="step-desc">Señal que paraliza la comercialización. La vivienda queda para ti mientras formalizas.</div>
          </div>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <div>
            <div class="step-title">Contrato privado</div>
            <div class="step-desc">Define precio, pagos y calidades. Todo lo entregado desde aquí queda avalado por ley.</div>
          </div>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <div>
            <div class="step-title">Pagos escalonados</div>
            <div class="step-desc">Hitos vinculados al avance de obra. Nunca pagas sin cobertura legal.</div>
          </div>
        </div>
        <div class="step">
          <div class="step-num">4</div>
          <div>
            <div class="step-title">Hipoteca (si aplica)</div>
            <div class="step-desc">Tasación y firma. Te acompañamos en la comparativa de entidades sin coste.</div>
          </div>
        </div>
        <div class="step">
          <div class="step-num">5</div>
          <div>
            <div class="step-title">Escritura notarial</div>
            <div class="step-desc">Con licencia de primera ocupación. Tu propiedad inscrita en el Registro.</div>
          </div>
        </div>
        <div class="step">
          <div class="step-num">6</div>
          <div>
            <div class="step-title">Entrega de llaves</div>
            <div class="step-desc">Con todas las garantías activas. La vivienda es tuya.</div>
          </div>
        </div>
      </div>

      <div class="reveal reveal-delay-2">
        <img class="img-cover" style="height:380px; margin-bottom:24px;"
             src="data:image/jpeg;base64,{imgs['proceso']}" alt="Firma contrato">
        <div class="hl">
          <div class="hl-title">Legado te acompaña en cada paso</div>
          <div class="hl-text">
            Revisamos el contrato antes de que lo veas. Coordinamos con el promotor.
            Te avisamos de cada hito. Estamos en la notaría contigo.
            <strong>Sin coste para ti.</strong>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


<!-- ══════════════════════
     GASTOS
══════════════════════ -->
<section class="section" id="gastos">
  <div class="sec-inner">
    <div class="reveal">
      <div class="sec-eyebrow">Números reales</div>
      <h2 class="sec-title">Los gastos adicionales,<br><em>sin letra pequeña</em></h2>
      <p class="sec-lead">
        Presupuestar bien desde el inicio es la diferencia entre una compra tranquila y una con tensiones.
        Aquí tienes los costes reales para un residente en la Comunidad Valenciana.
      </p>
    </div>

    <div class="grid-3 reveal">
      <div class="card">
        <div class="c-title">IVA</div>
        <div class="c-pct">10%</div>
        <div class="c-text">Sobre el precio de compra. Obra nueva tributa por IVA, no por transmisiones patrimoniales.</div>
      </div>
      <div class="card">
        <div class="c-title">AJD</div>
        <div class="c-pct">1,5%</div>
        <div class="c-text">Actos Jurídicos Documentados. Comunidad Valenciana. Sobre el precio escriturado.</div>
      </div>
      <div class="card">
        <div class="c-title">Notaría y Registro</div>
        <div class="c-pct">~1%</div>
        <div class="c-text">Escritura pública, inscripción registral y gestoría. Variable según el precio de compra.</div>
      </div>
    </div>

    <div class="total-bar reveal">
      <div class="tb-text">
        Reserva este porcentaje adicional sobre el precio de compra
        y llegarás a la firma con total tranquilidad. Sin sorpresas de última hora.
      </div>
      <div class="tb-right">
        <div class="tb-label">Total adicional estimado</div>
        <div class="tb-pct">12–13%</div>
      </div>
    </div>

    <div class="grid-2 reveal" style="margin-top:16px;">
      <div class="card">
        <div class="c-title">Hipoteca para residentes</div>
        <div class="c-text">Financiación de hasta el 80% del valor de tasación para primera vivienda habitual. Comparamos ofertas de varias entidades sin coste ni vinculación bancaria.</div>
      </div>
      <div class="card">
        <div class="c-title">Subrogación al promotor</div>
        <div class="c-text">Muchas promociones cuentan con hipoteca preconcedida. Puede suponer un ahorro en gastos de apertura. Analizamos contigo si te conviene.</div>
      </div>
    </div>
  </div>
</section>


<!-- ══════════════════════
     ASESORÍA
══════════════════════ -->
<section class="section black" id="asesoria">
  <div class="sec-inner">
    <div class="reveal">
      <div class="legal-badge"><div class="legal-dot"></div><div class="legal-txt">Servicio opcional · Asesoría jurídica independiente</div></div>
      <h2 class="sec-title-gold">Una capa más<br>de <em>certeza</em></h2>
      <p style="font-size:16px;font-weight:300;line-height:1.85;color:rgba(240,237,230,0.5);max-width:600px;margin-bottom:40px;">
        Gestionamos cada operación con el máximo rigor. Para quienes desean además
        una revisión jurídica completamente independiente,
        <strong style="color:rgba(240,237,230,0.8);font-weight:400;">contamos con un despacho especializado en derecho inmobiliario
        que ofrece condiciones preferentes a nuestros clientes.</strong>
      </p>
    </div>

    <div class="ind-box reveal">
      <div class="ind-title">Este despacho trabaja exclusivamente para ti, no para nosotros</div>
      <div class="ind-text">
        Opera con total independencia de Legado Colección. Su misión es defender
        tus intereses como comprador — lo que incluye señalarte cualquier cláusula
        que no te favorezca. El convenio te garantiza honorarios reducidos y
        atención prioritaria, sin ninguna vinculación con nuestra actividad.
        Muchas operaciones se cierran con plena seguridad sin asesoría externa.
        Te la ofrecemos porque más información siempre te favorece a ti.
      </div>
    </div>

    <div class="two-col reveal">
      <div class="steps">
        <div class="step-dk">
          <div class="step-num-dk">01</div>
          <div>
            <div class="step-title-dk">Revisión del contrato privado</div>
            <div class="step-desc-dk">Análisis de cláusulas, condiciones de pago, penalizaciones y memoria de calidades antes de tu firma.</div>
          </div>
        </div>
        <div class="step-dk">
          <div class="step-num-dk">02</div>
          <div>
            <div class="step-title-dk">Verificación registral y urbanística</div>
            <div class="step-desc-dk">Estado registral de la parcela, licencias en vigor, cargas y situación urbanística completa.</div>
          </div>
        </div>
        <div class="step-dk">
          <div class="step-num-dk">03</div>
          <div>
            <div class="step-title-dk">Acompañamiento notarial</div>
            <div class="step-desc-dk">Revisión previa del borrador de escritura para que todo lo pactado quede correctamente reflejado.</div>
          </div>
        </div>
      </div>
      <div class="steps">
        <div class="step-dk">
          <div class="step-num-dk">04</div>
          <div>
            <div class="step-title-dk">Gestión de garantías postentrega</div>
            <div class="step-desc-dk">Canal directo para reclamaciones de garantía y cualquier incidencia que surja tras la firma.</div>
          </div>
        </div>
        <div class="step-dk">
          <div class="step-num-dk">05</div>
          <div>
            <div class="step-title-dk">Honorarios reducidos para clientes Legado</div>
            <div class="step-desc-dk">El convenio garantiza tarifas preferentes. El despacho te informa antes de cualquier compromiso.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


<!-- ══════════════════════
     CONTACTO
══════════════════════ -->
<section class="contact-section" id="contacto">
  <div class="contact-grid">
    <div class="ct-item reveal">
      <div class="ct-label">Asesor</div>
      <div class="ct-value">Pedro Torres</div>
    </div>
    <div class="ct-item reveal reveal-delay-1">
      <div class="ct-label">Teléfono</div>
      <a href="tel:+34644245670" class="ct-value-link">644 245 670</a>
    </div>
    <div class="ct-item reveal reveal-delay-2">
      <div class="ct-label">Web</div>
      <a href="https://www.legadocoleccion.es" target="_blank" class="ct-value-link">legadocoleccion.es</a>
    </div>
  </div>
</section>

<div class="footer-bar">
  <div class="footer-copy">© 2025 Legado Colección · Benidorm · Provincia de Alicante · Especialistas en obra nueva</div>
  <div class="footer-copy">Diseñado para acompañarte en cada paso</div>
</div>


<script>
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('on');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
</script>

</body>
</html>`;

