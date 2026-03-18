const META_PIXEL_ID = "1255986579960911";

type FbqQueueItem = unknown[];

type FbqFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: FbqQueueItem[];
  push: (item: FbqQueueItem) => void;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: FbqFunction;
    _fbq?: FbqFunction;
  }
}

let initialized = false;

export function initMetaPixel() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  if (!window.fbq) {
    const fbq: FbqFunction = ((...args: unknown[]) => {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
        return;
      }

      fbq.queue.push(args);
    }) as FbqFunction;

    fbq.queue = [];
    fbq.push = (item: FbqQueueItem) => {
      fbq.queue.push(item);
    };
    fbq.loaded = true;
    fbq.version = "2.0";

    window.fbq = fbq;
    window._fbq = fbq;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";

    const firstScript = document.getElementsByTagName("script")[0];
    firstScript?.parentNode?.insertBefore(script, firstScript);
  }

  window.fbq?.("init", META_PIXEL_ID);
  window.fbq?.("track", "PageView");
}

// ── Cookie helpers ─────────────────────────────────────────
function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function getBrowserData() {
  const fbp = getCookie("_fbp");
  let fbc = getCookie("_fbc") || undefined;

  // If no _fbc cookie yet, construct from fbclid and persist as cookie
  // so both Pixel and CAPI use the exact same value.
  if (!fbc) {
    const fbclid = new URLSearchParams(window.location.search).get("fbclid");
    if (fbclid) {
      fbc = `fb.1.${Date.now()}.${fbclid}`;
      // Persist so subsequent events (and the Pixel) read the same value
      document.cookie = `_fbc=${fbc}; max-age=${7 * 86400}; path=/; SameSite=Lax`;
    }
  }

  return { fbp, fbc };
}

// ── CAPI helper ────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

// Set to undefined in production once testing is complete
const META_TEST_EVENT_CODE: string | undefined = undefined;

// CAPI enabled — sends server-side events to Meta for deduplication & enrichment
const CAPI_ENABLED = true;

function sendCAPI(
  event_name: string,
  event_id: string,
  user_data?: Record<string, string | undefined>,
  custom_data?: Record<string, unknown>
): Promise<void> {
  if (!CAPI_ENABLED) return Promise.resolve();
  const browser = getBrowserData();
  const enrichedUserData = {
    ...user_data,
    fbp: browser.fbp,
    fbc: browser.fbc,
  };

  // Remove undefined values
  const cleanUserData: Record<string, string> = {};
  for (const [k, v] of Object.entries(enrichedUserData)) {
    if (v) cleanUserData[k] = v;
  }

  return fetch(`${SUPABASE_URL}/functions/v1/meta-capi`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
    },
    body: JSON.stringify({
      event_name,
      event_id,
      event_source_url: window.location.href,
      user_data: cleanUserData,
      custom_data,
      ...(META_TEST_EVENT_CODE ? { test_event_code: META_TEST_EVENT_CODE } : {}),
    }),
  })
    .then((res) => {
      if (!res.ok) {
        return res.text().then((t) => console.warn("CAPI response error:", t));
      }
    })
    .catch((err) => console.warn("CAPI send failed:", err));
}

// ── Standard events ────────────────────────────────────────

/** Fires on every route change (SPA navigation) — now with CAPI for dedup coverage */
export function trackPageView() {
  const eventId = crypto.randomUUID();
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "PageView", {}, { eventID: eventId });
  }
  sendCAPI("PageView", eventId, undefined, {
    page_path: typeof window !== "undefined" ? window.location.pathname : undefined,
    page_title: typeof document !== "undefined" ? document.title : undefined,
  });
}

