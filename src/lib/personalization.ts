import type { ExternalPropertyFilters } from "@/hooks/useExternalProperties";

type CountMap = Record<string, number>;

export type AreaRouteMeta = {
  label: string;
  href: string;
  description: string;
};

export type TopicGuideMeta = {
  label: string;
  href: string;
  description: string;
};

type MatchableProperty = {
  id: string;
  city?: string;
  location?: string;
  zone?: string | null;
  property_type?: string;
};

export type PersonalizationProperty = {
  id: string;
  title: string;
  href: string;
  city?: string;
  price?: number;
  viewedAt: string;
};

export type PersonalizationProfile = {
  version: 1;
  updatedAt: string;
  areaCounts: CountMap;
  topicCounts: CountMap;
  cityCounts: CountMap;
  recentProperties: PersonalizationProperty[];
  lastAreaSlug?: string;
  lastGuideSlug?: string;
};

export type PersonalizationSuggestion = {
  title: string;
  description: string;
  href: string;
  kind: "area" | "catalog" | "guide" | "property";
};

export type IntentStage = "early" | "mid" | "late";

export type PushPreferencePayload = {
  preferences: {
    areaSlugs: string[];
    topics: string[];
    cities: string[];
    recentPropertyIds: string[];
  };
  intent: {
    score: number;
    stage: IntentStage;
  };
  updatedAt: string;
};

export type IntentSummaryPayload = {
  score: number;
  stage: IntentStage;
  topAreaSlug?: string;
  topTopic?: string;
  topCities: string[];
  recentPropertyIds: string[];
};

const STORAGE_KEY = "legado_personalization_profile";
const UPDATE_EVENT = "legado:personalization-updated";

const DEFAULT_PROFILE: PersonalizationProfile = {
  version: 1,
  updatedAt: new Date(0).toISOString(),
  areaCounts: {},
  topicCounts: {},
  cityCounts: {},
  recentProperties: [],
};

const areaRouteMeta: Record<string, AreaRouteMeta> = {
  "property-for-sale-finestrat": {
    label: "Finestrat",
    href: "/property-for-sale-finestrat",
    description: "Retoma la búsqueda moderna y compara viviendas concretas en Finestrat.",
  },
  "new-build-property-finestrat": {
    label: "New Build in Finestrat",
    href: "/new-build-property-finestrat",
    description: "Vuelve a la ruta de obra nueva que ya te interesó y abre fichas reales.",
  },
  "property-for-sale-benidorm": {
    label: "Benidorm",
    href: "/property-for-sale-benidorm",
    description: "Sigue comparando apartamentos y vistas en Benidorm desde propiedades reales.",
  },
  "apartments-for-sale-benidorm": {
    label: "Benidorm Apartments",
    href: "/apartments-for-sale-benidorm",
    description: "Retoma apartamentos concretos en Benidorm y entra en sus fichas completas.",
  },
  "sea-view-apartments-benidorm": {
    label: "Sea View Benidorm",
    href: "/sea-view-apartments-benidorm",
    description: "Vuelve a los apartamentos con vistas y compara mejor antes de consultar.",
  },
  "property-for-sale-alicante-city": {
    label: "Alicante City",
    href: "/property-for-sale-alicante-city",
    description: "Sigue la búsqueda city-plus-coast y revisa viviendas pensadas para uso real.",
  },
  "property-for-sale-orihuela-costa": {
    label: "Orihuela Costa",
    href: "/property-for-sale-orihuela-costa",
    description: "Retoma la búsqueda en Orihuela Costa con acceso directo a propiedades concretas.",
  },
  "property-for-sale-torrevieja": {
    label: "Torrevieja",
    href: "/property-for-sale-torrevieja",
    description: "Vuelve a una de las rutas con más inventario vivo y entra en fichas concretas.",
  },
  "property-for-sale-pilar-de-la-horadada": {
    label: "Pilar de la Horadada",
    href: "/property-for-sale-pilar-de-la-horadada",
    description: "Sigue donde lo dejaste y compara viviendas concretas en Pilar.",
  },
  "property-for-sale-ciudad-quesada-rojales": {
    label: "Ciudad Quesada / Rojales",
    href: "/property-for-sale-ciudad-quesada-rojales",
    description: "Retoma la búsqueda residencial y abre fichas de casas y villas concretas.",
  },
  "property-for-sale-alicante-province": {
    label: "Alicante Province",
    href: "/property-for-sale-alicante-province",
    description: "Vuelve al hub provincial, pero esta vez para bajar rápido a viviendas concretas.",
  },
};

