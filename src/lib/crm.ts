function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

const SUPABASE_URL = trimTrailingSlash(import.meta.env.VITE_SUPABASE_URL || "");
const CRM_BASE_URL = trimTrailingSlash(import.meta.env.VITE_CRM_BASE_URL || "");

export function localFunctionUrl(functionName: string) {
  if (!SUPABASE_URL) {
    throw new Error("VITE_SUPABASE_URL is not configured");
  }

  return `${SUPABASE_URL}/functions/v1/${functionName}`;
}

export function crmFunctionUrl(
  functionName: string,
  params?: Record<string, string | number | boolean | null | undefined>
) {
  if (!CRM_BASE_URL) {
    throw new Error("VITE_CRM_BASE_URL is not configured");
  }

  const url = new URL(`${CRM_BASE_URL}/functions/v1/${functionName}`);

  for (const [key, value] of Object.entries(params || {})) {
    if (value == null) continue;
    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

export function crmProxyUrl(endpoint: string, params?: Record<string, string | number | boolean | null | undefined>) {
  const url = new URL(localFunctionUrl("crm-proxy"));
  url.searchParams.set("endpoint", endpoint);

  for (const [key, value] of Object.entries(params || {})) {
    if (value == null) continue;
    url.searchParams.set(key, String(value));
  }

  return url.toString();
}
