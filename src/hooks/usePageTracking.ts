import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getIntentSummaryPayload } from "@/lib/personalization";

function getSessionId(): string {
  let sid = sessionStorage.getItem("_pv_sid");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("_pv_sid", sid);
  }
  return sid;
}

function getDeviceType(w: number): string {
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function getUTMParams(): { utm_source?: string; utm_medium?: string; utm_campaign?: string } {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || undefined,
    utm_medium: params.get("utm_medium") || undefined,
    utm_campaign: params.get("utm_campaign") || undefined,
  };
}

function extractPropertyInfo(path: string): { property_id?: string; property_title?: string } {
  // /propiedad/:slug pattern — slug might be UUID or text slug
  const match = path.match(/^\/propiedad\/([^/]+)/);
  if (match) {
    const slug = match[1];
    // If it looks like a UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    return {
      property_id: isUUID ? slug : undefined,
      property_title: isUUID ? undefined : decodeURIComponent(slug),
    };
  }
  return {};
}

const usePageTracking = () => {
  const location = useLocation();
  const startTimeRef = useRef<number>(Date.now());
  const lastPathRef = useRef<string>("");

  useEffect(() => {
    const currentPath = location.pathname;

    // Don't track admin pages
    if (currentPath.startsWith("/admin")) return;

    // Send duration of previous page
    if (lastPathRef.current && lastPathRef.current !== currentPath) {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (duration > 0 && duration < 3600) {
        // Update duration for previous page view (fire and forget)
        // We'll just track duration on the new record instead
      }
    }

    startTimeRef.current = Date.now();
    lastPathRef.current = currentPath;

    const sessionId = getSessionId();
    const utms = getUTMParams();
    const propInfo = extractPropertyInfo(currentPath);

    const record = {
      session_id: sessionId,
      path: currentPath,
      referrer: document.referrer || null,
      utm_source: utms.utm_source || null,
      utm_medium: utms.utm_medium || null,
      utm_campaign: utms.utm_campaign || null,
      device_type: getDeviceType(window.innerWidth),
      user_agent: navigator.userAgent.slice(0, 255),
      screen_width: window.innerWidth,
      property_id: propInfo.property_id || null,
      property_title: propInfo.property_title || null,
      metadata: getIntentSummaryPayload(),
    };

    // Fire and forget — don't block rendering
    supabase.from("page_views").insert(record).then();
  }, [location.pathname]);

  // Track duration on page unload
  useEffect(() => {
    const handleUnload = () => {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (duration > 0 && duration < 3600 && lastPathRef.current) {
        // Use sendBeacon for reliability on page close
        const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/page_views`;
        const body = JSON.stringify({
          session_id: getSessionId(),
          path: lastPathRef.current,
          duration_seconds: duration,
          device_type: getDeviceType(window.innerWidth),
          screen_width: window.innerWidth,
        });
        navigator.sendBeacon?.(url, new Blob([body], { type: "application/json" }));
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);
};

export default usePageTracking;
