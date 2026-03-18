# CRM Legado Intent Handoff

## Objetivo
La web ya calcula una capa de intencion comercial para no tratar igual a todos los usuarios. Ese contexto no debe quedarse solo en el frontend o en Supabase local: tambien debe llegar y persistirse en CRM Legado.

## Payload que ya sale desde la web
Los envios de lead y las suscripciones push ya incluyen un objeto `metadata` con informacion de intencion.

### Leads
Campos relevantes que ahora viajan con cada lead:

```json
{
  "metadata": {
    "score": 72,
    "stage": "late",
    "topAreaSlug": "property-for-sale-finestrat",
    "topTopic": "mortgage",
    "topCities": ["Finestrat", "Benidorm"],
    "recentPropertyIds": ["uuid-1", "uuid-2"]
  }
}
```

### Push subscriptions
Las suscripciones push tambien incluyen:

```json
{
  "preferences": {
    "areaSlugs": ["property-for-sale-finestrat"],
    "topics": ["mortgage"],
    "cities": ["Finestrat"],
    "recentPropertyIds": ["uuid-1"]
  },
  "intent": {
    "score": 72,
    "stage": "late"
  }
}
```

## Estado actual en CRM Legado
El circuito principal ya esta operativo:

1. `public-lead` recibe el payload desde la web
2. `public-lead` ya acepta tanto leads ligados a propiedad como leads generales sin `property_id`
3. persiste `buyer_intent`
4. persiste `intent_score`
5. persiste `intent_stage`
6. persiste `intent_top_area_slug`
7. persiste `intent_top_topic`
8. expone esa senal de vuelta en `web-leads-admin`

### Leads generales
Cuando el lead no llega ligado a una propiedad:

- la web ya no lo descarta
- el CRM crea igualmente el contacto
- el CRM registra una interaccion general sin `property_id`
- el lead queda etiquetado con `general-web-lead`

Pendiente de ampliacion si se quiere paridad total con el payload web:

- `metadata.topCities`
- `metadata.recentPropertyIds`

## Uso comercial sugerido en CRM
- `late + property linked`: lead muy caliente, priorizar seguimiento rapido
- `late + mortgage`: asignar a flujo financiero / comprador no residente
- `mid + topAreaSlug claro`: mantener follow-up por zona concreta
- `early`: nutrir con shortlist y contenido util, no con presion comercial

## Sitios del repo donde ya se envia este contexto
- `src/components/LeadForm.tsx`
- `src/components/PropertyCard.tsx`
- `src/components/ExitIntentPopup.tsx`
- `src/lib/leads.ts`
- `src/lib/pushNotifications.ts`
- `src/hooks/usePageTracking.ts`

## Nota importante
El proxy actual ya reenvia este payload al CRM activo y el CRM ya lo interpreta en el circuito principal.

Lo importante ahora no es "conectar" esta metadata, sino evitar drift:

- mantener `public-lead` como ruta viva
- mantener `web-leads-admin` como lectura administrativa
- no reintroducir rutas heredadas como `receive-lead`