/** Property detail page – sends maximum property data for Pixel learning */
export function trackViewContent(params: {
  content_name: string;
  content_ids: string[];
  content_type: string;
  value?: number;
  currency?: string;
  // Extended property fields for richer signal
  property_type?: string;
  city?: string;
  zone?: string;
  bedrooms?: number;
  bathrooms?: number;
  area_m2?: number;
  built_area?: number;
  operation?: string;
  has_pool?: boolean;
  has_garage?: boolean;
  has_terrace?: boolean;
  has_elevator?: boolean;
  has_garden?: boolean;
  energy_cert?: string;
  year_built?: number;
  floor?: string | number | null;
  num_images?: number;
}) {
  const eventId = crypto.randomUUID();
  const data: Record<string, unknown> = {
    content_name: params.content_name,
    content_ids: params.content_ids,
    content_type: params.content_type,
    content_category: "real_estate",
    value: params.value || 0,
    currency: params.currency || "EUR",
  };
  // Append all available property attributes so Meta can build richer audiences
  if (params.property_type) data.property_type = params.property_type;
  if (params.city) data.city = params.city;
  if (params.zone) data.zone = params.zone;
  if (params.bedrooms != null) data.bedrooms = params.bedrooms;
  if (params.bathrooms != null) data.bathrooms = params.bathrooms;
  if (params.area_m2 != null) data.area_m2 = params.area_m2;
  if (params.built_area != null) data.built_area = params.built_area;
  if (params.operation) data.operation = params.operation;
  if (params.has_pool) data.has_pool = true;
  if (params.has_garage) data.has_garage = true;
  if (params.has_terrace) data.has_terrace = true;
  if (params.has_elevator) data.has_elevator = true;
  if (params.has_garden) data.has_garden = true;
  if (params.energy_cert) data.energy_cert = params.energy_cert;
  if (params.year_built) data.year_built = params.year_built;
  if (params.floor != null) data.floor = params.floor;
  if (params.num_images != null) data.num_images = params.num_images;

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "ViewContent", data, { eventID: eventId });
  }
  sendCAPI("ViewContent", eventId, undefined, data);
}

/** Form submission (lead) – enriched for Meta lead campaigns */
export function trackLead(params?: {
  content_name?: string;
  value?: number;
  currency?: string;
  email?: string;
  phone?: string;
  name?: string;
  property_id?: string;
  source?: string;
  // Extended property context for richer lead signal
  property_type?: string;
  city?: string;
  bedrooms?: number;
  bathrooms?: number;
  area_m2?: number;
  operation?: string;
  has_pool?: boolean;
  has_garage?: boolean;
}): Promise<void> {
  const eventId = crypto.randomUUID();
  const customData: Record<string, unknown> = {
    content_name: params?.content_name,
    content_category: "real_estate",
    content_type: "property_inquiry",
    value: params?.value || 0,
    currency: params?.currency || "EUR",
  };
  if (params?.property_id) customData.content_ids = [params.property_id];
  if (params?.source) customData.lead_source = params.source;
  if (params?.property_type) customData.property_type = params.property_type;
  if (params?.city) customData.city = params.city;
  if (params?.bedrooms != null) customData.bedrooms = params.bedrooms;
  if (params?.bathrooms != null) customData.bathrooms = params.bathrooms;
  if (params?.area_m2 != null) customData.area_m2 = params.area_m2;
  if (params?.operation) customData.operation = params.operation;
  if (params?.has_pool) customData.has_pool = true;
  if (params?.has_garage) customData.has_garage = true;

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Lead", customData, { eventID: eventId });
  }

  const userData: Record<string, string | undefined> = {};
  if (params?.email) userData.em = params.email;
  if (params?.phone) userData.ph = params.phone;
  if (params?.name) {
    const nameParts = params.name.trim().split(/\s+/);
    userData.fn = nameParts[0];
    if (nameParts.length > 1) userData.ln = nameParts.slice(1).join(" ");
  }
  // Generate external_id from email for cross-device matching
  if (params?.email) userData.external_id = params.email.trim().toLowerCase();
  userData.country = "es";

  return sendCAPI("Lead", eventId, userData, customData);
}

/** Property search / filter usage */
export function trackSearch(params: {
  search_string?: string;
  content_category?: string;
  city?: string;
  property_type?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  num_results?: number;
}) {
  const eventId = crypto.randomUUID();
  const data: Record<string, unknown> = {
    search_string: params.search_string || buildSearchString(params),
    content_category: params.content_category || "property",
    city: params.city,
    property_type: params.property_type,
    min_price: params.min_price,
    max_price: params.max_price,
    bedrooms: params.bedrooms,
  };
  if (params.num_results != null) data.num_results = params.num_results;
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Search", data, { eventID: eventId });
  }
  sendCAPI("Search", eventId, undefined, data);
}

