import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

const CRM_BASE_URL = trimTrailingSlash(Deno.env.get("CRM_BASE_URL") ?? "");

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY") || "";
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const url = new URL(req.url);
    const force = url.searchParams.get("force") === "true";

    // Check if cache is fresh
    const { data: existing } = await supabase
      .from("featured_cache")
      .select("refreshed_at")
      .order("refreshed_at", { ascending: false })
      .limit(1);

    if (existing && existing.length > 0 && !force) {
      const age = Date.now() - new Date(existing[0].refreshed_at).getTime();
      const hours = age / (1000 * 60 * 60);
      if (hours < 24) {
        return new Response(JSON.stringify({ message: "Cache fresh", hours_old: Math.round(hours * 10) / 10 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fetch properties from CRM (larger pool to find internationals)
    if (!CRM_BASE_URL) throw new Error("CRM_BASE_URL is not configured");

    const crmRes = await fetch(`${CRM_BASE_URL}/public-properties?page_size=50&sort=newest`);
    if (!crmRes.ok) throw new Error("CRM fetch failed");
    const crmData = await crmRes.json();
    const properties = (crmData.properties || []).filter(
      (p: Record<string, unknown>) => p.images && (p.images as string[]).length > 0 && p.status === "disponible"
    );

    if (properties.length === 0) {
      return new Response(JSON.stringify({ error: "No properties with images" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Separate international vs national
    const isInternational = (p: Record<string, unknown>) => {
      const country = ((p.country as string) || "España").trim().toLowerCase();
      return country !== "españa" && country !== "spain" && country !== "es";
    };
    const international = properties.filter(isInternational);
    const national = properties.filter((p: Record<string, unknown>) => !isInternational(p));

    // Analyze images with AI
    const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

    async function scoreProperties(pool: Record<string, unknown>[], maxCount: number) {
      const scored: Array<{ property: Record<string, unknown>; score: number; analysis: string }> = [];
      for (const prop of pool.slice(0, maxCount)) {
        const imageUrl = (prop.images as string[])[0];
        try {
          const aiRes = await fetch(AI_URL, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${lovableApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-lite",
              messages: [{
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `Rate this real estate photo 1-10 for a luxury featured listing. Be strict: only truly premium, sharp, well-composed photos score 7+. Respond ONLY with JSON: {"score": <number>, "reason": "<one sentence>"}`,
                  },
                  { type: "image_url", image_url: { url: imageUrl } },
                ],
              }],
            }),
          });

          if (aiRes.ok) {
            const aiData = await aiRes.json();
            const content = aiData.choices?.[0]?.message?.content || "";
            const jsonMatch = content.match(/\{[^}]+\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              scored.push({ property: prop, score: Number(parsed.score) || 0, analysis: parsed.reason || "" });
            }
          }
        } catch (e) {
          console.error(`AI failed for ${prop.id}:`, e);
        }
      }
      scored.sort((a, b) => b.score - a.score);
      return scored;
    }

    // Strategy: prioritize international, fill remainder with national
    let top3: Array<{ property: Record<string, unknown>; score: number; analysis: string }> = [];

    if (international.length >= 3) {
      // Enough internationals — pick best 3 (rotate among them via AI scoring)
      const scoredIntl = await scoreProperties(international, 15);
      top3 = scoredIntl.slice(0, 3);
    } else if (international.length > 0) {
      // Some international — score them all, fill rest with national
      const scoredIntl = await scoreProperties(international, international.length);
      const needed = 3 - scoredIntl.length;
      const scoredNat = await scoreProperties(national, 10);
      top3 = [...scoredIntl, ...scoredNat.slice(0, needed)];
    } else {
      // No international — all national
      const scoredNat = await scoreProperties(national, 12);
      top3 = scoredNat.slice(0, 3);
    }

    if (top3.length === 0) {
      return new Response(JSON.stringify({ error: "No AI results" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Clear and insert
    await supabase.from("featured_cache").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    const rows = top3.map((item) => ({
      property_id: String(item.property.id),
      property_data: { ...item.property, location: item.property.city, area_m2: item.property.surface_area, country: item.property.country || "España" },
      image_score: item.score,
      ai_analysis: item.analysis,
      refreshed_at: new Date().toISOString(),
    }));

    const { error: insertErr } = await supabase.from("featured_cache").insert(rows);
    if (insertErr) throw insertErr;

    return new Response(JSON.stringify({
      success: true,
      featured: top3.map((t) => ({ id: t.property.id, title: (t.property as Record<string, unknown>).title, score: t.score, analysis: t.analysis })),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("refresh-featured error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
