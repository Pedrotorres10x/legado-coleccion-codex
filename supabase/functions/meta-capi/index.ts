import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PIXEL_ID = "1255986579960911";
const GRAPH_API = `https://graph.facebook.com/v21.0/${PIXEL_ID}/events`;

function normalizeHost(value: string) {
  return value
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .trim()
    .toLowerCase();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // ── Origin validation: only allow requests from our domains ──
  const origin = req.headers.get("origin") ?? "";
  const referer = req.headers.get("referer") ?? "";
  const siteHost = normalizeHost(Deno.env.get("SITE_URL") ?? "https://legadocoleccion.es");
  const allowedDomains = [siteHost, "localhost", "127.0.0.1"];
  const isAllowed = allowedDomains.some(d => origin.includes(d) || referer.includes(d));
  if (!isAllowed) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const ACCESS_TOKEN = Deno.env.get("META_CAPI_ACCESS_TOKEN");
  if (!ACCESS_TOKEN) {
    return new Response(
      JSON.stringify({ error: "META_CAPI_ACCESS_TOKEN not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const { event_name, event_id, event_source_url, user_data, custom_data, test_event_code } = body;

    if (!event_name) {
      return new Response(
        JSON.stringify({ error: "event_name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Hash user data fields for privacy (email, phone, name)
    // Pass-through fields: fbp, fbc, external_id, country, client_ip_address
    // ALL user data fields must be SHA-256 hashed per Meta spec
    // Exceptions (pass-through): fbp, fbc, external_id, client_ip_address, client_user_agent
    const PASSTHROUGH_FIELDS = ["fbp", "fbc", "external_id", "client_ip_address", "client_user_agent"];

    const sha256 = async (value: string): Promise<string> => {
      const encoder = new TextEncoder();
      const data = encoder.encode(value.trim().toLowerCase());
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    };

    const hashedUserData: Record<string, string> = {};
    if (user_data) {
      for (const [key, value] of Object.entries(user_data)) {
        if (typeof value !== "string") continue;
        if (PASSTHROUGH_FIELDS.includes(key)) {
          hashedUserData[key] = value;
        } else {
          // Hash everything else (em, ph, fn, ln, country, ct, st, zp, ge, db, etc.)
          hashedUserData[key] = await sha256(value);
        }
      }
    }

    // Get client IP — accept both IPv4 and IPv6
    const rawIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || req.headers.get("cf-connecting-ip") 
      || undefined;
    const validIp = rawIp && rawIp.length > 0 ? rawIp : undefined;

    const userData: Record<string, unknown> = {
      client_user_agent: req.headers.get("user-agent") || undefined,
      ...hashedUserData,
    };
    if (validIp) userData.client_ip_address = validIp;

    const payload: Record<string, unknown> = {
      data: [
        {
          event_name,
          event_time: Math.floor(Date.now() / 1000),
          event_id: event_id || crypto.randomUUID(),
          event_source_url,
          action_source: "website",
          user_data: userData,
          custom_data: custom_data || undefined,
        },
      ],
    };

    // Include test_event_code if provided (enables real-time visibility in Meta Test Events tab)
    if (test_event_code) {
      payload.test_event_code = test_event_code;
    }

    const response = await fetch(`${GRAPH_API}?access_token=${ACCESS_TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Meta CAPI error:", JSON.stringify(result));
      return new Response(
        JSON.stringify({ error: "Meta CAPI request failed", details: result }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ success: true, ...result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("meta-capi error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
