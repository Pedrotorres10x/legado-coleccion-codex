import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Audience = {
  areaSlugs?: string[];
  topics?: string[];
  cities?: string[];
};

type SubscriptionMetadata = {
  preferences?: {
    areaSlugs?: string[];
    topics?: string[];
    cities?: string[];
  };
};

/* ── Base64-URL helpers ─────────────────────────────────────── */

function base64UrlToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob(base64.replace(/-/g, "+").replace(/_/g, "/") + padding);
  return new Uint8Array([...raw].map((c) => c.charCodeAt(0)));
}

function uint8ArrayToBase64Url(arr: Uint8Array): string {
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function concatBuffers(...bufs: Uint8Array[]): Uint8Array {
  const total = bufs.reduce((acc, b) => acc + b.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const buf of bufs) {
    result.set(buf, offset);
    offset += buf.length;
  }
  return result;
}

/* ── HMAC-based HKDF (SHA-256) ──────────────────────────────── */

async function hmacSha256(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const k = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", k, data));
}

async function hkdfExtract(salt: Uint8Array, ikm: Uint8Array): Promise<Uint8Array> {
  return hmacSha256(salt, ikm);
}

async function hkdfExpand(prk: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const result = await hmacSha256(prk, concatBuffers(info, new Uint8Array([1])));
  return result.slice(0, length);
}

/* ── VAPID JWT signing (ES256 / P-256) ──────────────────────── */

async function importVapidPrivateKey(publicKeyB64: string, privateKeyB64: string) {
  const pub = base64UrlToUint8Array(publicKeyB64);
  const x = uint8ArrayToBase64Url(pub.slice(1, 33));
  const y = uint8ArrayToBase64Url(pub.slice(33, 65));
  return crypto.subtle.importKey(
    "jwk",
    { kty: "EC", crv: "P-256", x, y, d: privateKeyB64, ext: true },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );
}

function parseDerInt(buf: Uint8Array, offset: number): Uint8Array {
  const len = buf[offset + 1];
  return buf.slice(offset + 2, offset + 2 + len);
}

function padTo32(arr: Uint8Array): Uint8Array {
  if (arr.length === 32) return arr;
  if (arr.length > 32) return arr.slice(arr.length - 32);
  const padded = new Uint8Array(32);
  padded.set(arr, 32 - arr.length);
  return padded;
}

async function createVapidAuthHeader(
  endpoint: string,
  publicKey: string,
  privateKeyB64: string,
  subject: string
) {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;

  const header = { typ: "JWT", alg: "ES256" };
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    sub: subject,
  };

  const encHeader = uint8ArrayToBase64Url(new TextEncoder().encode(JSON.stringify(header)));
  const encPayload = uint8ArrayToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signingInput = `${encHeader}.${encPayload}`;

  const key = await importVapidPrivateKey(publicKey, privateKeyB64);
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(signingInput)
  );

  const sigBytes = new Uint8Array(signature);
  let rawSig: Uint8Array;
  if (sigBytes.length === 64) {
    rawSig = sigBytes;
  } else {
    const r = parseDerInt(sigBytes, 2);
    const s = parseDerInt(sigBytes, 2 + 2 + sigBytes[3]);
    rawSig = new Uint8Array(64);
    rawSig.set(padTo32(r), 0);
    rawSig.set(padTo32(s), 32);
  }

  const token = `${signingInput}.${uint8ArrayToBase64Url(rawSig)}`;
  return { authorization: `vapid t=${token}, k=${publicKey}` };
}

/* ── RFC 8291 + RFC 8188 payload encryption (aes128gcm) ────── */

