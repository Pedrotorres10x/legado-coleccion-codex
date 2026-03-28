import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Unique visual concept per article to avoid repetition
const ARTICLE_PROMPTS: Record<string, string> = {
  "firma-digital-poder-notarial-comprar-espana":
    "Professional editorial photo: a modern laptop on a sleek marble desk showing a digital signature interface, a notarial pen beside it, warm Mediterranean light through a window overlooking a coastal town in Costa Blanca Spain. Cinematic lighting, luxury interior, no text, 16:9.",
  "video-visitas-comprar-propiedad-espana-distancia":
    "Editorial real estate photo: a person on a video call on tablet showing a stunning Mediterranean luxury villa interior, bright sunlit living room with sea views through floor-to-ceiling windows in Costa Blanca. Warm golden hour light, magazine quality, no text, 16:9.",
  "como-obtener-nie-espana-guia-completa":
    "Editorial photo: a clean modern Spanish government building exterior with palm trees and blue sky, a passport and official documents tastefully arranged on a white marble surface in foreground. Mediterranean ambiance, golden light, no text, 16:9.",
  "abrir-cuenta-bancaria-espana-extranjero":
    "Professional lifestyle photo: a modern Spanish bank lobby with elegant architecture, a person smiling at a bank counter, Mediterranean sunshine streaming through large windows, a credit card and documents on a polished counter. Clean and trustworthy atmosphere, no text, 16:9.",
  "proceso-compra-propiedad-espana-no-residentes":
    "Aerial editorial photography: a luxury new-build residential complex on the Costa Blanca coastline, turquoise Mediterranean sea, lush gardens and swimming pools, golden afternoon light, cinematic drone perspective. No text, 16:9.",
  "por-que-necesitas-abogado-inmobiliario-espana":
    "Professional editorial photo: an elegant law office with Mediterranean views, a lawyer reviewing property documents at a mahogany desk, warm bookshelf background, golden afternoon light entering through arched windows. Luxury professional atmosphere, no text, 16:9.",
};

async function generateAndUpload(
  slug: string,
  title: string,
  apiKey: string,
  supabase: ReturnType<typeof createClient>,
): Promise<string | null> {
  const prompt = ARTICLE_PROMPTS[slug] ??
    `Stunning professional real estate editorial photo for blog article: "${title}". Mediterranean luxury architecture, Costa Blanca Spain, warm golden hour lighting, sea views. Magazine quality, cinematic, no text, 16:9.`;

  console.log(`Generating image for: ${slug}`);

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: prompt,
      tools: [{ type: "image_generation" }],
    }),
  });

  if (!response.ok) {
    console.error(`Image gen failed for ${slug}: ${response.status}`);
    return null;
  }

  const data = await response.json();
  const imageBase64 = data.output?.find((item: { type?: string }) => item.type === "image_generation_call")?.result;
  if (!imageBase64) {
    console.error(`No image returned for ${slug}`);
    return null;
  }

  const imageBytes = decode(imageBase64);

  const fileName = `${slug}-${Date.now()}.png`;
  const { error: uploadError } = await supabase.storage
    .from("blog-images")
    .upload(fileName, imageBytes, { contentType: "image/png", upsert: true });

  if (uploadError) {
    console.error(`Upload error for ${slug}:`, uploadError);
    return null;
  }

  const { data: publicUrl } = supabase.storage.from("blog-images").getPublicUrl(fileName);
  return publicUrl.publicUrl;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth check: require authenticated admin
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const authSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authError } = await authSupabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin } = await authSupabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("OPENAI_API_KEY not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Fetch posts without cover images
    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select("id, title, slug")
      .eq("status", "published")
      .is("cover_image", null);

    if (error) throw error;
    if (!posts || posts.length === 0) {
      return new Response(JSON.stringify({ message: "All posts already have images" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${posts.length} posts without images`);
    const results: { slug: string; success: boolean; url?: string }[] = [];

    // Process sequentially to respect rate limits
    for (const post of posts) {
      const url = await generateAndUpload(post.slug, post.title, apiKey, supabase);
      if (url) {
        await supabase.from("blog_posts").update({ cover_image: url }).eq("id", post.id);
        results.push({ slug: post.slug, success: true, url });
        console.log(`✓ Updated ${post.slug}`);
      } else {
        results.push({ slug: post.slug, success: false });
      }
      // Small delay between generations
      await new Promise((r) => setTimeout(r, 1000));
    }

    return new Response(JSON.stringify({ processed: posts.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
