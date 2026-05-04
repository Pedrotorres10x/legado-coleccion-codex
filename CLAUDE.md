# CLAUDE.md — Legado Colección

## Propósito
Web pública de Legado Inmobiliaria: catálogo de propiedades en Costa Blanca, blog, páginas SEO landing/guide, y panel admin. Orientado a compradores internacionales.

## Stack
- **Framework**: React 18 + Vite 8 + TypeScript 5
- **UI**: Tailwind CSS 3 + shadcn/ui (Radix primitives)
- **Routing**: react-router-dom v6
- **Data**: Supabase + TanStack Query v5
- **Build SEO**: scripts Node ESM post-build (`enterprise-seo.mjs`)
- **Deploy**: Vercel

## Carpetas clave

```
src/
  pages/          Páginas (lazy-loaded salvo Index)
  components/     Componentes UI; ui/ = shadcn primitivos
  hooks/          Custom hooks (useExternalProperties, useBlog, etc.)
  lib/            Utilidades: antispam, leads, SEO schemas, sanitizeHtml, site constants
  contexts/       LanguageContext
  integrations/   Supabase client + types generados
scripts/          Build scripts post-Vite (enterprise-seo.mjs, verify, thresholds)
public/           Estáticos: robots.txt, sitemap, sw.js, guia-residentes HTML
supabase/         Migraciones, Edge Functions, config
```

## Comandos

| Tarea | Comando |
|---|---|
| Dev | `npm run dev` |
| Build (completo) | `npm run build` |
| Build solo Vite | `npm run build:vite` |
| Lint | `npm run lint` |
| Tests | `npm run test` |
| Tests watch | `npm run test:watch` |
| SEO verify | `npm run seo:verify` |
| Deploy Edge Functions | `npm run supabase:deploy:ai` |

## Convenciones

- **Lazy loading**: todas las páginas son `lazy()` excepto `Index` (critical path). Los componentes sin UI (`ContentProtection`, `NavigationGuard`, `PageTracker`) se importan directamente.
- **Rutas SEO**: las landing pages (`/property-for-sale-*`) se definen a partir de `src/lib/seoLandingPages.ts`. Las guide pages a partir de `src/lib/seoGuidePages.ts`.
- **Toast**: sistema único vía `@/hooks/use-toast` (Radix). Sonner está montado en App.tsx pero no se llama con `toast()`.
- **SEO en runtime**: `SEOHead.tsx` manipula `document.head` mediante `useEffect`. Los pre-renders de build los genera `scripts/enterprise-seo.mjs`.
- **Seguridad HTML**: cualquier HTML externo debe pasar por `sanitizeHtml()` de `src/lib/sanitizeHtml.ts` antes de `dangerouslySetInnerHTML`.
- **guia-residentes**: el fichero fuente es `scripts/guia-residentes.html` (usado en build). En runtime se sirve `public/guia-residentes-content.html` via fetch.
- **Antispam**: `src/lib/antispam.ts` gestiona rate limiting, honeypots, detección de emails desechables y navegación abusiva.
- **No DROP/TRUNCATE** sin confirmación explícita.

## Variables de entorno requeridas
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_SITE_URL          # opcional, fallback a window.location.origin
```
