import DOMPurify from "dompurify";

const FORBIDDEN_TAGS = ["script", "style", "iframe", "object", "embed", "form"];
const FORBIDDEN_ATTRS = ["onerror", "onload", "onclick", "onmouseover"];

export function sanitizeHtml(html: string) {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: FORBIDDEN_TAGS,
    FORBID_ATTR: FORBIDDEN_ATTRS,
  });
}
