import { useEffect } from "react";
import { SITE_URL } from "@/lib/site";

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: string;
  noIndex?: boolean;
  jsonLd?: object | object[];
  // Article-specific Open Graph
  articleAuthor?: string;
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleSection?: string;
  articleTags?: string[];
  // Keywords for meta[name=keywords]
  keywords?: string;
}

/**
 * Dynamic SEO head manager - updates document meta tags at runtime.
 * Handles title, description, OG, Twitter, canonical, JSON-LD, article meta.
 */
const SEOHead = ({
  title,
  description,
  canonical,
  ogImage = `${SITE_URL}/og-image.jpg`,
  ogImageAlt,
  ogType = "website",
  noIndex = false,
  jsonLd,
  articleAuthor,
  articlePublishedTime,
  articleModifiedTime,
  articleSection,
  articleTags,
  keywords,
}: SEOHeadProps) => {
  useEffect(() => {
    // Title
    document.title = title;

    // Helper to set or create meta tags
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const removeMeta = (attr: string, key: string) => {
      document.querySelector(`meta[${attr}="${key}"]`)?.remove();
    };

    // Standard meta
    setMeta("name", "description", description);
    if (keywords) {
      setMeta("name", "keywords", keywords);
    } else {
      removeMeta("name", "keywords");
    }
    if (noIndex) {
      setMeta("name", "robots", "noindex, nofollow");
    } else {
      setMeta("name", "robots", "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1");
    }

    // Open Graph
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", ogImage);
    setMeta("property", "og:image:alt", ogImageAlt || title);
    setMeta("property", "og:image:width", "1200");
    setMeta("property", "og:image:height", "630");
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:site_name", "Legado Inmobiliaria");
    setMeta("property", "og:locale", "es_ES");
    if (canonical) {
      setMeta("property", "og:url", canonical);
    }

    // Article-specific OG (only when ogType === "article")
    const articleProps = ["article:author", "article:published_time", "article:modified_time", "article:section"];
    if (ogType === "article") {
      if (articleAuthor) setMeta("property", "article:author", articleAuthor);
      if (articlePublishedTime) setMeta("property", "article:published_time", articlePublishedTime);
      if (articleModifiedTime) setMeta("property", "article:modified_time", articleModifiedTime);
      if (articleSection) setMeta("property", "article:section", articleSection);
      // Remove existing article:tag metas then re-add
      document.querySelectorAll('meta[property="article:tag"]').forEach(el => el.remove());
      (articleTags || []).forEach(tag => {
        const el = document.createElement("meta");
        el.setAttribute("property", "article:tag");
        el.setAttribute("content", tag);
        document.head.appendChild(el);
      });
    } else {
      articleProps.forEach(prop => removeMeta("property", prop));
      document.querySelectorAll('meta[property="article:tag"]').forEach(el => el.remove());
    }

    // Twitter Card
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImage);
    setMeta("name", "twitter:image:alt", ogImageAlt || title);
    if (canonical) setMeta("name", "twitter:url", canonical);

    // Canonical
    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) {
      if (!canonicalEl) {
        canonicalEl = document.createElement("link");
        canonicalEl.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalEl);
      }
      canonicalEl.setAttribute("href", canonical);
    }

    // Hreflang tags
    const langs = ["es", "en", "fr", "de"];
    document.querySelectorAll('link[hreflang]').forEach((el) => el.remove());
    if (canonical) {
      const baseUrl = canonical.split("?")[0];
      langs.forEach((lang) => {
        const link = document.createElement("link");
        link.setAttribute("rel", "alternate");
        link.setAttribute("hreflang", lang);
        link.setAttribute("href", `${baseUrl}?lang=${lang}`);
        document.head.appendChild(link);
      });
      const xDefault = document.createElement("link");
      xDefault.setAttribute("rel", "alternate");
      xDefault.setAttribute("hreflang", "x-default");
      xDefault.setAttribute("href", baseUrl);
      document.head.appendChild(xDefault);
    }

    // JSON-LD
    const existingLd = document.querySelectorAll('script[data-seo-jsonld]');
    existingLd.forEach((el) => el.remove());

    if (jsonLd) {
      const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      schemas.forEach((schema) => {
        const script = document.createElement("script");
        script.setAttribute("type", "application/ld+json");
        script.setAttribute("data-seo-jsonld", "true");
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
      });
    }

    // Cleanup on unmount
    return () => {
      document.querySelectorAll('script[data-seo-jsonld]').forEach((el) => el.remove());
      document.querySelectorAll('link[hreflang]').forEach((el) => el.remove());
      document.querySelectorAll('meta[property="article:tag"]').forEach(el => el.remove());
      articleProps.forEach(prop => removeMeta("property", prop));
      removeMeta("name", "keywords");
    };
  }, [title, description, canonical, ogImage, ogImageAlt, ogType, noIndex, jsonLd, articleAuthor, articlePublishedTime, articleModifiedTime, articleSection, articleTags, keywords]);

  return null;
};

export default SEOHead;
