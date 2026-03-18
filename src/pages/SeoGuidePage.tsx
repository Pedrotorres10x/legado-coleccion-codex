import { useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowRight, BadgeEuro, CheckCircle2, FileText, Globe2, Map, Scale, SearchCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import SeoQuickNav from "@/components/SeoQuickNav";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/site";
import { buildBreadcrumbSchema } from "@/lib/seo-schemas";
import { seoGuidePages } from "@/lib/seoGuidePages";
import { recordGuideIntent } from "@/lib/personalization";

const icons = [Map, SearchCheck, BadgeEuro, Scale];

const guideTopics: Record<string, string[]> = {
  "best-areas-to-buy-property-in-alicante-province": ["areas"],
  "guides/how-to-buy-property-in-alicante-as-a-foreigner": ["areas", "legal"],
  "guides/mortgage-in-spain-for-non-residents": ["mortgage"],
  "guides/legal-process-for-buying-property-in-spain": ["legal"],
};

function buildFaqSchema(faq: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

type SeoGuidePageProps = {
  slug: string;
};

const SeoGuidePage = ({ slug }: SeoGuidePageProps) => {
  const guide = seoGuidePages[slug];

  useEffect(() => {
    if (!guide) return;
    recordGuideIntent({
      slug: guide.slug,
      topics: guideTopics[guide.slug] || [],
    });
  }, [guide]);

  if (!guide) {
    return <Navigate to="/" replace />;
  }

  const breadcrumb = buildBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: guide.h1, url: `${SITE_URL}/${guide.slug}` },
  ]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SEOHead
        title={guide.seoTitle}
        description={guide.seoDescription}
        canonical={`${SITE_URL}/${guide.slug}`}
        jsonLd={[breadcrumb, buildFaqSchema(guide.faq)]}
      />
      <Navbar />

      <section className="relative overflow-hidden border-b border-border/30 bg-[radial-gradient(circle_at_top_left,_rgba(245,208,145,0.16),_transparent_35%),linear-gradient(180deg,rgba(23,23,23,0.98),rgba(23,23,23,0.92))] pt-32 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_45%,rgba(255,255,255,0.02))]" />
        <div className="container relative z-10 pb-24">
          <div className="max-w-4xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
              <Globe2 className="h-4 w-4 text-primary" />
              {guide.eyebrow}
            </p>
            <h1 className="font-serif text-4xl font-bold leading-tight md:text-6xl">{guide.h1}</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/76 md:text-lg">{guide.intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-gradient-gold text-primary-foreground hover:opacity-90">
                <Link to="/propiedades">{guide.ctaPrimary}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/property-for-sale-alicante-province">{guide.ctaSecondary}</Link>
              </Button>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68">
              The guide is here to help you choose better. The next step is to open real property pages and enquire only on the homes that genuinely fit.
            </p>
          </div>
        </div>
      </section>

      <SeoQuickNav
        links={[
          { label: "Alicante Province", href: "/property-for-sale-alicante-province" },
          { label: "Benidorm", href: "/property-for-sale-benidorm" },
          { label: "Altea", href: "/property-for-sale-altea" },
          { label: "Orihuela Costa", href: "/property-for-sale-orihuela-costa" },
          ...guide.relatedLinks.slice(0, 2).map((link) => ({ label: link.label, href: link.href })),
        ].filter((link, index, self) => self.findIndex((item) => item.href === link.href) === index)}
      />

      <section className="py-16">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {guide.callouts.map((callout, index) => {
              const Icon = icons[index % icons.length];
              return (
                <div key={callout.title} className="rounded-[28px] border border-border/40 bg-card/70 p-7 shadow-sm">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="font-serif text-2xl font-semibold">{callout.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{callout.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-border/35 bg-card/25 py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl space-y-12">
            {guide.sections.map((section) => (
              <article key={section.title} className="rounded-[32px] border border-border/35 bg-background px-7 py-8 md:px-10">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h2 className="font-serif text-3xl font-semibold">{section.title}</h2>
                </div>
                <div className="space-y-5 text-base leading-8 text-muted-foreground">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[30px] border border-border/40 bg-card p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                Next property routes
              </p>
              <h2 className="mt-3 font-serif text-3xl font-semibold">Use the guide, then move into real property searches</h2>
              <div className="mt-6 flex flex-col gap-4">
                {guide.relatedLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="flex items-center justify-between rounded-2xl border border-border/40 bg-background px-4 py-4 text-sm font-medium transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-border/40 bg-card p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                FAQ
              </p>
              <h2 className="mt-3 font-serif text-3xl font-semibold">What buyers usually want clarified first</h2>
              <div className="mt-6 space-y-5">
                {guide.faq.map((item) => (
                  <div key={item.question} className="rounded-2xl border border-border/35 bg-background px-5 py-5">
                    <h3 className="text-base font-semibold">{item.question}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container">
          <div className="rounded-[36px] border border-border/40 bg-[linear-gradient(135deg,rgba(17,17,17,0.98),rgba(32,32,32,0.95))] px-8 py-12 text-white md:px-12">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              360 buyer support
            </p>
            <h2 className="mt-3 max-w-3xl font-serif text-3xl font-semibold md:text-5xl">
              Turn the guide into a real shortlist with the right financial and legal structure behind it
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/72">
              The goal is not only to understand the Alicante property market. It is to buy the right property with area fit, mortgage strategy and legal coordination working together from the beginning.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-gradient-gold text-primary-foreground hover:opacity-90">
                <Link to="/propiedades">{guide.ctaPrimary}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/property-for-sale-alicante-province">{guide.ctaSecondary}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default SeoGuidePage;
