const FALLBACK_SITE_URL = "https://legadocoleccion.es";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export const SITE_URL = trimTrailingSlash(
  import.meta.env.VITE_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : FALLBACK_SITE_URL)
);

export const SITE_NAME = "Legado Inmobiliaria";
export const SITE_DEFAULT_TITLE = "Legado Inmobiliaria | Residencias singulares en Benidorm y Costa Blanca";
export const SITE_DEFAULT_DESCRIPTION =
  "Residencias singulares, villas frente al mar, aticos y propiedades exclusivas en Benidorm y Costa Blanca. Asesoramiento discreto, internacional y altamente personalizado.";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
export const DEFAULT_OG_IMAGE_ALT =
  "Legado Inmobiliaria, catalogo de residencias singulares en Benidorm y Costa Blanca";
export const BUSINESS_PHONE = "+34 965 065 921";
export const BUSINESS_WHATSAPP = "+34 644 245 670";
export const BUSINESS_STREET = "C/ Esperanto 15";
export const BUSINESS_CITY = "Benidorm";
export const BUSINESS_REGION = "Alicante";
export const BUSINESS_POSTAL_CODE = "03501";
export const BUSINESS_COUNTRY = "ES";
export const BUSINESS_LATITUDE = 38.5411;
export const BUSINESS_LONGITUDE = -0.1225;
export const SUPPORTED_LOCALES = ["es-ES", "en-GB", "fr-FR", "de-DE"] as const;
export const DEFAULT_LOCALE = "es-ES";

export function buildAbsoluteUrl(path = "/") {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function localeToHtmlLang(locale: string) {
  return locale.split("-")[0] || "es";
}

export function localeToOgLocale(locale: string) {
  return locale.replace("-", "_");
}
