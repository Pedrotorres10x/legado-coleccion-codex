import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

const CRM_BASE_URL = trimTrailingSlash(Deno.env.get("CRM_BASE_URL") ?? "");

type SimilarPropertiesRequest = {
  property_id: string;
  city?: string | null;
  province?: string | null;
  price?: number | string | null;
  property_type?: string | null;
};

type CrmPropertyCandidate = {
  id: string;
  status: string;
  price: number;
  city?: string | null;
  province?: string | null;
  property_type?: string | null;
  title?: string | null;
  bedrooms?: number | null;
  surface_area?: number | null;
};

type CrmPropertiesResponse = {
  properties?: CrmPropertyCandidate[];
};

type SimilarScoredProperty = CrmPropertyCandidate & {
  _score: number;
};

function stripControlCharacters(value: string) {
  return Array.from(value)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return (code >= 32 && code !== 127) || code === 10 || code === 13 || code === 9;
    })
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { property_id, city, province, price, property_type } = await req.json() as SimilarPropertiesRequest;
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    // Fetch candidates from CRM - get a broad set
    if (!CRM_BASE_URL) throw new Error("CRM_BASE_URL is not configured");

    const crmRes = await fetch(`${CRM_BASE_URL}/public-properties?page_size=40&sort=newest`);
    if (!crmRes.ok) throw new Error("CRM fetch failed");
    const crmData = await crmRes.json() as CrmPropertiesResponse;
    const allProps = (crmData.properties || []).filter(
      (property) => property.id !== property_id && property.status === "disponible"
    );

    if (allProps.length === 0) {
      return new Response(JSON.stringify({ similar: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pre-filter: same province OR price within 50%
    const priceNum = Number(price) || 0;
    const candidates = allProps.filter((property) => {
      const sameZone = (property.city && city && property.city.toLowerCase() === city.toLowerCase()) ||
                       (property.province && province && property.province.toLowerCase() === province.toLowerCase());
      const priceDiff = priceNum > 0 ? Math.abs(property.price - priceNum) / priceNum : 1;
      return sameZone || priceDiff < 0.25;
    });

    // If not enough candidates, add by type BUT still within reasonable price range (±25%)
    if (candidates.length < 6) {
      for (const property of allProps) {
        if (!candidates.find((candidate) => candidate.id === property.id)) {
          const priceDifference = priceNum > 0 ? Math.abs(property.price - priceNum) / priceNum : 1;
          if (property.property_type === property_type && priceDifference < 0.25) {
            candidates.push(property);
            if (candidates.length >= 12) break;
          }
        }
      }
    }

    const top = candidates.slice(0, 12);

    if (!OPENAI_API_KEY || top.length <= 3) {
      // No AI, just return top 3 by zone/price proximity
      const scored: SimilarScoredProperty[] = top.map((property) => {
        let score = 0;
        if (property.city?.toLowerCase() === city?.toLowerCase()) score += 30;
        if (property.province?.toLowerCase() === province?.toLowerCase()) score += 15;
        if (priceNum > 0) score += Math.max(0, 20 - (Math.abs(property.price - priceNum) / priceNum) * 20);
        if (property.property_type === property_type) score += 10;
        return { ...property, _score: score };
      });
      scored.sort((a, b) => b._score - a._score);
      return new Response(JSON.stringify({ similar: scored.slice(0, 3).map(({ _score, ...property }) => property) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use AI to rank
    const summary = top.map((property) => ({
      id: property.id,
      title: property.title,
      city: property.city,
      province: property.province,
      price: property.price,
      type: property.property_type,
      bedrooms: property.bedrooms,
      surface: property.surface_area,
    }));

    const aiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        instructions: "You are a Spanish real estate expert specializing in Costa Blanca geography. Return only valid JSON.",
        input: `You understand the geography perfectly:

IMPORTANT ZONE RULES (Costa Blanca):
- Torrevieja, Orihuela Costa, Pilar de la Horada, San Miguel de Salinas, Los Montesinos = Vega Baja / Costa Blanca Sur
- Algorfa, Rojales, Guardamar, Benijófar, Ciudad Quesada, Catral = Vega Baja interior
- Polop, La Nucía, Benidorm, Finestrat, Villajoyosa, Altea, Alfaz del Pi, Calpe = Marina Baixa / Costa Blanca Nord
- Dehesa de Campoamor, Cabo Roig, Mil Palmeras = Orihuela Costa (sur)
- Elche, Santa Pola, Gran Alacant = Camp d'Elx
- Alicante city, San Juan, Mutxamel, El Campello = Alacantí

Torrevieja and Polop are NOT the same zone (60+ km apart). Algorfa and Torrevieja ARE nearby (~15km). 

Given a property in ${city}${province ? `, ${province}` : ""} priced at ${price}€ (type: ${property_type}), pick the 3 most similar from this list. Priority: 1) SAME ZONE (most important - cities within ~20km), 2) similar price (±25%), 3) similar type. Return JSON with exactly {"ids":["id1","id2","id3"]}.

Properties:
${JSON.stringify(summary)}`,
        text: {
          format: {
            type: "json_schema",
            name: "similar_properties_ids",
            strict: true,
            schema: {
              type: "object",
              properties: {
                ids: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: ["ids"],
              additionalProperties: false,
            },
          },
        },
      }),
    });

    if (aiRes.ok) {
      const aiData = await aiRes.json();
      try {
        const parsed = JSON.parse(stripControlCharacters(aiData.output_text || "{}"));
        const ids: string[] = Array.isArray(parsed.ids) ? parsed.ids : [];
        const result = ids
          .map((id) => top.find((property) => property.id === id))
          .filter((property): property is CrmPropertyCandidate => Boolean(property))
          .slice(0, 3);
        if (result.length > 0) {
          return new Response(JSON.stringify({ similar: result }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch (parseErr) {
        console.error("AI JSON parse failed, falling back:", parseErr);
      }
    }

    // Fallback
    return new Response(JSON.stringify({ similar: top.slice(0, 3) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("similar-properties error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown", similar: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
