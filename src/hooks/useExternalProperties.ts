import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";
import { crmFunctionUrl } from "@/lib/crm";
import { buildPropertySlug } from "@/lib/utils";

// Shape used across components
export type ExternalProperty = {
  id: string;
  title: string;
  description?: string | null;
  property_type: string;
  status: string;
  price: number;
  city: string;
  country?: string | null;
  is_international?: boolean | null;
  zone?: string | null;
  province?: string | null;
  address?: string | null;
  bedrooms: number;
  bathrooms: number;
  surface_area: number;
  built_area?: number | null;
  operation?: string;
  images?: string[] | null;
  videos?: string[] | null;
  virtual_tour_url?: string | null;
  is_featured?: boolean | null;
  created_at: string;
  energy_cert?: string | null;
  has_garden?: boolean | null;
  has_elevator?: boolean | null;
  has_garage?: boolean | null;
  has_pool?: boolean | null;
  has_terrace?: boolean | null;
  features?: string[] | null;
  crm_reference?: string | null;
  location?: string;
  area_m2?: number;
  reference?: string | null;
  year_built?: number | null;
  floor?: string | number | null;
};

export type ExternalPropertyFilters = {
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  cityAny?: string[];
  zoneAny?: string[];
  locationAny?: string[];
  province?: string;
  minBeds?: number;
  country?: string;
};

export type ExternalPropertySort = "price_asc" | "price_desc" | "newest" | "area_desc";

const PAGE_SIZE = 20;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RawCrmProperty = {
  id: string;
  title: string;
  property_type: string;
  status: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  created_at: string;
  description?: string | null;
  city?: string | null;
  location?: string | null;
  country?: string | null;
  is_international?: boolean | null;
  zone?: string | null;
  province?: string | null;
  address?: string | null;
  surface_area?: number | null;
  built_area?: number | null;
  area_m2?: number | null;
  operation?: string | null;
  images?: string[] | null;
  videos?: string[] | null;
  virtual_tour_url?: string | null;
  is_featured?: boolean | null;
  energy_cert?: string | null;
  has_garden?: boolean | null;
  has_elevator?: boolean | null;
  has_garage?: boolean | null;
  has_pool?: boolean | null;
  has_terrace?: boolean | null;
  features?: string[] | null;
  crm_reference?: string | null;
  reference?: string | null;
  year_built?: number | null;
  floor?: string | number | null;
};

type PropertiesApiResponse = {
  properties?: RawCrmProperty[];
  property?: RawCrmProperty;
  property_id?: string;
  total?: number;
  total_pages?: number;
  filters?: {
    cities?: string[];
  };
};

export type CrmLeadSyncInput = {
  full_name: string;
  email: string;
  phone?: string;
  message?: string;
  property_id?: string | null;
  gdpr_consent?: boolean;
  gdpr_timestamp?: string;
  metadata?: unknown;
};

export type CrmLeadSyncResult = {
  ok: boolean;
  synced: boolean;
  skipped?: boolean;
  reason?: string;
  status?: number;
  data?: unknown;
};

/** Normaliza campos para compatibilidad con componentes existentes */
function normalizeProperty(p: RawCrmProperty): ExternalProperty {
  return {
    ...p,
    city: p.city || p.location || "",
    location: p.location || p.city || "",
    surface_area: p.surface_area ?? p.area_m2 ?? 0,
    area_m2: p.surface_area ?? p.area_m2 ?? 0,
    reference: p.crm_reference,
  };
}

