import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type CachedPropertyData = {
  title?: string;
  description?: string | null;
  property_type?: string | null;
  status?: string | null;
  price?: number | null;
  city?: string | null;
  location?: string | null;
  zone?: string | null;
  address?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  surface_area?: number | null;
  area_m2?: number | null;
  built_area?: number | null;
  operation?: string | null;
  images?: string[] | null;
  videos?: string[] | null;
  virtual_tour_url?: string | null;
  energy_cert?: string | null;
  has_garden?: boolean | null;
  has_elevator?: boolean | null;
  has_garage?: boolean | null;
  has_pool?: boolean | null;
  has_terrace?: boolean | null;
  features?: string[] | null;
  crm_reference?: string | null;
  year_built?: number | null;
  floor?: number | string | null;
};

type PropertyRecord = {
  id: string;
  title: string;
  description: string | null;
  property_type: string;
  status: string;
  price: number;
  location: string;
  city: string | null;
  zone: string | null;
  address: string | null;
  bedrooms: number;
  bathrooms: number;
  area_m2: number;
  surface_area: number | null;
  built_area: number | null;
  operation: string;
  images: string[];
  videos: string[] | null;
  virtual_tour_url: string | null;
  is_featured: boolean;
  energy_cert: string | null;
  has_garden: boolean;
  has_elevator: boolean;
  has_garage: boolean;
  has_pool: boolean;
  has_terrace: boolean;
  features: string[];
  crm_reference: string | null;
  year_built: number | null;
  floor: number | string | null;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Read all featured_cache entries
    const { data: cached, error: cacheError } = await supabase
      .from("featured_cache")
      .select("property_id, property_data");

    if (cacheError) throw cacheError;
    if (!cached || cached.length === 0) {
      return new Response(
        JSON.stringify({ synced: 0, message: "No featured_cache entries found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let synced = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const row of cached) {
      const propertyData = row.property_data as CachedPropertyData | null;
      if (!propertyData || !propertyData.title) {
        skipped++;
        continue;
      }

      // Map CRM property_data fields to the local properties table schema
      const record: PropertyRecord = {
        id: row.property_id,
        title: propertyData.title || "Sin título",
        description: propertyData.description || null,
        property_type: mapPropertyType(propertyData.property_type),
        status: mapStatus(propertyData.status),
        price: propertyData.price || 0,
        location: propertyData.city || propertyData.location || "Sin ubicación",
        city: propertyData.city || propertyData.location || null,
        zone: propertyData.zone || null,
        address: propertyData.address || null,
        bedrooms: propertyData.bedrooms || 0,
        bathrooms: propertyData.bathrooms || 0,
        area_m2: propertyData.surface_area || propertyData.area_m2 || 0,
        surface_area: propertyData.surface_area || propertyData.area_m2 || null,
        built_area: propertyData.built_area || null,
        operation: propertyData.operation || "venta",
        images: Array.isArray(propertyData.images) ? propertyData.images : [],
        videos: Array.isArray(propertyData.videos) ? propertyData.videos : null,
        virtual_tour_url: propertyData.virtual_tour_url || null,
        is_featured: true,
        energy_cert: propertyData.energy_cert || null,
        has_garden: propertyData.has_garden || false,
        has_elevator: propertyData.has_elevator || false,
        has_garage: propertyData.has_garage || false,
        has_pool: propertyData.has_pool || false,
        has_terrace: propertyData.has_terrace || false,
        features: Array.isArray(propertyData.features) ? propertyData.features : [],
        crm_reference: propertyData.crm_reference || null,
        year_built: propertyData.year_built || null,
        floor: propertyData.floor || null,
      };

      const { error: upsertError } = await supabase
        .from("properties")
        .upsert(record, { onConflict: "id" });

      if (upsertError) {
        errors.push(`${row.property_id}: ${upsertError.message}`);
      } else {
        synced++;
      }
    }

    return new Response(
      JSON.stringify({ synced, skipped, total: cached.length, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Sync error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/** Map free-text property_type to the enum values allowed in the DB */
function mapPropertyType(raw: string | undefined): string {
  if (!raw) return "otro";
  const lower = raw.toLowerCase().trim();
  const valid = ["piso", "casa", "villa", "atico", "duplex", "chalet", "estudio", "local", "otro"];
  if (valid.includes(lower)) return lower;
  // Common aliases
  if (lower.includes("apart")) return "piso";
  if (lower.includes("town") || lower.includes("adosad")) return "casa";
  if (lower.includes("penthouse") || lower.includes("átic")) return "atico";
  if (lower.includes("studio")) return "estudio";
  if (lower.includes("bungalow")) return "casa";
  return "otro";
}

/** Map free-text status to the enum values */
function mapStatus(raw: string | undefined): string {
  if (!raw) return "disponible";
  const lower = raw.toLowerCase().trim();
  if (lower === "reservado" || lower === "reserved") return "reservado";
  if (lower === "vendido" || lower === "sold") return "vendido";
  return "disponible";
}
