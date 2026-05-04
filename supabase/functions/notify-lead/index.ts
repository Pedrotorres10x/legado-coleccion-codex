import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // ── Origin validation: only allow requests from our domains ──
  const origin = req.headers.get("origin") ?? "";
  const referer = req.headers.get("referer") ?? "";
  const configuredSiteUrl = Deno.env.get("SITE_URL") ?? "";
  const siteHostname = configuredSiteUrl ? new URL(configuredSiteUrl).hostname : "";
  const allowedDomains = [siteHostname].filter(Boolean);
  const isAllowed = allowedDomains.some(d => origin.includes(d) || referer.includes(d));
  if (!isAllowed) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    if (!BREVO_API_KEY) throw new Error("BREVO_API_KEY not configured");

    const { name, email, phone, message, property_title, metadata } = await req.json();
    if (!name || !email) throw new Error("name and email required");
    const intentScore = metadata?.score;
    const intentStage = metadata?.stage;
    const topAreaSlug = metadata?.topAreaSlug;
    const topTopic = metadata?.topTopic;

    // Escape all user-supplied values before inserting into HTML
    const eName = escapeHtml(name);
    const eEmail = escapeHtml(email);
    const ePhone = escapeHtml(phone);
    const eMessage = escapeHtml(message);
    const ePropertyTitle = escapeHtml(property_title);
    const eIntentStage = escapeHtml(intentStage);
    const eTopAreaSlug = escapeHtml(topAreaSlug);
    const eTopTopic = escapeHtml(topTopic);

    const htmlContent = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f9f7f4;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:32px 20px;">
    <h2 style="color:#b8860b;font-size:13px;letter-spacing:3px;text-transform:uppercase;margin:0 0 24px;">Nuevo Lead · Legado Inmobiliaria</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#999;font-size:13px;width:120px;">Nombre</td><td style="padding:8px 0;color:#1a1a1a;font-size:15px;font-weight:600;">${eName}</td></tr>
      <tr><td style="padding:8px 0;color:#999;font-size:13px;">Email</td><td style="padding:8px 0;color:#1a1a1a;font-size:15px;"><a href="mailto:${eEmail}" style="color:#b8860b;">${eEmail}</a></td></tr>
      ${phone ? `<tr><td style="padding:8px 0;color:#999;font-size:13px;">Teléfono</td><td style="padding:8px 0;color:#1a1a1a;font-size:15px;"><a href="tel:${ePhone}" style="color:#b8860b;">${ePhone}</a></td></tr>` : ""}
      ${property_title ? `<tr><td style="padding:8px 0;color:#999;font-size:13px;">Propiedad</td><td style="padding:8px 0;color:#1a1a1a;font-size:15px;">${ePropertyTitle}</td></tr>` : ""}
      ${message ? `<tr><td style="padding:8px 0;color:#999;font-size:13px;vertical-align:top;">Mensaje</td><td style="padding:8px 0;color:#1a1a1a;font-size:15px;">${eMessage}</td></tr>` : ""}
      ${intentStage || intentScore != null ? `<tr><td style="padding:8px 0;color:#999;font-size:13px;">Intento</td><td style="padding:8px 0;color:#1a1a1a;font-size:15px;">${eIntentStage || "unknown"}${intentScore != null ? ` · ${escapeHtml(intentScore)}/100` : ""}</td></tr>` : ""}
      ${topAreaSlug ? `<tr><td style="padding:8px 0;color:#999;font-size:13px;">Zona top</td><td style="padding:8px 0;color:#1a1a1a;font-size:15px;">${eTopAreaSlug}</td></tr>` : ""}
      ${topTopic ? `<tr><td style="padding:8px 0;color:#999;font-size:13px;">Tema top</td><td style="padding:8px 0;color:#1a1a1a;font-size:15px;">${eTopTopic}</td></tr>` : ""}
    </table>
    <hr style="border:none;border-top:1px solid #e0d5c5;margin:24px 0;" />
    <p style="color:#999;font-size:11px;">Enviado automáticamente desde ${escapeHtml(configuredSiteUrl || "la web")}</p>
  </div>
</body></html>`;

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Legado Inmobiliaria Web", email: "info@planhogar.es" },
        to: [{ email: "pedro@legadoinmobiliaria.es", name: "Pedro Torres" }],
        replyTo: { email, name },
        subject: `🏠 Nuevo lead: ${name}${property_title ? ` — ${property_title}` : ""}`,
        htmlContent,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Brevo error:", err);
      return new Response(JSON.stringify({ success: false, error: err }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