function normalizeLocationValue(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[()'.,/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function matchesAliases(value: string | null | undefined, aliases?: string[]) {
  if (!aliases?.length) return true;
  const normalizedValue = normalizeLocationValue(value);
  if (!normalizedValue) return false;

  return aliases.some((alias) => normalizeLocationValue(alias) === normalizedValue);
}

/** Genera el slug único para una propiedad */
function buildUniqueSlug(p: ExternalProperty): string {
  const base = buildPropertySlug(p.title, p.city || p.location || "");
  const suffix = p.id.replace(/-/g, "").slice(-5);
  return `${base}-${suffix}`;
}

/** Ordena propiedades en cliente como fallback cuando la API no respeta sort */
function sortProperties(properties: ExternalProperty[], sort: ExternalPropertySort): ExternalProperty[] {
  const list = [...properties];

  switch (sort) {
    case "price_asc":
      return list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    case "price_desc":
      return list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    case "area_desc":
      return list.sort(
        (a, b) => (b.surface_area ?? b.area_m2 ?? 0) - (a.surface_area ?? a.area_m2 ?? 0)
      );
    case "newest":
    default:
      return list.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }
}

/** Guarda en BD la correspondencia slug → property_id (fire & forget) */
async function savePropertySlugs(properties: ExternalProperty[]) {
  if (!properties.length) return;
  const rows: TablesInsert<"property_slugs">[] = properties.map((p) => ({
    slug: buildUniqueSlug(p),
    property_id: p.id,
    title: p.title,
    city: p.city || p.location || "",
  }));
  await supabase.from("property_slugs").upsert(rows, { onConflict: "slug" }).throwOnError();
}

/** Fetch a single property from the CRM API by ID */
async function fetchPropertyById(id: string): Promise<ExternalProperty | null> {
  const res = await fetch(crmFunctionUrl("public-properties", { id }));
  if (!res.ok) return null;
  const json = (await res.json()) as PropertiesApiResponse;
  const raw = json.property || json.properties?.[0] || json;
  if (!raw?.id) return null;
  const normalized = normalizeProperty(raw);
  savePropertySlugs([normalized]).catch(() => {});
  return normalized;
}

/** Busca un property_id a partir de un slug */
export async function resolveSlugToPropertyId(slug: string): Promise<string | null> {
  const { data } = await supabase
    .from("property_slugs")
    .select("property_id")
    .eq("slug", slug)
    .maybeSingle();

  if (data?.property_id) return data.property_id;

  // Fallback: buscar en CRM por sufijo de ID (eficiente, 1 sola petición)
  const parts = slug.split("-");
  const idSuffix = parts[parts.length - 1];

  if (idSuffix && /^[a-f0-9]{4,12}$/i.test(idSuffix)) {
    try {
      const res = await fetch(crmFunctionUrl("public-properties", { id_suffix: idSuffix }));
      if (res.ok) {
        const json = (await res.json()) as PropertiesApiResponse;
        if (json.property_id) {
          await fetchPropertyById(json.property_id);
          return json.property_id;
        }
      }
    } catch { /* ignore */ }
  }

  return null;
}

/** Hook que resuelve slug → propiedad completa */
export function usePropertyBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["property-by-slug", slug],
    queryFn: async () => {
      if (!slug) return null;
      const propertyId = await resolveSlugToPropertyId(slug);
      if (!propertyId) return null;
      return fetchPropertyById(propertyId);
    },
    enabled: !!slug,
    retry: 1,
  });
}