const topicGuideMeta: Record<string, TopicGuideMeta> = {
  mortgage: {
    label: "Mortgage guide",
    href: "/guides/mortgage-in-spain-for-non-residents",
    description: "Como has mostrado interés en hipoteca, retoma esa guía antes de volver a tus fichas.",
  },
  legal: {
    label: "Legal guide",
    href: "/guides/legal-process-for-buying-property-in-spain",
    description: "El proceso legal parece importante para ti; aquí tienes el siguiente paso útil.",
  },
  areas: {
    label: "Best areas guide",
    href: "/best-areas-to-buy-property-in-alicante-province",
    description: "Si todavía estás comparando zonas, esta guía puede ayudarte a elegir mejor sin dispersarte.",
  },
};

const areaIntentFilters: Record<string, ExternalPropertyFilters> = {
  "property-for-sale-finestrat": { cityAny: ["Finestrat"] },
  "new-build-property-finestrat": { cityAny: ["Finestrat"] },
  "property-for-sale-benidorm": { cityAny: ["Benidorm"] },
  "apartments-for-sale-benidorm": { cityAny: ["Benidorm"], type: "piso" },
  "sea-view-apartments-benidorm": { cityAny: ["Benidorm"], type: "piso" },
  "property-for-sale-alicante-city": { cityAny: ["Alicante", "Alicante (Alacant)"] },
  "property-for-sale-orihuela-costa": { cityAny: ["Orihuela"], locationAny: ["Orihuela Costa"] },
  "property-for-sale-torrevieja": { cityAny: ["Torrevieja"] },
  "property-for-sale-pilar-de-la-horadada": { cityAny: ["Pilar de la Horadada"] },
  "property-for-sale-ciudad-quesada-rojales": { cityAny: ["Rojales"], locationAny: ["Ciudad Quesada", "Quesada"] },
  "property-for-sale-rojales": { cityAny: ["Rojales"] },
  "property-for-sale-guardamar-del-segura": { cityAny: ["Guardamar del Segura", "Guardamar"] },
  "property-for-sale-san-miguel-de-salinas": { cityAny: ["San Miguel de Salinas"] },
};