async function encryptPayload(
  p256dhKey: string,
  authSecret: string,
  plaintext: string
): Promise<Uint8Array> {
  // 1. Import subscriber's p256dh public key
  const uaPublic = base64UrlToUint8Array(p256dhKey);
  const uaPublicKey = await crypto.subtle.importKey(
    "raw", uaPublic,
    { name: "ECDH", namedCurve: "P-256" }, false, []
  );

  // 2. Generate ephemeral ECDH key pair (application server)
  const asKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]
  );
  const asPublic = new Uint8Array(
    await crypto.subtle.exportKey("raw", asKeyPair.publicKey)
  );

  // 3. ECDH shared secret
  const ecdhSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "ECDH", public: uaPublicKey },
      asKeyPair.privateKey,
      256
    )
  );

  // 4. Auth secret
  const authBytes = base64UrlToUint8Array(authSecret);

  // 5. Random 16-byte salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // 6. RFC 8291 key derivation
  // Step A: PRK_key = HKDF-Extract(salt=auth, IKM=ecdh_secret)
  const prkKey = await hkdfExtract(authBytes, ecdhSecret);

  // Step B: IKM = HKDF-Expand(PRK_key, "WebPush: info\0" || ua_public || as_public, 32)
  const keyInfo = concatBuffers(
    new TextEncoder().encode("WebPush: info\0"),
    uaPublic,
    asPublic
  );
  const ikm = await hkdfExpand(prkKey, keyInfo, 32);

  // Step C: PRK = HKDF-Extract(salt=salt, IKM=ikm)
  const prk = await hkdfExtract(salt, ikm);

  // Step D: CEK and nonce
  const cek = await hkdfExpand(prk, new TextEncoder().encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdfExpand(prk, new TextEncoder().encode("Content-Encoding: nonce\0"), 12);

  // 7. Pad plaintext: content || 0x02 (last-record delimiter)
  const plaintextBytes = new TextEncoder().encode(plaintext);
  const padded = concatBuffers(plaintextBytes, new Uint8Array([2]));

  // 8. AES-128-GCM encrypt
  const encKey = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, encKey, padded)
  );

  // 9. Build aes128gcm record: salt(16) || rs(4, BE) || idlen(1) || keyid(asPublic) || ciphertext
  const recordSize = 4096;
  const header = new Uint8Array(16 + 4 + 1 + asPublic.length);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, recordSize, false);
  header[20] = asPublic.length;
  header.set(asPublic, 21);

  return concatBuffers(header, ciphertext);
}

/* ── Send one push notification ─────────────────────────────── */

async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: object,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
) {
  const payloadStr = JSON.stringify(payload);

  const { authorization } = await createVapidAuthHeader(
    subscription.endpoint,
    vapidPublicKey,
    vapidPrivateKey,
    vapidSubject
  );

  // Encrypt payload per RFC 8291 (aes128gcm)
  const body = await encryptPayload(
    subscription.p256dh,
    subscription.auth,
    payloadStr
  );

  const response = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      Authorization: authorization,
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      TTL: "86400",
    },
    body,
  });

  return { status: response.status, ok: response.ok };
}

function matchesAudience(metadata: SubscriptionMetadata | null | undefined, audience?: Audience) {
  if (!audience) return true;

  const requestedAreas = audience.areaSlugs || [];
  const requestedTopics = audience.topics || [];
  const requestedCities = audience.cities || [];

  if (requestedAreas.length === 0 && requestedTopics.length === 0 && requestedCities.length === 0) {
    return true;
  }

  const prefs = metadata?.preferences || {};
  const areaMatch = requestedAreas.some((item) => prefs.areaSlugs?.includes(item));
  const topicMatch = requestedTopics.some((item) => prefs.topics?.includes(item));
  const cityMatch = requestedCities.some((item) => prefs.cities?.includes(item));

  return areaMatch || topicMatch || cityMatch;
}

/* ── Main handler ───────────────────────────────────────────── */

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth: require service role or INTERNAL_API_KEY
    const authHeader = req.headers.get("authorization") ?? "";
    const INTERNAL_API_KEY = Deno.env.get("INTERNAL_API_KEY");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (token !== SERVICE_ROLE && token !== INTERNAL_API_KEY) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      throw new Error("VAPID keys not configured");
    }
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase not configured");
    }

    const { title, body, icon, url, data, audience } = await req.json();

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: "title and body are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("*");

    if (error) throw error;

    const filteredSubscriptions = (subscriptions || []).filter((sub) =>
      matchesAudience(sub.metadata as SubscriptionMetadata | null | undefined, audience as Audience | undefined)
    );

    const payload = {
      title,
      body,
      icon: icon || "/favicon.ico",
      badge: "/favicon.ico",
      url: url || "/",
      data,
    };

    let sent = 0;
    let failed = 0;
    const staleEndpoints: string[] = [];

    for (const sub of filteredSubscriptions) {
      try {
        const result = await sendPushNotification(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          payload,
          VAPID_PUBLIC_KEY,
          VAPID_PRIVATE_KEY,
          "mailto:pedrotorres10x.es"
        );

        if (result.ok) {
          sent++;
        } else if (result.status === 410 || result.status === 404) {
          staleEndpoints.push(sub.endpoint);
          failed++;
        } else {
          console.error(`Push failed for ${sub.endpoint}: ${result.status}`);
          failed++;
        }
      } catch (err) {
        console.error(`Push error for ${sub.endpoint}:`, err);
        failed++;
      }
    }

    if (staleEndpoints.length > 0) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("endpoint", staleEndpoints);
    }

    return new Response(
      JSON.stringify({
        success: true,
        total: filteredSubscriptions.length,
        sent,
        failed,
        cleaned: staleEndpoints.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Send push error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
