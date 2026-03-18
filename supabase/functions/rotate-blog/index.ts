import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // ── Auth: service-role or admin only ──
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (token !== SERVICE_ROLE) {
    const { createClient: createAuthClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const authSupabase = createAuthClient(
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
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Find the published article with the fewest views
    const { data: leastRead, error: fetchError } = await supabase
      .from("blog_posts")
      .select("id, title, slug, views")
      .eq("status", "published")
      .order("views", { ascending: true })
      .limit(1)
      .single();

    if (fetchError || !leastRead) {
      console.error("No articles to rotate:", fetchError);
      return new Response(
        JSON.stringify({ success: false, error: "No articles found to rotate" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Least read article: "${leastRead.title}" with ${leastRead.views} views`);

    // 2. Delete the least-read article
    const { error: deleteError } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", leastRead.id);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return new Response(
        JSON.stringify({ success: false, error: deleteError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Deleted: "${leastRead.title}"`);

    // 3. Generate a replacement article
    const baseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const generateResponse = await fetch(`${baseUrl}/functions/v1/generate-blog-article`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ count: 1 }),
    });

    const generateResult = await generateResponse.json();
    console.log("Generate result:", JSON.stringify(generateResult));

    // 4. Send the new article via Brevo campaign
    const newArticle = generateResult?.articles?.[0];
    let newsletterSent = false;
    if (newArticle?.slug) {
      console.log(`Sending Brevo campaign for new article: ${newArticle.title}`);

      try {
        // Fetch the full article
        const { data: fullArticle } = await supabase
          .from("blog_posts")
          .select("title, excerpt, slug, cover_image")
          .eq("slug", newArticle.slug)
          .single();

        if (fullArticle) {
          const siteUrl = Deno.env.get("SITE_URL") || "https://tu-dominio.com";
          const articleUrl = `${siteUrl}/blog/${fullArticle.slug}`;
          const coverHtml = fullArticle.cover_image
            ? `<img src="${fullArticle.cover_image}" alt="${fullArticle.title}" style="width:100%;max-width:600px;border-radius:12px;margin-bottom:24px;" />`
            : "";

          const htmlContent = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f9f7f4;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h2 style="color:#b8860b;font-size:13px;letter-spacing:3px;text-transform:uppercase;margin:0;">Legado Inmobiliaria</h2>
      <p style="color:#999;font-size:11px;margin:4px 0 0;">Costa Blanca · Inmobiliaria de lujo</p>
    </div>
    ${coverHtml}
    <h1 style="color:#1a1a1a;font-size:24px;line-height:1.3;margin-bottom:16px;font-family:Georgia,serif;">${fullArticle.title}</h1>
    <p style="color:#555;font-size:16px;line-height:1.6;margin-bottom:24px;">${fullArticle.excerpt || ""}</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${articleUrl}" style="background:#b8860b;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">Leer artículo completo</a>
    </div>
    <hr style="border:none;border-top:1px solid #e0d5c5;margin:32px 0;" />
    <p style="color:#999;font-size:11px;text-align:center;">
      Recibes este email porque te suscribiste al newsletter de Legado Inmobiliaria.<br/>
      <a href="${siteUrl}" style="color:#b8860b;">Visitar web</a>
    </p>
  </div>
</body></html>`;

          // Use brevo-manager to send as a proper campaign
          const campaignRes = await fetch(`${baseUrl}/functions/v1/brevo-manager`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${serviceKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "send_campaign",
              subject: `📰 Nuevo artículo: ${fullArticle.title}`,
              html_content: htmlContent,
              preview_text: fullArticle.excerpt || "",
            }),
          });

          const campaignResult = await campaignRes.json();
          console.log("Campaign result:", JSON.stringify(campaignResult));
          newsletterSent = campaignResult?.success || false;
        }
      } catch (e) {
        console.error("Newsletter campaign error:", e);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        deleted: { title: leastRead.title, views: leastRead.views },
        replacement: generateResult,
        newsletter_sent: newsletterSent,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Rotation error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