function safeParseProfile(raw: string | null): PersonalizationProfile {
  if (!raw) return DEFAULT_PROFILE;

  try {
    const parsed = JSON.parse(raw) as Partial<PersonalizationProfile>;
    return {
      version: 1,
      updatedAt: parsed.updatedAt || DEFAULT_PROFILE.updatedAt,
      areaCounts: parsed.areaCounts || {},
      topicCounts: parsed.topicCounts || {},
      cityCounts: parsed.cityCounts || {},
      recentProperties: Array.isArray(parsed.recentProperties) ? parsed.recentProperties.slice(0, 6) : [],
      lastAreaSlug: parsed.lastAreaSlug,
      lastGuideSlug: parsed.lastGuideSlug,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function readPersonalizationProfile(): PersonalizationProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  return safeParseProfile(window.localStorage.getItem(STORAGE_KEY));
}

function writeProfile(profile: PersonalizationProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
}

function incrementCount(map: CountMap, key?: string) {
  if (!key) return map;
  map[key] = (map[key] || 0) + 1;
  return map;
}

function inferAreaSlugFromCity(city?: string) {
  const normalized = (city || "").trim().toLowerCase();
  if (!normalized) return undefined;

  if (normalized.includes("finestrat")) return "property-for-sale-finestrat";
  if (normalized.includes("benidorm")) return "property-for-sale-benidorm";
  if (normalized.includes("alicante")) return "property-for-sale-alicante-city";
  if (normalized.includes("torrevieja")) return "property-for-sale-torrevieja";
  if (normalized.includes("orihuela")) return "property-for-sale-orihuela-costa";
  if (normalized.includes("rojales") || normalized.includes("quesada")) return "property-for-sale-ciudad-quesada-rojales";
  if (normalized.includes("pilar")) return "property-for-sale-pilar-de-la-horadada";
  return undefined;
}

export function recordAreaIntent(params: {
  slug: string;
  city?: string;
  topics?: string[];
}) {
  const profile = readPersonalizationProfile();
  incrementCount(profile.areaCounts, params.slug);
  incrementCount(profile.cityCounts, params.city);
  params.topics?.forEach((topic) => incrementCount(profile.topicCounts, topic));
  profile.lastAreaSlug = params.slug;
  profile.updatedAt = new Date().toISOString();
  writeProfile(profile);
}

export function recordGuideIntent(params: {
  slug: string;
  topics?: string[];
}) {
  const profile = readPersonalizationProfile();
  params.topics?.forEach((topic) => incrementCount(profile.topicCounts, topic));
  profile.lastGuideSlug = params.slug;
  profile.updatedAt = new Date().toISOString();
  writeProfile(profile);
}

export function recordPropertyIntent(property: {
  id: string;
  title: string;
  href: string;
  city?: string;
  price?: number;
}) {
  const profile = readPersonalizationProfile();
  incrementCount(profile.cityCounts, property.city);
  incrementCount(profile.areaCounts, inferAreaSlugFromCity(property.city));
  profile.recentProperties = [
    {
      ...property,
      viewedAt: new Date().toISOString(),
    },
    ...profile.recentProperties.filter((item) => item.id !== property.id),
  ].slice(0, 4);
  profile.updatedAt = new Date().toISOString();
  writeProfile(profile);
}

export function recordSearchIntent(params: {
  city?: string;
  type?: string;
}) {
  const profile = readPersonalizationProfile();
  incrementCount(profile.cityCounts, params.city);
  incrementCount(profile.areaCounts, inferAreaSlugFromCity(params.city));
  if (params.type === "piso") incrementCount(profile.topicCounts, "apartments");
  if (params.type === "villa") incrementCount(profile.topicCounts, "villa");
  profile.updatedAt = new Date().toISOString();
  writeProfile(profile);
}

function topKey(map: CountMap) {
  return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0];
}

export function getTopAreaSlug(profile: PersonalizationProfile) {
  return profile.lastAreaSlug || topKey(profile.areaCounts);
}

export function getTopTopic(profile: PersonalizationProfile) {
  return topKey(profile.topicCounts);
}

export function getAreaRouteMeta(slug?: string) {
  if (!slug) return undefined;
  return areaRouteMeta[slug];
}

export function getTopicGuideMeta(topic?: string) {
  if (!topic) return undefined;
  return topicGuideMeta[topic];
}

export function getAreaIntentFilters(slug?: string) {
  if (!slug) return undefined;
  return areaIntentFilters[slug];
}

export function getPersonalizedSuggestions(profile: PersonalizationProfile): PersonalizationSuggestion[] {
  const suggestions: PersonalizationSuggestion[] = [];
  const lastProperty = profile.recentProperties[0];
  const topArea = getTopAreaSlug(profile);
  const topTopic = getTopTopic(profile);

  if (lastProperty) {
    suggestions.push({
      title: `Retomar ${lastProperty.title}`,
      description: "Vuelve directamente a la ficha que viste recientemente y decide si merece una consulta.",
      href: lastProperty.href,
      kind: "property",
    });
  }

  if (topArea && areaRouteMeta[topArea]) {
    const route = areaRouteMeta[topArea];
    suggestions.push({
      title: `Seguir por ${route.label}`,
      description: route.description,
      href: route.href,
      kind: "area",
    });
  }

  if (topTopic && topicGuideMeta[topTopic]) {
    const guide = topicGuideMeta[topTopic];
    suggestions.push({
      title: `Retomar ${guide.label}`,
      description: guide.description,
      href: guide.href,
      kind: "guide",
    });
  }

  suggestions.push({
    title: "Abrir catálogo filtrable",
    description: "Si quieres retomar la búsqueda general, entra al catálogo y sigue abriendo fichas concretas.",
    href: "/propiedades",
    kind: "catalog",
  });

  const seen = new Set<string>();
  return suggestions.filter((item) => {
    if (seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  }).slice(0, 3);
}

export function getPushPreferencePayload(profile = readPersonalizationProfile()): PushPreferencePayload {
  const topAreas = Object.entries(profile.areaCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key]) => key);
  const topTopics = Object.entries(profile.topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key]) => key);
  const topCities = Object.entries(profile.cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key]) => key);

  return {
    preferences: {
      areaSlugs: topAreas,
      topics: topTopics,
      cities: topCities,
      recentPropertyIds: profile.recentProperties.map((item) => item.id).slice(0, 4),
    },
    intent: {
      score: getIntentScore(profile),
      stage: getIntentStage(profile),
    },
    updatedAt: profile.updatedAt,
  };
}

