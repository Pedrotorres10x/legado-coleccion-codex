// CRM proxy v2 - routes requests to external CRM

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

const CRM_BASE = trimTrailingSlash(Deno.env.get("CRM_BASE_URL") ?? "");
const CRM_WEB_LEADS_BASE = trimTrailingSlash(
  Deno.env.get("CRM_WEB_LEADS_BASE_URL") ?? CRM_BASE
);

// Public integration contract with the active CRM.
const ALLOWED_ENDPOINTS = new Set([
  "get-leads",
  "web-leads-admin",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get("endpoint");

    if (!endpoint) {
      return new Response(JSON.stringify({ error: "Missing endpoint param" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Security: only allow whitelisted endpoints
    if (!ALLOWED_ENDPOINTS.has(endpoint)) {
      return new Response(JSON.stringify({ error: "Endpoint not allowed" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!CRM_BASE) {
      return new Response(JSON.stringify({ error: "CRM_BASE_URL is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build target URL preserving all query params except "endpoint"
    const targetBase = endpoint === "web-leads-admin" ? CRM_WEB_LEADS_BASE : CRM_BASE;
    const targetUrl = new URL(`${targetBase}/${endpoint}`);
    for (const [key, value] of url.searchParams.entries()) {
      if (key !== "endpoint") {
        targetUrl.searchParams.set(key, value);
      }
    }

    const fetchOptions: RequestInit = {
      method: req.method,
      headers: { "Content-Type": "application/json" },
    };

    const websiteApiKey = Deno.env.get("WEBSITE_API_KEY") || Deno.env.get("CRM_API_KEY");
    const crmAnonKey = Deno.env.get("CRM_ANON_KEY");
    if (endpoint === "web-leads-admin" && websiteApiKey) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        "x-api-key": websiteApiKey,
      };
      if (crmAnonKey) {
        fetchOptions.headers = {
          ...fetchOptions.headers,
          apikey: crmAnonKey,
          Authorization: `Bearer ${crmAnonKey}`,
        };
      }
    }

    const crmApiKey = Deno.env.get("CRM_API_KEY");
    if (endpoint === "get-leads" && crmApiKey) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        "x-api-key": crmApiKey,
      };
    }

    if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
      fetchOptions.body = await req.text();
    }

    const response = await fetch(targetUrl.toString(), fetchOptions);
    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : JSON.stringify(error) || "Unknown error";
    console.error("CRM proxy error:", msg);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
