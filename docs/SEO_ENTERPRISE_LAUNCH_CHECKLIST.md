# SEO Enterprise Launch Checklist

## 1. Build correcto

Ejecutar:

```sh
npm run build:enterprise-seo:verify
```

Debe cumplirse todo esto:

- build de Vite sin errores
- prerender generado para las rutas clave
- verificacion OK para todas las rutas del manifiesto
- scorecard generado en `dist/seo/scorecard.md`

## 2. Hosting y entrega de archivos

Confirmar en el hosting:

- se publica la carpeta `dist`
- las rutas prerenderizadas existen como `/<ruta>/index.html`
- el hosting sirve archivos reales antes del fallback SPA
- `_redirects` y `_headers` se respetan en produccion

Comprobar especialmente:

- `/property-for-sale-benidorm`
- `/property-for-sale-alicante-province`
- `/guides/how-to-buy-property-in-alicante-as-a-foreigner`
- `/blog`
- `/propiedades`

## 3. Validacion de HTML servido

Hacer fetch real en produccion y confirmar que el HTML inicial ya incluye:

- `<title>` especifico por URL
- `<meta name="description">`
- canonical correcto
- `og:title`, `og:description`, `og:url`
- `twitter:title`, `twitter:description`
- JSON-LD
- bloque `noscript` con contenido de esa ruta

Comandos utiles:

```sh
curl -L https://legadocoleccion.es/property-for-sale-benidorm
curl -L https://legadocoleccion.es/guides/how-to-buy-property-in-alicante-as-a-foreigner
curl -I https://legadocoleccion.es/admin
```

## 4. Robots y cabeceras

Validar:

- `https://legadocoleccion.es/robots.txt` responde 200
- `https://legadocoleccion.es/sitemap.xml` responde 200
- `/admin` devuelve `X-Robots-Tag: noindex, nofollow`
- `/gracias` devuelve `X-Robots-Tag: noindex, nofollow`

Revisar:

- no haya `noindex` accidental en rutas comerciales
- no haya canonicals cruzados incorrectos

## 5. Sitemap

Confirmar que existen y responden:

- sitemap estatico: `https://legadocoleccion.es/sitemap.xml`
- sitemap dinamico: `https://vrywyqpxmmzikaedjoxt.supabase.co/functions/v1/sitemap`

Validar:

- URLs importantes presentes
- `lastmod` razonable
- no haya URLs admin
- no haya URLs rotas o con placeholders

## 6. Search Console

En Google Search Console:

- verificar propiedad de dominio
- enviar `https://legadocoleccion.es/sitemap.xml`
- enviar `https://vrywyqpxmmzikaedjoxt.supabase.co/functions/v1/sitemap`
- inspeccionar manualmente 5 URLs prioritarias
- solicitar indexacion para home, catalogo y 3 landings top

URLs prioritarias:

- `/`
- `/propiedades`
- `/property-for-sale-alicante-province`
- `/property-for-sale-benidorm`
- `/guides/how-to-buy-property-in-alicante-as-a-foreigner`

## 7. Social and sharing

Comprobar con debugger real:

- WhatsApp sharing
- Facebook Sharing Debugger
- LinkedIn Post Inspector

Validar:

- imagen OG correcta
- titulo correcto por URL
- descripcion correcta por URL
- property share URLs funcionando

## 8. Scorecard y mejoras

Abrir:

- `dist/seo/scorecard.md`

Objetivo:

- paginas money en 90+
- guias principales en 90+
- home en 85+

Si una URL queda en 80-86, normalmente ajustar:

- longitud del title
- longitud de la meta description
- claridad del H1 y resumen noscript

## 9. Monitorizacion semanal

Repetir cada semana:

```sh
npm run build:enterprise-seo:verify
```

Y revisar:

- nuevas URLs SEO
- scorecard
- Search Console coverage
- errores de rastreo
- rendimiento de CTR en queries principales

## 10. Siguiente nivel

Cuando esto ya este en produccion, los siguientes upgrades con mas impacto son:

1. Prerender de posts de blog dinamicos.
2. Prerender o edge rendering de fichas de propiedad prioritarias.
3. Dashboard SEO interno leyendo `scorecard.json`.
4. Pipeline que revise titulos y descriptions automaticamente antes de deploy.
