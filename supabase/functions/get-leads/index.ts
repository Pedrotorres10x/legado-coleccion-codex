import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type LeadRow = {
  id: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = req.headers.get("x-api-key");
  const expectedKey = Deno.env.get("CRM_API_KEY");

  if (!expectedKey) {
    return new Response(
      JSON.stringify({ error: "CRM_API_KEY not configured on server" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (apiKey !== expectedKey) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const url = new URL(req.url);
    const onlyNew = url.searchParams.get("only_new") === "true";
    const markSynced = url.searchParams.get("mark_synced") === "true";

    let query = supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (onlyNew) {
      query = query.eq("synced_to_crm", false);
    }

    const { data: leads, error } = await query;

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark as synced if requested
    if (markSynced && leads && leads.length > 0) {
      const ids = (leads as LeadRow[]).map((lead) => lead.id);
      await supabase
        .from("leads")
        .update({ synced_to_crm: true })
        .in("id", ids);
    }

    return new Response(
      JSON.stringify({ success: true, count: leads?.length || 0, leads }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
