import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BREVO_BASE = "https://api.brevo.com/v3";
const LIST_NAME = "Legado Inmobiliaria Newsletter";
const SENDER = { name: "Legado Inmobiliaria", email: "info@planhogar.es" };

type BrevoList = {
  id: number;
  name: string;
};

type BrevoFetchResult<T> = {
  ok: boolean;
  status: number;
  data: T | string;
};

type BrevoListsResponse = {
  lists?: BrevoList[];
};

async function brevoFetch<T>(path: string, apiKey: string, options: RequestInit = {}): Promise<BrevoFetchResult<T>> {
  const res = await fetch(`${BREVO_BASE}${path}`, {
    ...options,
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, data: JSON.parse(text) };
  } catch {
    return { ok: res.ok, status: res.status, data: text };
  }
}

// Ensure our contact list exists, return list ID
async function ensureList(apiKey: string): Promise<number> {
  // Get existing lists
  const { data: lists } = await brevoFetch<BrevoListsResponse>("/contacts/lists?limit=50&offset=0", apiKey);
  if (typeof lists === "string") {
    throw new Error("Brevo list lookup failed");
  }
  const existing = lists?.lists?.find((list) => list.name === LIST_NAME);
  if (existing) return existing.id;

  // Create list
  const { data: created } = await brevoFetch<{ id: number }>("/contacts/lists", apiKey, {
    method: "POST",
    body: JSON.stringify({ name: LIST_NAME, folderId: 1 }),
  });
  if (typeof created === "string") {
    throw new Error("Brevo list creation failed");
  }
  return created.id;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    if (!BREVO_API_KEY) throw new Error("BREVO_API_KEY not configured");

    const { action, ...params } = await req.json();

    // Public actions that don't require admin auth
    const publicActions = ["add_contact"];

    if (!publicActions.includes(action)) {
      // Auth check: require authenticated admin for non-public actions
      const authHeader = req.headers.get("authorization");
      if (!authHeader) {
        return json({ error: "Unauthorized" }, 401);
      }
      const authSupabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user }, error: authError } = await authSupabase.auth.getUser();
      if (authError || !user) {
        return json({ error: "Unauthorized" }, 401);
      }
      const { data: isAdmin } = await authSupabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (!isAdmin) {
        return json({ error: "Forbidden" }, 403);
      }
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // action and params already parsed above

    switch (action) {
      // ─── SYNC: push all DB subscribers to Brevo contacts ───
      case "sync_contacts": {
        const listId = await ensureList(BREVO_API_KEY);

        const { data: subs } = await supabase
          .from("newsletter_subscribers")
          .select("email, name, language, source, is_active");

        if (!subs || subs.length === 0) {
          return json({ success: true, synced: 0, message: "No subscribers to sync" });
        }

        // Split active and inactive
        const active = subs.filter(s => s.is_active);
        const inactive = subs.filter(s => !s.is_active);

        // Import active contacts
        if (active.length > 0) {
          await brevoFetch("/contacts/import", BREVO_API_KEY, {
            method: "POST",
            body: JSON.stringify({
              listIds: [listId],
              emailBlacklist: false,
              updateExistingContacts: true,
              jsonBody: active.map(s => ({
                email: s.email,
                attributes: {
                  NOMBRE: s.name || "",
                  IDIOMA: s.language || "es",
                  FUENTE: s.source || "web",
                },
              })),
            }),
          });
        }

        // Blacklist inactive contacts
        if (inactive.length > 0) {
          for (const s of inactive) {
            await brevoFetch(`/contacts/${encodeURIComponent(s.email)}`, BREVO_API_KEY, {
              method: "PUT",
              body: JSON.stringify({ emailBlacklist: true }),
            });
          }
        }

        return json({ success: true, synced: active.length, blacklisted: inactive.length, listId });
      }

      // ─── GET BREVO STATS: account info + campaign stats ───
      case "get_stats": {
        const [accountRes, campaignsRes] = await Promise.all([
          brevoFetch("/account", BREVO_API_KEY),
          brevoFetch("/emailCampaigns?limit=10&offset=0&sort=desc", BREVO_API_KEY),
        ]);

        return json({
          success: true,
          account: accountRes.data,
          campaigns: campaignsRes.data?.campaigns || [],
        });
      }

      // ─── SEND CAMPAIGN: create + send a campaign via Brevo ───
      case "send_campaign": {
        const { subject, html_content, preview_text } = params;
        if (!subject || !html_content) throw new Error("subject and html_content required");

        const listId = await ensureList(BREVO_API_KEY);

        // First sync contacts
        const { data: activeSubs } = await supabase
          .from("newsletter_subscribers")
          .select("email, name, language")
          .eq("is_active", true);

        if (!activeSubs || activeSubs.length === 0) {
          return json({ success: false, error: "No active subscribers" });
        }

        // Quick sync before sending
        await brevoFetch("/contacts/import", BREVO_API_KEY, {
          method: "POST",
          body: JSON.stringify({
            listIds: [listId],
            updateExistingContacts: true,
            jsonBody: activeSubs.map(s => ({
              email: s.email,
              attributes: { NOMBRE: s.name || "", IDIOMA: s.language || "es" },
            })),
          }),
        });

        // Wait a moment for import to process
        await new Promise(r => setTimeout(r, 2000));

        // Create campaign
        const campaignRes = await brevoFetch("/emailCampaigns", BREVO_API_KEY, {
          method: "POST",
          body: JSON.stringify({
            name: `Newsletter: ${subject} - ${new Date().toISOString().slice(0, 10)}`,
            subject,
            sender: SENDER,
            type: "classic",
            htmlContent: html_content,
            previewText: preview_text || "",
            recipients: { listIds: [listId] },
            inlineImageActivation: true,
          }),
        });

        if (!campaignRes.ok) {
          console.error("Campaign creation failed:", campaignRes.data);
          return json({ success: false, error: campaignRes.data }, 400);
        }

        const campaignId = campaignRes.data.id;

        // Send campaign immediately
        const sendRes = await brevoFetch(`/emailCampaigns/${campaignId}/sendNow`, BREVO_API_KEY, {
          method: "POST",
        });

        if (!sendRes.ok) {
          console.error("Campaign send failed:", sendRes.data);
          return json({ success: false, error: sendRes.data, campaignId }, 400);
        }

        return json({
          success: true,
          campaignId,
          recipients: activeSubs.length,
          listId,
        });
      }

      // ─── GET CAMPAIGN STATS ───
      case "get_campaign_stats": {
        const { campaign_id } = params;
        if (!campaign_id) throw new Error("campaign_id required");

        const res = await brevoFetch(`/emailCampaigns/${campaign_id}`, BREVO_API_KEY);
        return json({ success: true, campaign: res.data });
      }

      // ─── LIST CAMPAIGNS ───
      case "list_campaigns": {
        const limit = params.limit || 20;
        const res = await brevoFetch(`/emailCampaigns?limit=${limit}&offset=0&sort=desc`, BREVO_API_KEY);
        return json({
          success: true,
          campaigns: res.data?.campaigns || [],
          count: res.data?.count || 0,
        });
      }

      // ─── ADD SINGLE CONTACT (for real-time subscription) ───
      case "add_contact": {
        const { email, name, language: lang, source } = params;
        if (!email) throw new Error("email required");

        const listId = await ensureList(BREVO_API_KEY);

        const res = await brevoFetch("/contacts", BREVO_API_KEY, {
          method: "POST",
          body: JSON.stringify({
            email,
            listIds: [listId],
            updateEnabled: true,
            attributes: {
              NOMBRE: name || "",
              IDIOMA: lang || "es",
              FUENTE: source || "web",
            },
          }),
        });

        return json({ success: res.ok || res.status === 204, brevo: res.data });
      }

      // ─── CREATE EMAIL TEMPLATE ───
      case "create_template": {
        const { template_name, subject: tSubject, html_content: tHtml } = params;

        const res = await brevoFetch("/smtp/templates", BREVO_API_KEY, {
          method: "POST",
          body: JSON.stringify({
            sender: SENDER,
            templateName: template_name || "Legado Inmobiliaria Newsletter",
            subject: tSubject || "{{params.subject}}",
            htmlContent: tHtml,
            isActive: true,
          }),
        });

        return json({ success: res.ok, template: res.data });
      }

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (e) {
    console.error("Error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
