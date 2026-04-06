import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { trackViewBlogPost, setupScrollTracking, setupTimeOnPage } from "@/lib/metaPixel";
import { Calendar, ArrowLeft, User, ArrowRight, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlogPost } from "@/hooks/useBlog";
import { supabase } from "@/integrations/supabase/client";
import { buildBreadcrumbSchema, buildBlogPostingSchema, buildWebPageSchema, extractFaqSchema } from "@/lib/seo-schemas";
import { useTranslation } from "@/contexts/LanguageContext";
import NewsletterSignup from "@/components/NewsletterSignup";
import TableOfContents, { processArticleContent } from "@/components/TableOfContents";
import { SITE_URL } from "@/lib/site";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

const DATE_LOCALES: Record<string, string> = {
  es: "es-ES", en: "en-GB", fr: "fr-FR", de: "de-DE",
};

const estimateReadTime = (html: string) => {
  const text = html.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).length;
  return Math.max(3, Math.ceil(words / 220));
};

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = useBlogPost(slug || "");
  const { t, language } = useTranslation();

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(DATE_LOCALES[language] || "es-ES", { year: "numeric", month: "long", day: "numeric" });

  // ── All hooks BEFORE early returns ────────────────────────────────────────

  // Process HTML: inject heading IDs, extract TOC headings, detect FAQ pairs
  const { processedHtml, headings } = useMemo(
    () => (post ? processArticleContent(post.content) : { processedHtml: "", headings: [] }),
    [post]
  );

  const faqJsonLd = useMemo(
    () => (post ? extractFaqSchema(post.content) : null),
    [post]
  );

  const hasToc = headings.length >= 2;
  const safeProcessedHtml = useMemo(() => sanitizeHtml(processedHtml), [processedHtml]);

  // Track view + pixel
  useEffect(() => {
    if (slug) {
      supabase.rpc("increment_blog_views", { post_slug: slug }).then(() => {});
    }
  }, [slug]);

  useEffect(() => {
    if (post) {
      trackViewBlogPost({
        content_name: post.title,
        content_ids: [post.id],
        category: post.category?.name,
      });
    }
  }, [post]);

  useEffect(() => {
    const cleanupScroll = setupScrollTracking();
    const cleanupTime = setupTimeOnPage(30);
    return () => {
      cleanupScroll?.();
      cleanupTime?.();
    };
  }, []);

  // ── Early returns ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-24">
          <Skeleton className="w-full h-[500px] mb-12" />
          <div className="container max-w-3xl">
            <Skeleton className="w-1/4 h-4 mb-6" />
            <Skeleton className="w-3/4 h-12 mb-4" />
            <Skeleton className="w-1/2 h-6 mb-12" />
            <Skeleton className="w-full h-64" />
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-24 container text-center">
          <BookOpen className="w-16 h-16 text-primary/20 mx-auto mb-6" />
          <h1 className="font-serif text-3xl font-bold mb-4">{t("blog.notFound")}</h1>
          <Link to="/blog">
            <Button className="bg-gradient-gold text-primary-foreground">{t("blog.backToJournal")}</Button>
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  // ── SEO data ──────────────────────────────────────────────────────────────

  const seoTitle = post.meta_title || `${post.title} | Blog Legado Inmobiliaria`;
  const seoDesc = post.meta_description || post.excerpt || post.content.replace(/<[^>]*>/g, "").slice(0, 155);
  const readTime = estimateReadTime(post.content);
  const pubDate = post.published_at || post.created_at;

  const seoKeywords = [
    post.category?.name,
    "Costa Blanca",
    "Benidorm",
    "inmobiliaria",
    "propiedad",
  ].filter(Boolean).join(", ");

  const articleTags = [
    post.category?.name,
    "Costa Blanca",
    "inmobiliaria lujo",
    "Benidorm",
    "comprar propiedad España",
  ].filter(Boolean) as string[];

  const blogPostingJsonLd = buildBlogPostingSchema({
    ...post,
    category: post.category ?? null,
  });

  const breadcrumbJsonLd = buildBreadcrumbSchema([
    { name: "Inicio", url: SITE_URL },
    { name: "Blog", url: `${SITE_URL}/blog` },
    { name: post.title, url: `${SITE_URL}/blog/${post.slug}` },
  ]);
  const articlePageSchema = buildWebPageSchema({
    name: seoTitle,
    description: seoDesc,
    path: `/blog/${post.slug}`,
    breadcrumb: breadcrumbJsonLd,
    image: post.cover_image || undefined,
    inLanguage: language === "en" ? "en" : language === "fr" ? "fr" : language === "de" ? "de" : "es",
  });

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-background">
      <SEOHead
        title={seoTitle}
        description={seoDesc}
        canonical={`${SITE_URL}/blog/${post.slug}`}
        ogImage={post.cover_image || undefined}
        ogType="article"
        keywords={seoKeywords}
        articleAuthor={post.author_name}
        articlePublishedTime={pubDate}
        articleModifiedTime={post.updated_at}
        articleSection={post.category?.name}
        articleTags={articleTags}
        jsonLd={[blogPostingJsonLd, breadcrumbJsonLd, articlePageSchema, ...(faqJsonLd ? [faqJsonLd] : [])]}
      />
      <Navbar />

      {/* Full-width cover image */}
      <div className="relative w-full h-[50vh] md:h-[65vh] overflow-hidden enter-fade-in">
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={post.title}
            fetchPriority="high"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-card via-secondary to-card flex items-center justify-center">
            <BookOpen className="w-24 h-24 text-primary/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        <div className="absolute top-24 left-0 w-full">
          <div className="container">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm backdrop-blur-sm bg-black/20 rounded-full px-4 py-2"
            >
              <ArrowLeft className="w-4 h-4" /> {t("blog.backToJournal")}
            </Link>
          </div>
        </div>
      </div>

      {/* Article body */}
      <article className="relative -mt-32 md:-mt-40 pb-16">
        <div className="container">
          {/* Two-column layout: content + TOC sidebar */}
          <div className={`${hasToc ? "xl:flex xl:gap-14 xl:items-start" : ""} max-w-5xl mx-auto`}>

            {/* Main content column */}
            <div className="flex-1 min-w-0 max-w-3xl">
              <header className="mb-12 enter-fade-up" style={{ animationDelay: "200ms" }}>
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  {post.category && (
                    <Link
                      to={`/blog?categoria=${post.category.slug}`}
                      className="bg-gradient-gold text-primary-foreground text-[11px] font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity"
                    >
                      {post.category.name}
                    </Link>
                  )}
                </div>

                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-[1.1]">
                  {post.title}
                </h1>

                {post.excerpt && (
                  <p className="article-excerpt text-lg text-muted-foreground leading-relaxed mb-6 font-serif italic border-l-2 border-primary/30 pl-4">
                    {post.excerpt}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-5 text-muted-foreground text-sm pb-8 border-b border-border/50">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary/60" /> {post.author_name}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary/60" />
                    {post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary/60" />
                    {readTime} {t("blog.minRead")}
                  </span>
                </div>
              </header>

              {/* Mobile TOC — collapsible, only on small screens */}
              {hasToc && <TableOfContents headings={headings} mobile />}

              {/* Article content */}
              <div
                className="prose prose-invert prose-lg max-w-none enter-fade-in
                  prose-headings:font-serif prose-headings:text-foreground prose-headings:leading-tight
                  prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-14 prose-h2:mb-6
                  prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-4
                  prose-p:text-muted-foreground prose-p:leading-[1.9] prose-p:text-base prose-p:md:text-lg
                  prose-a:text-primary prose-a:no-underline prose-a:font-semibold hover:prose-a:underline
                  prose-strong:text-foreground prose-strong:font-semibold
                  prose-li:text-muted-foreground prose-li:leading-[1.8]
                  prose-blockquote:border-l-primary prose-blockquote:border-l-2 prose-blockquote:text-foreground/80 prose-blockquote:font-serif prose-blockquote:text-xl prose-blockquote:italic prose-blockquote:pl-6
                  prose-img:rounded-xl prose-img:my-10
                  mb-16"
                style={{ animationDelay: "400ms" }}
                dangerouslySetInnerHTML={{ __html: safeProcessedHtml }}
              />

              {/* Newsletter banner */}
              <NewsletterSignup source="blog-article" variant="banner" className="mb-16" />

              {/* Elegant divider */}
              <div className="flex items-center gap-4 mb-16">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
                <div className="w-2 h-2 rotate-45 border border-primary/40" />
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
              </div>

              {/* CTA */}
              <div className="relative rounded-2xl overflow-hidden p-10 md:p-14 text-center reveal-up">
                <div className="absolute inset-0 bg-gradient-to-br from-card via-secondary/50 to-card border border-border/30 rounded-2xl" />
              <div className="relative">
                <div className="h-px w-12 bg-gradient-gold mx-auto mb-6" />
                <h3 className="font-serif text-2xl md:text-3xl font-bold mb-4 leading-tight">
                  {t("blog.articleCtaTitle1")}<br />
                  <span className="text-gradient-gold italic">{t("blog.articleCtaTitle2")}</span> {t("blog.articleCtaTitle3")}
                </h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm leading-relaxed">
                  {t("blog.articleCtaDesc")} Ahora intenta llevar esa idea a viviendas concretas y abre fichas reales antes de decidir tu siguiente paso.
                </p>
                <Link to="/propiedades">
                  <Button size="lg" className="bg-gradient-gold text-primary-foreground font-semibold px-10 tracking-wide">
                    Abrir fichas de propiedades <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            </div>

            {/* Desktop TOC sidebar */}
            {hasToc && <TableOfContents headings={headings} />}
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
};

export default BlogPostPage;
