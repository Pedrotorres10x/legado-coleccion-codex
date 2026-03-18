const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "fbclid"] as const;
const STORAGE_PREFIX = "utm_";

/** Persist UTM params from URL into sessionStorage (call once on app init) */
export function persistUtmParams(): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, value);
  }
}

/** Read a UTM param: sessionStorage first, then current URL */
function getParam(key: string): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(`${STORAGE_PREFIX}${key}`) || new URLSearchParams(window.location.search).get(key);
}

/** Capture and format UTM parameters */
export function getUtmSource(): string {
  const source = getParam("utm_source");
  const medium = getParam("utm_medium");
  const campaign = getParam("utm_campaign");

  if (!source && !medium && !campaign) return "web";

  const parts: string[] = [];
  if (source) parts.push(`src:${source}`);
  if (medium) parts.push(`med:${medium}`);
  if (campaign) parts.push(`camp:${campaign}`);
  return parts.join("|");
}

/** Returns true if the session originated from paid ads traffic */
export function useIsAdsTraffic(): boolean {
  if (typeof window === "undefined") return false;
  return !!(
    getParam("utm_source") ||
    getParam("fbclid")
  );
}
