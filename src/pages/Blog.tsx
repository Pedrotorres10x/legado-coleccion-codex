import { Link, useSearchParams } from "react-router-dom";
import { Calendar, ArrowRight, Loader2, BookOpen } from "lucide-react";
import NewsletterSignup from "@/components/NewsletterSignup";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useBlogPosts, useBlogCategories } from "@/hooks/useBlog";
import { buildBreadcrumbSchema, buildBlogListingSchema, buildWebPageSchema } from "@/lib/seo-schemas";
import { useTranslation } from "@/contexts/LanguageContext";
import { SITE_URL } from "@/lib/site";

const DATE_LOCALES: Record<string, string> = {
  es: "es-ES", en: "en-GB", fr: "fr-FR", de: "de-DE",
};

const Blog = () => {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get("categoria") || undefined;
  const { data: posts, isLoading } = useBlogPosts(categorySlug);
  const { data: categories } = useBlogCategories();
  const { t, language } = useTranslation();

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(DATE_LOCALES[language] || "es-ES", { year: "numeric", month: "long", day: "numeric" });

  const breadcrumbJsonLd = buildBreadcrumbSchema([
    { name: "Inicio", url: SITE_URL },
    { name: "Blog", url: `${SITE_URL}/blog` },
  ]);

  const itemListJsonLd = posts ? buildBlogListingSchema(posts) : null;
  const blogPageSchema = buildWebPageSchema({
    name: "Blog Inmobiliario | Legado Inmobiliaria",
    description:
      "Articulos, guias y analisis para comprar propiedad en Costa Blanca con mejor criterio financiero, legal y de ubicacion.",
    path: "/blog",
    type: "CollectionPage",
    breadcrumb: breadcrumbJsonLd,
  });

  const featured = posts?.[0];
  const rest = posts?.slice(1);

  return (
    <main className="min-h-screen bg-background">
      <SEOHead
        title="Blog Inmobiliario | Legado Inmobiliaria — Guías y Consejos Costa Blanca"
        description="Artículos expertos sobre compraventa de propiedades en la Costa Blanca. Guías para compradores, tendencias del mercado, aspectos legales y fiscales."
        canonical={`${SITE_URL}/blog`}
        keywords="blog inmobiliario Costa Blanca, comprar propiedad España, guía compradores extranjeros, mercado inmobiliario Benidorm, inversión inmobiliaria Alicante"
        jsonLd={[breadcrumbJsonLd, blogPageSchema, ...(itemListJsonLd ? [itemListJsonLd] : [])]}
      />
      <Navbar />

      {/* Hero */}
      <section className="pt-28 sm:pt-32 pb-16 sm:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container relative">
          <div className="text-center mb-12 sm:mb-16 enter-fade-up">
            <div className="inline-flex max-w-full items-center gap-2 mb-6">
              <div className="hidden sm:block h-px w-12 bg-gradient-to-r from-transparent to-primary" />
              <span className="text-primary font-medium tracking-[0.18em] sm:tracking-[0.3em] uppercase text-[10px] sm:text-xs">
                {t("blog.tag")}
              </span>
              <div className="hidden sm:block h-px w-12 bg-gradient-to-l from-transparent to-primary" />
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-[1.1] break-words">
              Buyer <span className="text-gradient-gold italic">Guidance</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
              {t("blog.desc")}
            </p>
            <p className="mt-4 text-muted-foreground/90 max-w-2xl mx-auto text-sm leading-7">
              El objetivo no es que te quedes leyendo. Usa estas guías para entender mejor el mercado y luego pasa a fichas reales de propiedades.
            </p>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-12 sm:mb-16 enter-fade-in" style={{ animationDelay: "300ms" }}>
            <Link to="/blog">
              <button
                className={`text-[11px] sm:text-xs font-semibold tracking-[0.12em] sm:tracking-[0.15em] uppercase px-4 sm:px-5 py-2.5 rounded-full transition-all duration-300 ${
                  !categorySlug
                    ? "bg-gradient-gold text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground border border-border/50 hover:border-primary/30"
                }`}
              >
                {t("blog.all")}
              </button>
            </Link>
            {categories?.map((cat) => (
              <Link key={cat.id} to={`/blog?categoria=${cat.slug}`}>
                <button
                  className={`text-[11px] sm:text-xs font-semibold tracking-[0.12em] sm:tracking-[0.15em] uppercase px-4 sm:px-5 py-2.5 rounded-full transition-all duration-300 ${
                    categorySlug === cat.slug
                      ? "bg-gradient-gold text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground border border-border/50 hover:border-primary/30"
                  }`}
                >
                  {cat.name}
                </button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24">
        <div className="container">
          {isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : posts && posts.length > 0 ? (
            <>
              {/* Featured hero article */}
              {featured && (
                <div className="mb-20 reveal-up">
                  <Link to={`/blog/${featured.slug}`} className="group block">
                    <div className="grid lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-border/30 hover:border-primary/20 transition-all duration-500">
                      <div className="relative aspect-[4/3] lg:aspect-auto overflow-hidden">
                        {featured.cover_image ? (
                          <img src={featured.cover_image} alt={featured.title} fetchPriority="high" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full min-h-[400px] bg-gradient-to-br from-[hsl(var(--primary)/0.15)] via-[hsl(var(--secondary))] to-[hsl(var(--primary)/0.08)] flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(circle at 30% 50%, hsl(var(--primary)) 0%, transparent 60%), radial-gradient(circle at 80% 20%, hsl(var(--primary)/0.5) 0%, transparent 50%)"}} />
                            <BookOpen className="w-16 h-16 text-primary/30 relative z-10" />
                            {featured.category && (
                              <span className="text-primary/50 text-[10px] sm:text-xs font-bold tracking-[0.18em] sm:tracking-[0.3em] uppercase relative z-10 text-center px-4">{featured.category.name}</span>
                            )}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent lg:bg-none" />
                      </div>
                      <div className="bg-card/80 backdrop-blur-sm p-6 sm:p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6">
                          {featured.category && (
                            <span className="text-primary text-xs font-bold tracking-[0.2em] uppercase">{featured.category.name}</span>
                          )}
                          <span className="hidden sm:inline text-border">—</span>
                          <span className="text-muted-foreground text-xs tracking-wider">
                            {featured.published_at ? formatDate(featured.published_at) : formatDate(featured.created_at)}
                          </span>
                        </div>
                        <h2 className="font-serif text-2xl md:text-4xl font-bold text-foreground mb-5 leading-tight group-hover:text-primary transition-colors duration-300">
                          {featured.title}
                        </h2>
                        {featured.excerpt && (
                          <p className="text-muted-foreground leading-relaxed mb-8 text-base line-clamp-3">{featured.excerpt}</p>
                        )}
                        <p className="mb-6 text-sm leading-7 text-muted-foreground">
                          Lée este artículo para orientarte mejor y luego vuelve a las propiedades para abrir fichas concretas con más criterio.
                        </p>
                        <div className="flex items-center gap-2 text-primary font-semibold text-sm tracking-wider uppercase group-hover:gap-4 transition-all duration-300">
                          {t("blog.readArticle")} <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* Article grid */}
              {rest && rest.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 lg:gap-x-8 gap-y-10 sm:gap-y-14">
                  {rest.map((post, i) => (
                    <article key={post.id} className="reveal-up" style={{ animationDelay: `${i * 60}ms` }}>
                      <Link to={`/blog/${post.slug}`} className="group block">
                        <div className="relative overflow-hidden rounded-xl aspect-[16/10] mb-5">
                          {post.cover_image ? (
                            <img src={post.cover_image} alt={post.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--primary)/0.12)] via-[hsl(var(--secondary))] to-[hsl(var(--primary)/0.06)] flex flex-col items-center justify-center gap-3 relative overflow-hidden">
                              <div className="absolute inset-0 opacity-[0.07]" style={{backgroundImage: "radial-gradient(circle at 40% 40%, hsl(var(--primary)) 0%, transparent 65%)"}} />
                              <BookOpen className="w-8 h-8 text-primary/25 relative z-10 group-hover:text-primary/40 transition-colors duration-300" />
                              {post.category && (
                                <span className="text-primary/35 text-[10px] font-bold tracking-[0.25em] uppercase relative z-10">{post.category.name}</span>
                              )}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                          {post.category && (
                            <span className="text-primary text-[11px] font-bold tracking-[0.2em] uppercase">{post.category.name}</span>
                          )}
                          <span className="text-border text-xs">·</span>
                          <span className="text-muted-foreground text-[11px] tracking-wider flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}
                          </span>
                        </div>
                        <h3 className="font-serif text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 mb-3 leading-snug line-clamp-2">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
                        )}
                        <span className="inline-flex items-center gap-1.5 text-primary/80 group-hover:text-primary text-xs font-semibold tracking-[0.15em] uppercase group-hover:gap-3 transition-all duration-300">
                          {t("blog.readMore")} <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </Link>
                    </article>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-24">
              <BookOpen className="w-16 h-16 text-primary/20 mx-auto mb-6" />
              <p className="text-muted-foreground text-lg font-serif mb-2">{t("blog.comingSoon")}</p>
              <p className="text-muted-foreground/60 text-sm">{t("blog.comingDesc")}</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSignup source="blog-listing" />

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
        <div className="container relative text-center">
          <div className="h-px w-16 bg-gradient-gold mx-auto mb-8" />
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-5">
            {t("blog.ctaTitle1")} <span className="text-gradient-gold italic">{t("blog.ctaTitle2")}</span>?
          </h2>
          <p className="text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
            {t("blog.ctaDesc")} El siguiente paso útil es abrir viviendas concretas y revisar sus fichas completas.
          </p>
          <Link to="/propiedades" className="inline-block w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-gradient-gold text-primary-foreground font-semibold px-6 sm:px-10 tracking-wide">
              Abrir fichas de propiedades
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Blog;
