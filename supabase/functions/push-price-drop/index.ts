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

    const { property_id, title, old_price, new_price, city, area_slug, topics } = await req.json();

    if (!title || !old_price || !new_price || !city) {
      return new Response(
        JSON.stringify({ error: "title, old_price, new_price, and city are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const oldFormatted = new Intl.NumberFormat("es-ES").format(old_price);
    const newFormatted = new Intl.NumberFormat("es-ES").format(new_price);
    const discount = Math.round(((old_price - new_price) / old_price) * 100);

    const pushTitle = `📉 ¡Bajada de precio! -${discount}%`;
    const pushBody = `${title} en ${city} ahora ${newFormatted} EUR (antes ${oldFormatted} EUR)`;
    const pushUrl = property_id ? `/propiedad/${property_id}` : "/propiedades";

    const sendRes = await fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        title: pushTitle,
        body: pushBody,
        url: pushUrl,
        audience: {
          cities: city ? [city] : [],
          areaSlugs: area_slug ? [area_slug] : [],
          topics: Array.isArray(topics) ? topics : [],
        },
      }),
    });

    const sendResult = await sendRes.json();

    await supabase.from("push_notification_log").insert({
      notification_type: "price_drop",
      title: pushTitle,
      body: pushBody,
      url: pushUrl,
      total_sent: sendResult.sent || 0,
      metadata: { property_id, old_price, new_price, city, discount, area_slug, topics },
    });

    return new Response(JSON.stringify({ success: true, ...sendResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("push-price-drop error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
