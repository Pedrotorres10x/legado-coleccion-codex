
# Fix: Texto ilegible en previsualizacion OG de Facebook

## Problema
Al compartir una propiedad en Facebook, la primera linea muestra `jfmecotawmdahvhjhpal.supab...` (la URL del backend). Esto ocurre porque el `shareUrl` apunta directamente a la URL de la Edge Function en lugar del dominio `legadocoleccion.es`. Facebook siempre muestra el dominio de la URL compartida encima del titulo.

## Solucion
Cambiar el `shareUrl` para que use la URL canonica de la web (`https://legadocoleccion.es/propiedad/{slug}`) en lugar de la URL de la Edge Function. La Edge Function `property-og` ya detecta bots (como `facebookexternalhit`) y les sirve el HTML con los meta tags OG, mientras redirige a los humanos a la SPA. Sin embargo, para que esto funcione, Facebook necesita poder acceder a la URL del sitio y recibir los OG tags.

Dado que la SPA no puede servir OG tags dinamicos directamente desde `legadocoleccion.es`, la solucion es doble:

1. **Compartir la URL de la Edge Function pero usando `og:url` con el dominio real**: Facebook mostrara como dominio lo que diga `og:url`. Actualmente `og:url` ya apunta a `legadocoleccion.es`, pero Facebook prioriza el dominio real de la URL compartida.

2. **Mejor solucion**: Cambiar el `shareUrl` a `propertyPageUrl` (la URL real del sitio). Esto requiere que el hosting redirija bots a la Edge Function, pero como alternativa inmediata, podemos hacer que Facebook muestre el dominio correcto asegurandonos de que el `og:url` funcione correctamente.

La solucion mas directa y efectiva: **usar `propertyPageUrl` como `shareUrl`**. Facebook accede a esa URL, la SPA carga, y el componente `SEOHead` inyecta los OG tags correctos via JavaScript. Sin embargo, Facebook no ejecuta JavaScript.

**Solucion final**: Mantener la Edge Function como intermediario pero ocultar el dominio tecnico. Para ello, cambiaremos el `shareUrl` a la URL canonica y configuraremos un redirect en el nivel del hosting. Dado que no tenemos control sobre el hosting para hacer redirects por User-Agent, la opcion practica es:

**Cambiar `shareUrl` a `propertyPageUrl`** y confiar en que `SEOHead` establece los meta tags. Aunque Facebook no ejecuta JS, la version actual del `index.html` ya tiene OG tags genericos, que es mejor que mostrar un dominio tecnico.

Sin embargo, hay una alternativa mejor: **mantener la Edge Function pero eliminar la exposicion del dominio tecnico** configurando el share con la url canonica en og:url. Mirando el screenshot mas detenidamente, Facebook SI esta leyendo los OG tags de la Edge Function (titulo y precio correctos), solo que muestra el dominio real. 

## Plan final

Archivo: `src/pages/PropertyDetail.tsx` (linea 232)

Cambiar `shareUrl` de la URL de la Edge Function a `propertyPageUrl` (`https://legadocoleccion.es/propiedad/{slug}`). Esto hara que Facebook muestre `legadocoleccion.es` como dominio.

Para que Facebook siga obteniendo los OG tags correctos, actualizaremos el componente `SEOHead` para incluir las meta tags correctas en el `index.html` inicial via SSR-like approach. Pero dado que esto es una SPA sin SSR, la alternativa es aceptar que Facebook mostrara los OG tags genericos del `index.html`.

**Sin embargo**, revisando la arquitectura actual, hay una mejor solucion: la Edge Function ya funciona perfectamente para servir OG a bots. El unico problema es que Facebook muestra el dominio tecnico. La solucion es simplemente **usar la URL canonica como shareUrl** y, a la vez, mantener los OG tags correctos via la Edge Function redirigiendo desde el dominio principal.

## Cambio concreto

**Archivo**: `src/pages/PropertyDetail.tsx`
- Linea 232: Cambiar `shareUrl` de `https://jfmecotawmdahvhjhpal.supabase.co/functions/v1/property-og?id=...` a `propertyPageUrl` (`https://legadocoleccion.es/propiedad/{slug}`)
- Esto mostrara `legadocoleccion.es` como dominio en Facebook
- Los OG tags seran los genericos del sitio (titulo y descripcion global), pero el dominio sera legible y profesional
- Eliminar la variable `shareUrl` y usar `propertyPageUrl` en su lugar en los handlers de WhatsApp, Facebook y Email

**Nota**: Para tener OG tags dinamicos por propiedad Y dominio limpio, se necesitaria un proxy/CDN que redirija bots a la Edge Function en el nivel de `legadocoleccion.es`. Esto es una configuracion de hosting/DNS fuera del alcance del codigo actual, pero el cambio propuesto resuelve el problema inmediato del texto ilegible.
