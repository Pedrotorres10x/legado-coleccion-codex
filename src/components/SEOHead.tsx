import { useEffect } from "react";
import {
  BUSINESS_CITY,
  BUSINESS_COUNTRY,
  BUSINESS_LATITUDE,
  BUSINESS_LONGITUDE,
  BUSINESS_PHONE,
  BUSINESS_REGION,
  DEFAULT_LOCALE,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  SITE_NAME,
  SITE_URL,
  SUPPORTED_LOCALES,
  localeToHtmlLang,
  localeToOgLocale,
} from "@/lib/site";

type AlternateLink = {
  hrefLang: string;
  href: string;
};

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: string;
  noIndex?: boolean;
  jsonLd?: object | object[];
  locale?: string;
  alternates?: AlternateLink[];
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
  ogImage = DEFAULT_OG_IMAGE,
  ogImageAlt,
  ogType = "website",
  noIndex = false,
  jsonLd,
  locale = DEFAULT_LOCALE,
  alternates,
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
    document.documentElement.lang = localeToHtmlLang(locale);

    setMeta("name", "description", description);
    setMeta("name", "author", SITE_NAME);
    setMeta("name", "publisher", SITE_NAME);
    setMeta("name", "application-name", SITE_NAME);
    setMeta("name", "apple-mobile-web-app-title", SITE_NAME);
    setMeta("name", "theme-color", "#171717");
    setMeta("name", "format-detection", "telephone=yes");
    setMeta("name", "referrer", "strict-origin-when-cross-origin");
    setMeta("http-equiv", "content-language", locale);
    setMeta("name", "language", locale);
    if (keywords) {
      setMeta("name", "keywords", keywords);
    } else {
      removeMeta("name", "keywords");
    }
    if (noIndex) {
      setMeta("name", "robots", "noindex, nofollow");
      setMeta("name", "googlebot", "noindex, nofollow");
      setMeta("name", "bingbot", "noindex, nofollow");
    } else {
      setMeta("name", "robots", "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1");
      setMeta("name", "googlebot", "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1");
      setMeta("name", "bingbot", "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1");
    }
    setMeta("name", "geo.region", `${BUSINESS_COUNTRY}-${BUSINESS_REGION.toUpperCase()}`);
    setMeta("name", "geo.placename", BUSINESS_CITY);
    setMeta("name", "geo.position", `${BUSINESS_LATITUDE};${BUSINESS_LONGITUDE}`);
    setMeta("name", "ICBM", `${BUSINESS_LATITUDE}, ${BUSINESS_LONGITUDE}`);
    setMeta("name", "business:contact_data:locality", BUSINESS_CITY);
    setMeta("name", "business:contact_data:region", BUSINESS_REGION);
    setMeta("name", "business:contact_data:country_name", "Spain");
    setMeta("name", "business:contact_data:phone_number", BUSINESS_PHONE);

    // Open Graph
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", ogImage);
    setMeta("property", "og:image:alt", ogImageAlt || DEFAULT_OG_IMAGE_ALT || title);
    setMeta("property", "og:image:width", "1200");
    setMeta("property", "og:image:height", "630");
    setMeta("property", "og:image:type", ogImage.endsWith(".png") ? "image/png" : "image/jpeg");
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:locale", localeToOgLocale(locale));
    document.querySelectorAll('meta[property="og:locale:alternate"]').forEach((el) => el.remove());
    SUPPORTED_LOCALES.filter((value) => value !== locale).forEach((value) => {
      const el = document.createElement("meta");
      el.setAttribute("property", "og:locale:alternate");
      el.setAttribute("content", localeToOgLocale(value));
      document.head.appendChild(el);
    });
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
    setMeta("name", "twitter:image:alt", ogImageAlt || DEFAULT_OG_IMAGE_ALT || title);
    setMeta("name", "twitter:label1", "Phone");
    setMeta("name", "twitter:data1", BUSINESS_PHONE);
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
    } else if (canonicalEl) {
      canonicalEl.remove();
    }

    // Hreflang tags
    document.querySelectorAll('link[hreflang]').forEach((el) => el.remove());
    if (canonical) {
      const alternateLinks = alternates && alternates.length > 0
        ? alternates
        : [{ hrefLang: localeToHtmlLang(locale), href: canonical }];
      alternateLinks.forEach(({ hrefLang, href }) => {
        const link = document.createElement("link");
        link.setAttribute("rel", "alternate");
        link.setAttribute("hreflang", hrefLang);
        link.setAttribute("href", href);
        document.head.appendChild(link);
      });
      const xDefault = document.createElement("link");
      xDefault.setAttribute("rel", "alternate");
      xDefault.setAttribute("hreflang", "x-default");
      xDefault.setAttribute("href", canonical);
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
      document.querySelectorAll('meta[property="og:locale:alternate"]').forEach((el) => el.remove());
      document.querySelectorAll('meta[property="article:tag"]').forEach(el => el.remove());
      articleProps.forEach(prop => removeMeta("property", prop));
      removeMeta("name", "keywords");
    };
  }, [title, description, canonical, ogImage, ogImageAlt, ogType, noIndex, jsonLd, locale, alternates, articleAuthor, articlePublishedTime, articleModifiedTime, articleSection, articleTags, keywords]);

  return null;
};

export default SEOHead;
