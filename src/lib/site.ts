const FALLBACK_SITE_URL = "https://legadocoleccion.es";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export const SITE_URL = trimTrailingSlash(
  import.meta.env.VITE_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : FALLBACK_SITE_URL)
);

