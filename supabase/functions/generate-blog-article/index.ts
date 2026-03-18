import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

type ServiceSupabaseClient = ReturnType<typeof createClient>;
type ExistingBlogPost = { slug: string; title: string };
type PropertySummary = {
  id: string;
  title: string;
  location: string;
  price: number | null;
  property_type: string | null;
  bedrooms: number | null;
  area_m2: number | null;
};
type GeneratedArticle = {
  title: string;
  slug: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  content: string;
  category_id: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CATEGORIES = [
  { id: "cba2d4f6-f1e2-4229-b508-ac97830e1b95", slug: "guias-compra", name: "Guías de compra" },
  { id: "fe847286-4414-4260-af77-01565b6b518b", slug: "inversion", name: "Inversión" },
  { id: "52323211-1aa8-4b04-9268-d2955e30a520", slug: "legal-fiscal", name: "Legal y fiscal" },
  { id: "ebc4423f-7d49-483a-9bff-440353ceddc0", slug: "mercado-inmobiliario", name: "Mercado inmobiliario" },
  { id: "4403a494-2fa5-4760-a7a3-10baa6665782", slug: "zonas-estilo-vida", name: "Zonas y estilo de vida" },
];

const TOPIC_SEEDS = [
  "Guía completa: cómo comprar una vivienda de obra nueva en España siendo extranjero, paso a paso",
  "Golden Visa España 2026: invierte en obra nueva y obtén la residencia",
  "Por qué la Costa Blanca es el destino nº 1 para compradores extranjeros de inmuebles",
  "Obra nueva vs segunda mano en España: pros, contras y comparación de valor",
  "Todos los impuestos y costes al comprar obra nueva en España siendo extranjero",
  "NIE en España: cómo obtenerlo y por qué lo necesitas para comprar una propiedad",
  "Mejores zonas de la Costa Blanca para comprar obra nueva: Benidorm, Altea, Calpe, Finestrat",
  "Opciones de hipoteca para no residentes que compran obra nueva en España",
  "Sobre plano vs obra terminada: qué elegir en la Costa Blanca",
  "Lista de comprobación: qué revisar antes de aceptar tu vivienda de obra nueva",
  "Coste de vida en la Costa Blanca para expatriados: un desglose realista",
  "Eficiencia energética y sostenibilidad en viviendas de obra nueva en España",
  "Alquilar tu vivienda de obra nueva en España: marco legal y rentabilidad",
  "Sanidad y seguros para propietarios extranjeros en España",
  "Previsión del mercado inmobiliario español 2026: tendencias en obra nueva en la Costa Blanca",
  "Cómo elegir la inmobiliaria adecuada al comprar obra nueva en España",
  "Gastos de comunidad y gestión de propiedades en apartamentos de obra nueva",
  "Cronología del proceso de compra: de la reserva a la entrega de llaves en obra nueva",
  "Amueblar tu vivienda de obra nueva en España: consejos y proveedores locales",
  "Vivir en Benidorm todo el año vs casa vacacional: lo que los extranjeros deben saber",
  "Protección legal al comprar sobre plano en España: garantías bancarias y seguros",
  "Beneficios fiscales para compradores extranjeros de inmuebles en España",
  "Comparativa Costa Blanca Norte vs Sur para inversión en obra nueva",
  "Tecnología de hogar inteligente en las obras nuevas españolas: qué esperar",
  "Jubilación en España: comprar una vivienda de obra nueva en la Costa Blanca",
];

async function generateCoverImage(
  title: string,
  apiKey: string,
  supabase: ServiceSupabaseClient,
  slug: string
): Promise<string | null> {
  try {
    const prompt = `Generate a stunning, professional real estate photography style image for a luxury blog article titled "${title}". 
The image should feature: beautiful Mediterranean architecture, Costa Blanca Spain scenery, warm golden hour lighting, luxury villa or modern apartment with sea views, palm trees, blue sky. 
Style: editorial magazine quality, cinematic lighting, 16:9 aspect ratio. Ultra high resolution.
Do NOT include any text or watermarks in the image.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      console.error("Image generation failed:", response.status);
      return null;
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageUrl) {
      console.error("No image in response");
      return null;
    }

    // Extract base64 data
    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
    const imageBytes = decode(base64Data);

    // Upload to storage
    const fileName = `${slug}-${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from("blog-images")
      .upload(fileName, imageBytes, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    const { data: publicUrl } = supabase.storage
      .from("blog-images")
      .getPublicUrl(fileName);

    return publicUrl.publicUrl;
  } catch (e) {
    console.error("Image generation error:", e);
    return null;
  }
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

    const { count = 1, topic_override, topic_index } = await req.json().catch(() => ({} as {
      count?: number;
      topic_override?: string;
      topic_index?: number;
    }));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get existing slugs to avoid duplicates
    const { data: existing } = await supabase.from("blog_posts").select("slug, title");
    const existingSlugs = new Set((existing || []).map((post: ExistingBlogPost) => post.slug));

    // Get some properties to link in articles
    const { data: properties } = await supabase
      .from("properties")
      .select("id, title, location, price, property_type, bedrooms, area_m2")
      .eq("status", "disponible")
      .limit(20);

    const propertiesContext = (properties || [])
      .map((property: PropertySummary) => `- ${property.title} en ${property.location}: €${property.price?.toLocaleString()}, ${property.bedrooms} hab, ${property.area_m2}m² (ID: ${property.id})`)
      .join("\n");

    const articles = [];

    for (let i = 0; i < Math.min(count, 5); i++) {
      let topic = topic_override;
      if (!topic && typeof topic_index === "number") {
        topic = TOPIC_SEEDS[topic_index % TOPIC_SEEDS.length];
      }
      if (!topic) {
        for (let j = 0; j < TOPIC_SEEDS.length; j++) {
          const candidate = TOPIC_SEEDS[j];
          const candidateSlug = candidate.toLowerCase().replace(/[^a-z0-9áéíóúñü]+/g, "-").slice(0, 40);
          const firstWords = candidateSlug.split("-").slice(0, 5).join("-");
          const alreadyExists = [...existingSlugs].some(s => s.includes(firstWords));
          if (!alreadyExists) {
            topic = candidate;
            break;
          }
        }
        if (!topic) topic = TOPIC_SEEDS[Math.floor(Math.random() * TOPIC_SEEDS.length)];
      }

      const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

      const prompt = `Eres un experto redactor de contenido SEO para Legado Inmobiliaria, una boutique inmobiliaria en la Costa Blanca de España especializada en OBRA NUEVA para COMPRADORES EXTRANJEROS (británicos, holandeses, belgas, escandinavos, alemanes).

Escribe un artículo de blog completo sobre: "${topic}"

Categoría: ${category.name}

Propiedades disponibles para referenciar naturalmente en el artículo (elige 1-2 las más relevantes):
${propertiesContext || "No hay propiedades disponibles - usa referencias genéricas a nuestro catálogo."}

REQUISITOS:
1. Escribe en ESPAÑOL (es el idioma principal de la web, se traduce automáticamente a otros idiomas)
2. Entre 1200-1800 palabras
3. Optimizado para SEO: usa la keyword principal naturalmente 3-5 veces, usa keywords long-tail relacionadas
4. Estructura con encabezados H2 y H3 usando etiquetas HTML
5. Incluye consejos prácticos y accionables
6. Menciona naturalmente a Legado Inmobiliaria como expertos locales de confianza 1-2 veces
7. Incluye una referencia a propiedades concretas como ejemplo con un enlace: <a href="/propiedades" class="text-primary font-semibold hover:underline">explora nuestros inmuebles disponibles</a>
8. Tono: profesional pero cálido, experto, tranquilizador para extranjeros que navegan un sistema desconocido
9. Incluye datos reales (precios típicos, plazos, porcentajes) de la Costa Blanca

Devuelve un objeto JSON con EXACTAMENTE estos campos:
{
  "title": "Título SEO optimizado menor de 60 caracteres",
  "slug": "slug-amigable-para-url-en-español",
  "excerpt": "Descripción atractiva de 150 caracteres para listados y meta",
  "meta_title": "Título SEO menor de 60 caracteres con keyword principal",
  "meta_description": "Meta descripción menor de 155 caracteres con llamada a la acción",
  "content": "Contenido HTML completo del artículo con etiquetas <h2>, <h3>, <p>, <ul>, <li>, <a>",
  "category_id": "${category.id}"
}`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }],
          tools: [{
            type: "function",
            function: {
              name: "create_blog_article",
              description: "Create a blog article with all required fields",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  slug: { type: "string" },
                  excerpt: { type: "string" },
                  meta_title: { type: "string" },
                  meta_description: { type: "string" },
                  content: { type: "string" },
                  category_id: { type: "string" },
                },
                required: ["title", "slug", "excerpt", "meta_title", "meta_description", "content", "category_id"],
                additionalProperties: false,
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "create_blog_article" } },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("AI error:", response.status, errText);
        if (response.status === 429) {
          console.log("Rate limited, waiting 15s before retry...");
          await new Promise(r => setTimeout(r, 15000));
          continue;
        }
        continue;
      }

      const aiData = await response.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) {
        console.error("No tool call in response");
        continue;
      }

      const article = JSON.parse(toolCall.function.arguments) as GeneratedArticle;

      // Ensure slug is unique
      let slug = article.slug.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 80);
      if (existingSlugs.has(slug)) {
        slug = slug + "-" + Date.now().toString(36);
      }

      // Generate cover image
      console.log(`Generating cover image for: ${article.title}`);
      const coverImageUrl = await generateCoverImage(article.title, LOVABLE_API_KEY, supabase, slug);
      console.log(`Cover image: ${coverImageUrl ? "OK" : "failed"}`);

      const { error: insertError } = await supabase.from("blog_posts").insert({
        title: article.title,
        slug,
        excerpt: article.excerpt,
        content: article.content,
        category_id: article.category_id,
        author_name: "Legado Inmobiliaria",
        status: "published",
        published_at: new Date().toISOString(),
        meta_title: article.meta_title,
        meta_description: article.meta_description,
        cover_image: coverImageUrl,
      });

      if (insertError) {
        console.error("Insert error:", insertError);
        continue;
      }

      existingSlugs.add(slug);
      articles.push({ title: article.title, slug, cover_image: !!coverImageUrl });
      console.log(`Generated: ${article.title}`);

      // Wait between articles to avoid rate limits
      if (i < count - 1) {
        await new Promise(r => setTimeout(r, 5000));
      }
    }

    return new Response(
      JSON.stringify({ success: true, generated: articles.length, articles }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
