import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Convierte un texto en slug URL-friendly */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // elimina acentos
    .replace(/[^a-z0-9\s-]/g, "")   // solo letras, números, espacios y guiones
    .trim()
    .replace(/\s+/g, "-")            // espacios → guiones
    .replace(/-+/g, "-");            // guiones múltiples → uno
}

/** Genera el slug limpio de una propiedad */
export function buildPropertySlug(title: string, city: string): string {
  return slugify(`${title} ${city}`);
}

/** Genera la URL 100% amigable con sufijo único: /propiedad/villa-en-finestrat-abc12 */
export function propertyUrl(property: { id: string; title: string; city?: string; location?: string }): string {
  const city = property.city || property.location || "";
  const base = buildPropertySlug(property.title, city);
  // Añade los últimos 5 caracteres del ID para garantizar unicidad
  const suffix = property.id.replace(/-/g, "").slice(-5);
  return `/propiedad/${base}-${suffix}`;
}

/**
 * URL para compartir en redes sociales con OG tags dinámicos.
 * Apunta directamente a la edge function que devuelve HTML con metadatos
 * y redirige humanos a la ficha mediante meta-refresh.
 */
export function propertyShareUrl(property: { id: string; title: string; city?: string; location?: string }): string {
  const city = property.city || property.location || "";
  const base = buildPropertySlug(property.title, city);
  const suffix = property.id.replace(/-/g, "").slice(-5);
  const slug = `${base}-${suffix}`;
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/+$/, "");
  return `${supabaseUrl}/functions/v1/property-og?slug=${slug}`;
}

/**
 * No-op — kept for compatibility. OG tags are now served inline by the Edge Function.
 */
export async function ensurePropertyOg(_property: { id: string; title: string; city?: string; location?: string }): Promise<void> {
  // No longer needed
}
