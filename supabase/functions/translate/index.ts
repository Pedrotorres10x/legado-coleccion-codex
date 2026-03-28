import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LANGUAGE_PROFILES = {
  en: {
    name: "English",
    locale: "British/international English",
    guidance:
      "Write in polished, native-sounding real-estate English for international buyers in Spain. Prefer natural sales copy over literal phrasing, keep it clear and premium, and avoid awkward calques from Spanish.",
  },
  fr: {
    name: "French",
    locale: "French from France/Belgium",
    guidance:
      "Write in elegant, idiomatic French for francophone property buyers. Use smooth, trustworthy phrasing with a high-end but warm tone, and never mirror Spanish sentence structure if it sounds unnatural.",
  },
  de: {
    name: "German",
    locale: "Standard German",
    guidance:
      "Write in fluent, idiomatic German for German-speaking property buyers. Prioritise clarity, confidence and precision, with a premium commercial tone. Adapt sentence order and wording so it reads like original German copy, not a translation.",
  },
} as const;

function buildPrompt(textsObj: Record<string, string>, targetLang: keyof typeof LANGUAGE_PROFILES) {
  const profile = LANGUAGE_PROFILES[targetLang];

  return `You are a senior localisation copywriter for a premium real-estate brand on the Costa Blanca.

Your task is to LOCALISE the JSON values from Spanish into ${profile.name} (${profile.locale}), not to translate them literally.

Rules:
- Keep every JSON key exactly as it is.
- Return ONLY valid JSON. No markdown, no commentary, no code fences.
- Preserve placeholders, line breaks, punctuation patterns, numbers, percentages, currency symbols, proper names, and brand names unless a natural localised form is clearly better.
- Make each value sound as if it was originally written by a native marketing copywriter in ${profile.name}.
- Adapt idioms, rhythm, sentence order, CTAs and persuasive phrasing to the target language.
- Keep the same intent, level of detail and approximate length. Do not omit information.
- For short UI labels, menus, filters and buttons, prefer concise native wording.
- For emotional brand copy, founder story and testimonials, preserve warmth, trust and credibility.
- If a Spanish phrase sounds culturally awkward when translated directly, rewrite it naturally while keeping the meaning.
- Do not invent facts or add claims that are not present in the source.

Language-specific guidance:
${profile.guidance}

Source JSON:
${JSON.stringify(textsObj, null, 2)}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { texts, targetLang } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");
    if (!(targetLang in LANGUAGE_PROFILES)) throw new Error(`Unsupported language: ${targetLang}`);

    const textsObj = texts as Record<string, string>;
    const sourceEntries = Object.entries(textsObj);
    const prompt = buildPrompt(textsObj, targetLang as keyof typeof LANGUAGE_PROFILES);

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        instructions:
          "You are an expert localisation strategist and conversion copywriter. You produce native-quality website copy and return only valid JSON with translated values.",
        input: prompt,
        text: {
          format: {
            type: "json_schema",
            name: "localized_translations",
            strict: true,
            schema: {
              type: "object",
              properties: Object.fromEntries(sourceEntries.map(([key]) => [key, { type: "string" }])),
              required: sourceEntries.map(([key]) => key),
              additionalProperties: false,
            },
          },
        },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("OpenAI error:", response.status, t);
      throw new Error("OpenAI API error");
    }

    const data = await response.json();
    const content =
      data.output_text ||
      data.output?.[0]?.content?.find((item: { type?: string }) => item.type === "output_text")?.text ||
      "";

    const translatedRaw = JSON.parse(content) as Record<string, string>;
    const translated = Object.fromEntries(
      sourceEntries.map(([key, value]) => [key, typeof translatedRaw[key] === "string" ? translatedRaw[key] : value]),
    );

    return new Response(JSON.stringify({ translations: translated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("translate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