export function useExternalProperties(
  filters: ExternalPropertyFilters = {},
  sort: ExternalPropertySort = "newest",
  page: number = 1,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["external-properties", filters, sort, page],
    staleTime: 5 * 60 * 1000,
    enabled,
    queryFn: async () => {
      const countryFilter = filters.country;
      const hasAliasFilters =
        !!filters.cityAny?.length || !!filters.zoneAny?.length || !!filters.locationAny?.length;
      const shouldAggregateAllPages = !!countryFilter || sort !== "newest" || hasAliasFilters;
      const requestedLimit = shouldAggregateAllPages ? 1000 : PAGE_SIZE;

      const fetchPage = async (pageToFetch: number) => {
        const res = await fetch(
          crmFunctionUrl("public-properties", {
            page: pageToFetch,
            limit: requestedLimit,
            type: filters.type,
            city: filters.city,
            min_price: filters.minPrice,
            max_price: filters.maxPrice,
            min_bedrooms: filters.minBeds,
            sort,
          })
        );
        if (!res.ok) throw new Error("Failed to fetch properties");
        return (await res.json()) as PropertiesApiResponse;
      };

      const firstJson = await fetchPage(1);

      let properties = (firstJson.properties || []).map(normalizeProperty);

      if (shouldAggregateAllPages && (firstJson.total_pages || 1) > 1) {
        const pages = Array.from({ length: (firstJson.total_pages || 1) - 1 }, (_, i) => i + 2);
        const responses = await Promise.all(pages.map((p) => fetchPage(p).catch(() => null)));
        const additional = responses.flatMap((json) => (json?.properties || []).map(normalizeProperty));
        properties = [...properties, ...additional];
      }

      // Evitar duplicados si la API solapa resultados entre páginas
      properties = Array.from(new Map(properties.map((p) => [p.id, p])).values());
      savePropertySlugs(properties).catch(() => {});

      // Client-side country filter — uses is_international if available, falls back to country string
      if (countryFilter) {
        const isIntl = (p: ExternalProperty) => {
          if (p.is_international != null) return p.is_international;
          const c = (p.country || "España").trim().toLowerCase();
          return c !== "españa" && c !== "spain" && c !== "es" && c !== "";
        };
        if (countryFilter === "__international") {
          properties = properties.filter(isIntl);
        } else {
          properties = properties.filter((p: ExternalProperty) => !isIntl(p));
        }
      }

      if (filters.cityAny?.length) {
        properties = properties.filter((p) => matchesAliases(p.city, filters.cityAny));
      }

      if (filters.zoneAny?.length) {
        properties = properties.filter((p) => matchesAliases(p.zone, filters.zoneAny));
      }

      if (filters.locationAny?.length) {
        properties = properties.filter((p) =>
          [p.city, p.zone, p.location].some((value) => matchesAliases(value, filters.locationAny))
        );
      }

      // Fallback: la API externa no siempre respeta el sort solicitado
      properties = sortProperties(properties, sort);

      const total = shouldAggregateAllPages ? properties.length : (firstJson.total || 0);

      return {
        properties: shouldAggregateAllPages
          ? properties.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
          : properties,
        total,
        pageSize: PAGE_SIZE,
        totalPages: shouldAggregateAllPages
          ? Math.ceil(total / PAGE_SIZE)
          : (firstJson.total_pages || Math.ceil((firstJson.total || 0) / PAGE_SIZE)),
        cities: firstJson.filters?.cities || [],
      };
    },
  });
}

export function useExternalProperty(id: string) {
  return useQuery({
    queryKey: ["external-property", id],
    queryFn: async () => {
      const property = await fetchPropertyById(id);
      if (property) return property;
      throw new Error("Property not found");
    },
    enabled: !!id,
  });
}