export function getIntentSummaryPayload(profile = readPersonalizationProfile()): IntentSummaryPayload {
  return {
    score: getIntentScore(profile),
    stage: getIntentStage(profile),
    topAreaSlug: getTopAreaSlug(profile),
    topTopic: getTopTopic(profile),
    topCities: Object.entries(profile.cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([key]) => key),
    recentPropertyIds: profile.recentProperties.map((item) => item.id).slice(0, 4),
  };
}

export function hasPersonalizationSignal(profile: PersonalizationProfile) {
  return (
    profile.recentProperties.length > 0 ||
    Object.keys(profile.areaCounts).length > 0 ||
    Object.keys(profile.topicCounts).length > 0
  );
}

export function getIntentScore(profile: PersonalizationProfile) {
  const recentPropertiesScore = Math.min(profile.recentProperties.length * 22, 44);
  const areaDepthScore = Math.min(Object.keys(profile.areaCounts).length * 10, 20);
  const topicDepthScore = Math.min(Object.keys(profile.topicCounts).length * 8, 16);
  const repeatedAreaBonus = Object.values(profile.areaCounts).some((count) => count >= 2) ? 10 : 0;
  const decisiveTopicBonus =
    profile.topicCounts.mortgage || profile.topicCounts.legal || profile.topicCounts.new_build ? 10 : 0;

  return Math.min(
    recentPropertiesScore + areaDepthScore + topicDepthScore + repeatedAreaBonus + decisiveTopicBonus,
    100
  );
}

export function getIntentStage(profile: PersonalizationProfile): IntentStage {
  const score = getIntentScore(profile);
  if (score >= 65) return "late";
  if (score >= 30) return "mid";
  return "early";
}

function normalizeMatchValue(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[()'.,/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function propertyIntentScore(profile: PersonalizationProfile, property: MatchableProperty) {
  let score = 0;
  const topAreaSlug = getTopAreaSlug(profile);
  const topTopic = getTopTopic(profile);
  const recentCity = normalizeMatchValue(profile.recentProperties[0]?.city);
  const city = normalizeMatchValue(property.city || property.location);
  const zone = normalizeMatchValue(property.zone);

  if (recentCity && city && city === recentCity) score += 30;

  const areaFilters = getAreaIntentFilters(topAreaSlug);
  if (areaFilters?.cityAny?.some((alias) => normalizeMatchValue(alias) === city)) score += 24;
  if (areaFilters?.locationAny?.some((alias) => [city, zone].includes(normalizeMatchValue(alias)))) score += 22;
  if (areaFilters?.zoneAny?.some((alias) => normalizeMatchValue(alias) === zone)) score += 18;

  if (topTopic === "apartments" && property.property_type === "piso") score += 14;
  if (topTopic === "villa" && property.property_type === "villa") score += 14;

  return score;
}

export function sortPropertiesByIntent<T extends MatchableProperty>(
  profile: PersonalizationProfile,
  properties: T[]
) {
  return [...properties].sort((a, b) => propertyIntentScore(profile, b) - propertyIntentScore(profile, a));
}

export function propertyMatchesIntent(profile: PersonalizationProfile, property: MatchableProperty) {
  return propertyIntentScore(profile, property) >= 20;
}

export function subscribeToPersonalizationUpdates(callback: () => void) {
  if (typeof window === "undefined") return () => undefined;

  const handler = () => callback();
  window.addEventListener(UPDATE_EVENT, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(UPDATE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
