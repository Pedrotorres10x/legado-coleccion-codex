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

    const { property_id, title, price, city, bedrooms, image_url, area_slug, topics } = await req.json();

    if (!title || !price || !city) {
      return new Response(
        JSON.stringify({ error: "title, price, and city are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if we already sent a new_property notification today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data: recentLogs } = await supabase
      .from("push_notification_log")
      .select("id")
      .eq("notification_type", "new_property")
      .gte("sent_at", today.toISOString())
      .limit(1);

    if (recentLogs && recentLogs.length > 0) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "Already sent a new property notification today" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const priceFormatted = new Intl.NumberFormat("es-ES").format(price);
    const pushTitle = "🏠 Nueva propiedad en " + city;
    const pushBody = `${title} — ${priceFormatted} EUR` + (bedrooms ? ` · ${bedrooms} hab` : "");
    const pushUrl = property_id ? `/propiedad/${property_id}` : "/propiedades";

    // Call send-push
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
        icon: image_url,
        audience: {
          cities: city ? [city] : [],
          areaSlugs: area_slug ? [area_slug] : [],
          topics: Array.isArray(topics) ? topics : [],
        },
      }),
    });

    const sendResult = await sendRes.json();

    // Log the notification
    await supabase.from("push_notification_log").insert({
      notification_type: "new_property",
      title: pushTitle,
      body: pushBody,
      url: pushUrl,
      total_sent: sendResult.sent || 0,
      metadata: { property_id, price, city, bedrooms, image_url, area_slug, topics },
    });

    return new Response(JSON.stringify({ success: true, ...sendResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("push-new-property error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
