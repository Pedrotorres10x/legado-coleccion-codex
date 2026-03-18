import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const INTERNAL_API_KEY = Deno.env.get("INTERNAL_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (token !== SUPABASE_SERVICE_ROLE_KEY && token !== INTERNAL_API_KEY) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get 3 featured or most recent properties
    const { data: properties, error } = await supabase
      .from("properties")
      .select("id, title, price, location, bedrooms, images")
      .eq("status", "disponible")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(3);

    if (error) throw error;

    if (!properties || properties.length === 0) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "No properties available" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const titles = properties.map((p) => p.title).join(", ");
    const pushTitle = "🌟 Propiedades destacadas de la semana";
    const pushBody = properties.length === 1
      ? `Descubre: ${titles}`
      : `Descubre ${properties.length} propiedades: ${titles}`;
    const pushUrl = "/propiedades";

    const sendRes = await fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ title: pushTitle, body: pushBody, url: pushUrl }),
    });

    const sendResult = await sendRes.json();

    await supabase.from("push_notification_log").insert({
      notification_type: "weekly",
      title: pushTitle,
      body: pushBody,
      url: pushUrl,
      total_sent: sendResult.sent || 0,
      metadata: { property_ids: properties.map((p) => p.id) },
    });

    return new Response(JSON.stringify({ success: true, ...sendResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("push-weekly-highlights error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
