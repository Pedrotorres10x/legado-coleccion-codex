/**
 * Shared anti-spam utilities for forms & navigation
 */

// ─── Disposable email detection ───

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "tempmail.com", "guerrillamail.com", "guerrillamail.net",
  "throwaway.email", "yopmail.com", "sharklasers.com", "guerrillamailblock.com",
  "grr.la", "dispostable.com", "maildrop.cc", "mailnesia.com", "trashmail.com",
  "trashmail.net", "trashmail.me", "mohmal.com", "tempail.com", "fakeinbox.com",
  "mailtemp.net", "temp-mail.org", "10minutemail.com", "minutemail.com",
  "emailondeck.com", "getnada.com", "burnermail.io", "inboxkitten.com",
  "mytemp.email", "tempr.email", "discard.email", "mailsac.com",
  "harakirimail.com", "33mail.com", "maildax.com",
]);

export function isDisposableEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1];
  if (!domain) return false;
  return DISPOSABLE_DOMAINS.has(domain);
}

// ─── Test email whitelist ───

function isTestEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith("@pedrotorres10x.es");
}

// ─── Session-based rate limiting (per form key) ───

const DEFAULT_SESSION_KEY = "rl_form_submissions";
const MAX_PER_SESSION = 50;

export function checkSessionLimit(key = DEFAULT_SESSION_KEY, email = ""): boolean {
  if (isTestEmail(email)) return false;
  const count = parseInt(sessionStorage.getItem(key) || "0", 10);
  return count >= MAX_PER_SESSION;
}

export function incrementSessionCount(key = DEFAULT_SESSION_KEY): void {
  const count = parseInt(sessionStorage.getItem(key) || "0", 10);
  sessionStorage.setItem(key, String(count + 1));
}

// ─── Cooldown between submissions (prevents rapid-fire) ───

const COOLDOWN_MS = 30_000; // 30 seconds between form submissions
const lastSubmitStore: Record<string, number> = {};

export function checkCooldown(formId = "default", email = ""): boolean {
  if (isTestEmail(email)) return false;
  const last = lastSubmitStore[formId] || 0;
  return Date.now() - last < COOLDOWN_MS;
}

export function markSubmission(formId = "default"): void {
  lastSubmitStore[formId] = Date.now();
}

// ─── Interaction tracker (detects bot-like lack of focus events) ───

export function createInteractionTracker() {
  const focused = new Set<string>();
  const onFieldFocus = (fieldName: string) => {
    focused.add(fieldName);
  };
  const hasEnoughInteraction = () => focused.size >= 2;
  return { onFieldFocus, hasEnoughInteraction };
}

// ─── Input sanitization ───

const MAX_FIELD_LENGTHS: Record<string, number> = {
  name: 100,
  email: 255,
  phone: 30,
  message: 2000,
  subject: 200,
};

/** Trim and clamp field length. Returns sanitized value. */
export function sanitizeField(field: string, value: string): string {
  const max = MAX_FIELD_LENGTHS[field] || 500;
  return value.trim().slice(0, max);
}

/** Basic email format check beyond HTML5 required */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/** Check for suspicious patterns in text fields */
export function containsSpamPatterns(text: string): boolean {
  const lower = text.toLowerCase();
  const spamPatterns = [
    /\[url[=\]]/i,
    /https?:\/\/[^\s]+\.(ru|cn|tk|ml|ga|cf)\b/i,
    /<\s*(script|iframe|object|embed)/i,
    /\b(viagra|casino|crypto|bitcoin|forex|lottery|winner)\b/i,
  ];
  return spamPatterns.some((p) => p.test(lower));
}

// ─── Navigation rate limiting (anti-scraping) ───

const NAV_WINDOW_MS = 10_000; // 10-second sliding window
const NAV_MAX_HITS = 30; // max page navigations in window
const navTimestamps: number[] = [];

/**
 * Call on every route change. Returns true if navigation is being abused.
 * Does NOT block — just signals so the app can throttle or warn.
 */
export function trackNavigation(): boolean {
  const now = Date.now();
  navTimestamps.push(now);

  // Prune old entries outside the window
  while (navTimestamps.length > 0 && navTimestamps[0] < now - NAV_WINDOW_MS) {
    navTimestamps.shift();
  }

  return navTimestamps.length > NAV_MAX_HITS;
}
