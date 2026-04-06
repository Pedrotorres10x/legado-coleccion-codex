# Casa Wow Catalog

Buyer-side real estate catalogue for the Costa Blanca, built to help international buyers discover, compare and move forward with the right properties.

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Supabase

## Local development

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
```

`npm run build` now runs the full enterprise SEO pipeline automatically:

- Vite production build
- route prerender generation
- enterprise SEO verification
- scorecard output in `dist/seo`

## Enterprise SEO build

Use this when you want the production build plus prerendered HTML for the main commercial routes, together with a route-by-route SEO scorecard:

```sh
npm run build:enterprise-seo
```

If you also want to verify that the prerendered output, headers and SPA fallback are still correct:

```sh
npm run build:enterprise-seo:verify
```

## CI automation

The repo includes a GitHub Actions workflow at:

- `.github/workflows/enterprise-seo.yml`

It runs automatically on:

- push to `main` or `master`
- pull requests
- manual dispatch
- every Monday at 06:00 UTC

Artifacts uploaded by the workflow:

- `dist/seo/scorecard.md`
- `dist/seo/scorecard.json`
- `dist/prerender-manifest.json`

The workflow also enforces a threshold automatically:

- money pages (`priority >= 0.9`) must stay at `90+`
- the job writes a summary report into the GitHub Actions run
- if a money page drops below `90`, the workflow fails

Generated outputs:

- `dist/<route>/index.html` for prerendered SEO routes
- `dist/prerender-manifest.json`
- `dist/seo/scorecard.md`
- `dist/seo/scorecard.json`

## Static hosting notes

- This project uses `public/_redirects` for SPA fallback.
- On static hosts compatible with `_redirects`, concrete prerendered files are served before the wildcard fallback.
- `public/_headers` marks `/admin` and `/gracias` as `noindex, nofollow` at the edge level.

## Supabase

Project-specific Supabase setup lives in:

- [docs/CLON_SUPABASE_SETUP.md](C:\Users\Pedro Torres\OneDrive\Escritorio\legado coleccion lovable\casa-wow-catalogo-main\docs\CLON_SUPABASE_SETUP.md)

## AI services

This project uses OpenAI for AI-powered localisation and content workflows.

Required secret for AI edge functions:

- `OPENAI_API_KEY`
