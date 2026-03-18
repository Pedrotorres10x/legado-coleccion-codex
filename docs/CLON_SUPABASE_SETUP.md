# Setup del Supabase del clon

Este repo ya incluye el esquema y las Edge Functions necesarias para levantar un proyecto Supabase nuevo, separado del original.

## 1. Qué necesita el proyecto

Base de datos y auth:
- `user_roles`
- `properties`
- `leads`
- `push_subscriptions`
- `push_notification_log`
- `featured_cache`
- `blog_categories`
- `blog_posts`
- `newsletter_subscribers`
- `property_slugs`
- `page_views`

Funciones SQL:
- `has_role(_user_id, _role)`
- `increment_blog_views(post_slug)`
- `assign_admin_on_signup()`
- `check_lead_rate_limit()`
- `check_newsletter_rate_limit()`

Buckets de Storage:
- `property-images`
- `blog-images`

Edge Functions del repo:
- `brevo-manager`
- `crm-proxy`
- `fill-blog-images`
- `generate-blog-article`
- `generate-vapid-keys`
- `get-leads`
- `meta-capi`
- `notify-lead`
- `property-og`
- `push-new-property`
- `push-price-drop`
- `push-weekly-highlights`
- `refresh-featured`
- `rotate-blog`
- `send-newsletter`
- `send-push`
- `similar-properties`
- `sitemap`
- `subscribe-push`
- `sync-featured-to-properties`
- `translate`

## 2. Crear el proyecto nuevo

1. Crea un proyecto nuevo en Supabase.
2. Activa Google Auth si vais a usar el panel admin.
3. Copia los datos del proyecto nuevo y rellena:
   - [`.env`](C:/Users/Pedro%20Torres/OneDrive/Escritorio/legado%20coleccion%20lovable/casa-wow-catalogo-main/.env)
   - [`.env.example`](C:/Users/Pedro%20Torres/OneDrive/Escritorio/legado%20coleccion%20lovable/casa-wow-catalogo-main/.env.example)
   - [`supabase/config.toml`](C:/Users/Pedro%20Torres/OneDrive/Escritorio/legado%20coleccion%20lovable/casa-wow-catalogo-main/supabase/config.toml)

Valores mínimos:
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_CRM_BASE_URL`
- `VITE_SITE_URL`
- `VITE_TRACKING_URL` si queréis tracking externo

## 3. Aplicar el esquema

Con la CLI de Supabase:

```bash
supabase login
supabase link --project-ref TU_PROJECT_ID
supabase db push
```

Eso aplica todas las migraciones de [`supabase/migrations`](C:/Users/Pedro%20Torres/OneDrive/Escritorio/legado%20coleccion%20lovable/casa-wow-catalogo-main/supabase/migrations).

## 4. Crear el primer admin

Las migraciones históricas del proyecto original traen emails antiguos. Para el clon, crea el admin manualmente con este SQL después de registrarte una vez con Google:

Archivo listo:
- [`supabase/manual/first-admin.sql`](C:/Users/Pedro%20Torres/OneDrive/Escritorio/legado%20coleccion%20lovable/casa-wow-catalogo-main/supabase/manual/first-admin.sql)

Flujo:
1. Inicia sesión una vez en `/admin` con Google.
2. Abre el SQL Editor de Supabase.
3. Ejecuta el SQL cambiando el email por el vuestro.

## 5. Desplegar Edge Functions

Despliega todas:

```bash
supabase functions deploy brevo-manager
supabase functions deploy crm-proxy
supabase functions deploy fill-blog-images
supabase functions deploy generate-blog-article
supabase functions deploy generate-vapid-keys
supabase functions deploy get-leads
supabase functions deploy meta-capi
supabase functions deploy notify-lead
supabase functions deploy property-og
supabase functions deploy push-new-property
supabase functions deploy push-price-drop
supabase functions deploy push-weekly-highlights
supabase functions deploy refresh-featured
supabase functions deploy rotate-blog
supabase functions deploy send-newsletter
supabase functions deploy send-push
supabase functions deploy similar-properties
supabase functions deploy sitemap
supabase functions deploy subscribe-push
supabase functions deploy sync-featured-to-properties
supabase functions deploy translate
```

## 6. Secrets de Edge Functions

Secrets detectados en el repo:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SITE_URL`
- `CRM_BASE_URL`
- `CRM_WEB_LEADS_BASE_URL`
- `CRM_API_KEY`
- `BREVO_API_KEY`
- `META_CAPI_ACCESS_TOKEN`
- `INTERNAL_API_KEY`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `LOVABLE_API_KEY`

No todos son obligatorios para arrancar. Prioridad real:

Obligatorios para que el clon funcione:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SITE_URL`
- `CRM_BASE_URL`

Según features:
- `CRM_WEB_LEADS_BASE_URL` solo si queréis separar `web-leads-admin` del resto del CRM
- `BREVO_API_KEY` para newsletter y emails
- `META_CAPI_ACCESS_TOKEN` para Meta CAPI
- `VAPID_PUBLIC_KEY` y `VAPID_PRIVATE_KEY` para push
- `INTERNAL_API_KEY` para jobs internos protegidos
- `CRM_API_KEY` si vuestro CRM lo exige
- `LOVABLE_API_KEY` solo si queréis mantener las funciones IA que lo usan

Ejemplo:

```bash
supabase secrets set SUPABASE_URL=https://TU_PROYECTO.supabase.co
supabase secrets set SUPABASE_ANON_KEY=TU_SUPABASE_ANON_KEY
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY
supabase secrets set SITE_URL=https://tu-dominio.com
supabase secrets set CRM_BASE_URL=https://TU_CRM.supabase.co/functions/v1
```

Contrato actual esperado con el CRM:

- frontend y funciones publicas -> `public-properties`
- frontend -> `public-lead`
- `web-leads-admin`

Nota:

- `crm-proxy` debe quedar solo para lectura administrativa o circuitos internos justificados
- `receive-lead` es una ruta heredada y ya no forma parte del circuito activo

## 7. Qué revisar después

- `public/robots.txt`
- `public/sitemap.xml`
- contenido SEO en:
  - [`src/lib/seo-schemas.ts`](C:/Users/Pedro%20Torres/OneDrive/Escritorio/legado%20coleccion%20lovable/casa-wow-catalogo-main/src/lib/seo-schemas.ts)
  - [`src/components/SEOHead.tsx`](C:/Users/Pedro%20Torres/OneDrive/Escritorio/legado%20coleccion%20lovable/casa-wow-catalogo-main/src/components/SEOHead.tsx)
- remitentes y destinatarios en:
  - [`supabase/functions/notify-lead/index.ts`](C:/Users/Pedro%20Torres/OneDrive/Escritorio/legado%20coleccion%20lovable/casa-wow-catalogo-main/supabase/functions/notify-lead/index.ts)
  - [`supabase/functions/brevo-manager/index.ts`](C:/Users/Pedro%20Torres/OneDrive/Escritorio/legado%20coleccion%20lovable/casa-wow-catalogo-main/supabase/functions/brevo-manager/index.ts)

## 8. Validación rápida

Cuando el proyecto nuevo esté configurado:

```bash
npm run build
```

Y comprueba:
- `/propiedades` carga desde vuestro CRM
- `/admin` autentica con vuestro Supabase
- un lead entra en `leads`
- newsletter inserta en `newsletter_subscribers`
- `property-og` y `sitemap` responden en vuestro proyecto
