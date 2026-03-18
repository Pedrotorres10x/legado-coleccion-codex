import { supabase } from "@/integrations/supabase/client";
import { getPushPreferencePayload } from "@/lib/personalization";

type PushSubscriptionJson = {
  endpoint?: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

const PUSH_ASKED_KEY = "push_notification_asked";
const PUSH_SUBSCRIBED_KEY = "push_notification_subscribed";

export function wasPushAsked(): boolean {
  return localStorage.getItem(PUSH_ASKED_KEY) === "true";
}

export function setPushAsked() {
  localStorage.setItem(PUSH_ASKED_KEY, "true");
}

export function isPushSubscribed(): boolean {
  return localStorage.getItem(PUSH_SUBSCRIBED_KEY) === "true";
}

export function setPushSubscribed(val: boolean) {
  localStorage.setItem(PUSH_SUBSCRIBED_KEY, val ? "true" : "false");
}

export function isPushSupported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

let cachedVapidKey: string | null = null;

export async function getVapidPublicKey(): Promise<string> {
  if (cachedVapidKey) return cachedVapidKey;
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  const res = await fetch(`${baseUrl}/functions/v1/subscribe-push`);
  const json = await res.json();
  if (!json.publicKey) throw new Error("VAPID public key not available");
  cachedVapidKey = json.publicKey;
  return cachedVapidKey;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}

export async function subscribeToPush(): Promise<boolean> {
  try {
    // Register service worker
    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    // Get VAPID public key from backend
    const vapidPublicKey = await getVapidPublicKey();

    // Request permission (native dialog)
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return false;
    }

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    const subJson = subscription.toJSON() as PushSubscriptionJson;

    // Save to backend
    const baseUrl = import.meta.env.VITE_SUPABASE_URL;
    await fetch(`${baseUrl}/functions/v1/subscribe-push`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: subJson.endpoint,
        keys: subJson.keys,
        userAgent: navigator.userAgent,
        metadata: getPushPreferencePayload(),
      }),
    });

    setPushSubscribed(true);
    return true;
  } catch (err) {
    console.error("Push subscription error:", err);
    return false;
  }
}