function buildSearchString(p: Record<string, unknown>): string {
  const parts: string[] = [];
  if (p.city) parts.push(`city:${p.city}`);
  if (p.property_type) parts.push(`type:${p.property_type}`);
  if (p.bedrooms) parts.push(`beds:${p.bedrooms}+`);
  if (p.min_price || p.max_price) parts.push(`price:${p.min_price || 0}-${p.max_price || "∞"}`);
  return parts.join(" ") || "all";
}

/** Newsletter subscription */
export function trackCompleteRegistration(params?: {
  content_name?: string;
  status?: string;
  email?: string;
}) {
  const eventId = crypto.randomUUID();
  const customData = {
    content_name: params?.content_name || "newsletter",
    status: params?.status || "subscribed",
  };
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "CompleteRegistration", customData, { eventID: eventId });
  }
  const userData: Record<string, string> = {};
  if (params?.email) userData.em = params.email;
  sendCAPI("CompleteRegistration", eventId, userData, customData);
}

/** Blog article view (as ViewContent with content_type=blog) */
export function trackViewBlogPost(params: {
  content_name: string;
  content_ids: string[];
  category?: string;
}) {
  const eventId = crypto.randomUUID();
  const data = {
    content_name: params.content_name,
    content_ids: params.content_ids,
    content_type: "blog",
    content_category: params.category,
  };
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "ViewContent", data, { eventID: eventId });
  }
  sendCAPI("ViewContent", eventId, undefined, data);
}

/** Contact form interaction (user started filling) */
export function trackInitiateContact(params?: { content_name?: string; property_type?: string; city?: string; value?: number }) {
  const data: Record<string, unknown> = {
    content_name: params?.content_name,
    content_category: "real_estate",
  };
  if (params?.property_type) data.property_type = params.property_type;
  if (params?.city) data.city = params.city;
  if (params?.value) data.value = params.value;
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackCustom", "InitiateContact", data);
  }
}

/** WhatsApp / phone contact click */
export function trackContact(params: {
  method: "whatsapp" | "phone" | "email";
  content_name?: string;
  property_id?: string;
  value?: number;
  city?: string;
  property_type?: string;
}) {
  const eventId = crypto.randomUUID();
  const data: Record<string, unknown> = {
    content_category: "real_estate",
    contact_method: params.method,
    content_name: params.content_name,
    value: params.value || 0,
    currency: "EUR",
  };
  if (params.property_id) data.content_ids = [params.property_id];
  if (params.city) data.city = params.city;
  if (params.property_type) data.property_type = params.property_type;

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Contact", data, { eventID: eventId });
  }
  sendCAPI("Contact", eventId, undefined, data);
}

/** Property share event */
export function trackShare(params: {
  method: string;
  content_name?: string;
  property_id?: string;
  value?: number;
}) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackCustom", "Share", {
      share_method: params.method,
      content_name: params.content_name,
      content_ids: params.property_id ? [params.property_id] : undefined,
      value: params.value,
      currency: "EUR",
    });
  }
}

/** Scroll depth milestones (25%, 50%, 75%, 100%) */
const scrollMilestones = new Set<number>();

export function setupScrollTracking() {
  if (typeof window === "undefined") return;
  scrollMilestones.clear();

  const handler = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const percent = Math.round((scrollTop / docHeight) * 100);

    [25, 50, 75, 100].forEach((milestone) => {
      if (percent >= milestone && !scrollMilestones.has(milestone)) {
        scrollMilestones.add(milestone);
        if (window.fbq) {
          window.fbq("trackCustom", "ScrollDepth", {
            percent: milestone,
            page: window.location.pathname,
          });
        }
      }
    });
  };

  window.addEventListener("scroll", handler, { passive: true });
  return () => window.removeEventListener("scroll", handler);
}

/** Time on page tracking */
export function setupTimeOnPage(intervalSeconds = 30) {
  if (typeof window === "undefined") return;
  let seconds = 0;
  const page = window.location.pathname;

  const interval = setInterval(() => {
    seconds += intervalSeconds;
    if (window.fbq && seconds <= 180) {
      // Track up to 3 minutes
      window.fbq("trackCustom", "TimeOnPage", {
        seconds,
        page,
      });
    }
    if (seconds >= 180) clearInterval(interval);
  }, intervalSeconds * 1000);

  return () => clearInterval(interval);
}