export function useFeaturedExternalProperties(filters: ExternalPropertyFilters = {}) {
  return useQuery({
    queryKey: ["external-properties", "featured", filters],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      // Fetch ALL properties to guarantee we pick the true top 3 by price
      const fetchPage = async (page: number) => {
        const res = await fetch(
          crmFunctionUrl("public-properties", { sort: "price_desc", limit: 100, page })
        );
        if (!res.ok) throw new Error("Failed to fetch featured");
        return (await res.json()) as PropertiesApiResponse;
      };

      const firstJson = await fetchPage(1);
      let all = (firstJson.properties || []).map(normalizeProperty);

      // Fetch remaining pages if any
      const totalPages = firstJson.total_pages || 1;
      if (totalPages > 1) {
        const pages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
        const responses = await Promise.all(pages.map((p) => fetchPage(p).catch(() => null)));
        const additional = responses.flatMap((json) => (json?.properties || []).map(normalizeProperty));
        all = [...all, ...additional];
      }

      // Deduplicate first
      all = Array.from(new Map(all.map((p) => [p.id, p])).values());

      if (filters.type) {
        all = all.filter((p) => p.property_type === filters.type);
      }

      if (filters.minPrice) {
        all = all.filter((p) => (p.price ?? 0) >= filters.minPrice);
      }

      if (filters.maxPrice) {
        all = all.filter((p) => (p.price ?? 0) <= filters.maxPrice);
      }

      if (filters.minBeds) {
        all = all.filter((p) => (p.bedrooms ?? 0) >= filters.minBeds);
      }

      if (filters.city) {
        all = all.filter((p) => normalizeLocationValue(p.city) === normalizeLocationValue(filters.city));
      }

      if (filters.cityAny?.length) {
        all = all.filter((p) => matchesAliases(p.city, filters.cityAny));
      }

      if (filters.zoneAny?.length) {
        all = all.filter((p) => matchesAliases(p.zone, filters.zoneAny));
      }

      if (filters.locationAny?.length) {
        all = all.filter((p) =>
          [p.city, p.zone, p.location].some((value) => matchesAliases(value, filters.locationAny))
        );
      }

      if (filters.province) {
        all = all.filter(
          (p) => normalizeLocationValue(p.province) === normalizeLocationValue(filters.province)
        );
      }

      // Sort by price descending, take top 3
      const props = all
        .sort((a: ExternalProperty, b: ExternalProperty) => (b.price ?? 0) - (a.price ?? 0))
        .slice(0, 3);

      savePropertySlugs(props).catch(() => {});
      return props;
    },
  });
}

export function useSimilarProperties(property: ExternalProperty | undefined) {
  const isIntl = (p: ExternalProperty) => {
    if (p.is_international != null) return p.is_international;
    const c = (p.country || "España").trim().toLowerCase();
    return c !== "españa" && c !== "spain" && c !== "es" && c !== "";
  };

  return useQuery({
    queryKey: ["similar-properties", property?.id],
    queryFn: async () => {
      const propertyIsInternational = isIntl(property!);

      const params = new URLSearchParams();
      // For international properties, don't filter by city — fetch broadly
      if (!propertyIsInternational && property!.city) params.set("city", property!.city);
      params.set("min_price", String(Math.round(property!.price * 0.7)));
      params.set("max_price", String(Math.round(property!.price * 1.3)));
      params.set("limit", propertyIsInternational ? "50" : "6");

      const res = await fetch(crmFunctionUrl("public-properties", Object.fromEntries(params.entries())));
      if (!res.ok) return [];
      const json = (await res.json()) as PropertiesApiResponse;
      const all = (json.properties || [])
        .map(normalizeProperty)
        .filter((p: ExternalProperty) => p.id !== property!.id);

      // International → prefer international, fallback to national if not enough
      // National → exclude international
      const filtered = all.filter((p: ExternalProperty) =>
        propertyIsInternational ? isIntl(p) : !isIntl(p)
      );

      if (filtered.length >= 3 || !propertyIsInternational) {
        return filtered.slice(0, 6) as ExternalProperty[];
      }

      // Not enough international — fill with national
      const national = all.filter((p: ExternalProperty) => !isIntl(p));
      return [...filtered, ...national].slice(0, 6) as ExternalProperty[];
    },
    enabled: !!property?.id,
  });
}

export async function submitLeadToCRM(lead: CrmLeadSyncInput): Promise<CrmLeadSyncResult> {
  const propertyId = lead.property_id?.trim();

  if (propertyId && !UUID_PATTERN.test(propertyId)) {
    return {
      ok: true,
      synced: false,
      skipped: true,
      reason: "invalid_property_id",
    };
  }

  try {
    const res = await fetch(crmFunctionUrl("public-lead"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...lead, property_id: propertyId ?? null }),
    });
    if (!res.ok) {
      console.warn("CRM lead sync failed (non-blocking):", res.status);
      return { ok: false, synced: false, status: res.status };
    }
    return {
      ok: true,
      synced: true,
      data: await res.json(),
    };
  } catch (err) {
    console.warn("CRM lead sync error (non-blocking):", err);
    return { ok: false, synced: false };
  }
}
