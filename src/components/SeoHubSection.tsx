import { ArrowRight, FileText, MapPinned } from "lucide-react";
import { Link } from "react-router-dom";
import { usePersonalization } from "@/hooks/usePersonalization";

type SeoHubSectionProps = {
  title?: string;
  description?: string;
};

const areaLinks = [
  { label: "Alicante Province", href: "/property-for-sale-alicante-province" },
  { label: "Benidorm", href: "/property-for-sale-benidorm" },
  { label: "Altea", href: "/property-for-sale-altea" },
  { label: "Finestrat", href: "/property-for-sale-finestrat" },
  { label: "Alicante City", href: "/property-for-sale-alicante-city" },
  { label: "Orihuela Costa", href: "/property-for-sale-orihuela-costa" },
  { label: "Torrevieja", href: "/property-for-sale-torrevieja" },
  { label: "Playa de San Juan", href: "/property-for-sale-playa-de-san-juan" },
];

const featuredInventoryLinks = [
  {
    label: "Alicante Province",
    href: "/property-for-sale-alicante-province",
    note: "Best umbrella page for the full live feed across the province.",
  },
  {
    label: "Torrevieja",
    href: "/property-for-sale-torrevieja",
    note: "One of the strongest live-stock municipalities in the current feed.",
  },
  {
    label: "Pilar de la Horadada",
    href: "/property-for-sale-pilar-de-la-horadada",
    note: "Strong current coverage for south Alicante buyers comparing practical coastal ownership.",
  },
  {
    label: "Rojales and Ciudad Quesada",
    href: "/property-for-sale-ciudad-quesada-rojales",
    note: "Residential south Alicante cluster with some of the clearest live inventory support.",
  },
];

const guideLinks = [
  { label: "Best Areas to Buy in Alicante Province", href: "/best-areas-to-buy-property-in-alicante-province" },
  { label: "How to Buy Property in Alicante as a Foreigner", href: "/guides/how-to-buy-property-in-alicante-as-a-foreigner" },
  { label: "Mortgage in Spain for Non-Residents", href: "/guides/mortgage-in-spain-for-non-residents" },
  { label: "Legal Process for Buying Property in Spain", href: "/guides/legal-process-for-buying-property-in-spain" },
];

const areaPriority: Record<string, string> = {
  "property-for-sale-alicante-province": "/property-for-sale-alicante-province",
  "property-for-sale-benidorm": "/property-for-sale-benidorm",
  "property-for-sale-finestrat": "/property-for-sale-finestrat",
  "property-for-sale-alicante-city": "/property-for-sale-alicante-city",
  "property-for-sale-orihuela-costa": "/property-for-sale-orihuela-costa",
  "property-for-sale-torrevieja": "/property-for-sale-torrevieja",
  "property-for-sale-pilar-de-la-horadada": "/property-for-sale-pilar-de-la-horadada",
  "property-for-sale-ciudad-quesada-rojales": "/property-for-sale-ciudad-quesada-rojales",
};

const topicPriority: Record<string, string> = {
  mortgage: "/guides/mortgage-in-spain-for-non-residents",
  legal: "/guides/legal-process-for-buying-property-in-spain",
  areas: "/best-areas-to-buy-property-in-alicante-province",
};

const SeoHubSection = ({
  title = "Use the right route, then open real properties",
  description = "Start from the strongest property routes, use the guides only when they help you decide faster, and move into full property pages once the shortlist starts taking shape.",
}: SeoHubSectionProps) => {
  const { hasSignal, profile, suggestions, intentStage, intentScore } = usePersonalization();
  const topAreaSlug = profile.lastAreaSlug || Object.entries(profile.areaCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topTopic = Object.entries(profile.topicCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const personalizedTitle = hasSignal
    ? intentStage === "late"
      ? "This buyer already looks close to real shortlist mode"
      : "Resume the routes that best match this buyer"
    : title;
  const personalizedDescription = hasSignal
    ? intentStage === "late"
      ? "There is enough intent here to stop treating the session like generic discovery. Use these routes to get back into strong fichas and concrete homes faster."
      : "We can already see signals from the areas, guides and properties this visitor has explored. Use that context to continue with the most relevant next routes instead of resetting the search."
    : description;
  const primaryCards = hasSignal
    ? suggestions.map((item) => ({
        label: item.title,
        href: item.href,
        note: item.description,
      }))
    : featuredInventoryLinks;
  const orderedAreaLinks = [...areaLinks].sort((a, b) => {
    const preferredHref = topAreaSlug ? areaPriority[topAreaSlug] : undefined;
    if (a.href === preferredHref) return -1;
    if (b.href === preferredHref) return 1;
    return 0;
  });
  const orderedGuideLinks = [...guideLinks].sort((a, b) => {
    const preferredHref = topTopic ? topicPriority[topTopic] : undefined;
    if (a.href === preferredHref) return -1;
    if (b.href === preferredHref) return 1;
    return 0;
  });

  return (
    <section className="py-16 border-y border-border/35 bg-card/25">
      <div className="container">
        <div className="max-w-3xl mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Property routes</p>
          {hasSignal ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                {intentStage === "late" ? "High intent" : intentStage === "mid" ? "Shortlist building" : "Early direction"}
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Intent score {intentScore}/100
              </span>
            </div>
          ) : null}
          <h2 className="mt-3 font-serif text-3xl md:text-4xl font-semibold">{personalizedTitle}</h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">{personalizedDescription}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[28px] border border-primary/20 bg-[linear-gradient(180deg,rgba(255,248,235,0.95),rgba(255,255,255,0.92))] p-7 lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MapPinned className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-semibold">
                  {hasSignal ? "Most relevant next steps for this visitor" : "Best live-inventory routes right now"}
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {hasSignal
                    ? "These routes use known intent to move the visitor back into the right fichas faster."
                    : "These are the strongest routes when the goal is to reach real properties faster and move into full fichas with better current feed support."}
                </p>
              </div>
            </div>
            <div className="grid gap-4 xl:grid-cols-4">
              {primaryCards.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="rounded-[24px] border border-border/35 bg-background px-5 py-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:text-primary"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-base font-semibold">{link.label}</span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{link.note}</p>
                  <p className="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-primary/80">
                    Open route, then open fichas
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-border/40 bg-background p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MapPinned className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-2xl font-semibold">Property area routes</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {orderedAreaLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="flex items-center justify-between rounded-2xl border border-border/35 px-4 py-4 text-sm font-medium transition-colors hover:border-primary/30 hover:text-primary"
                >
                  <span>{link.label}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              Use these pages to land on the right area faster, then move into the property cards and full fichas instead of staying in comparison mode for too long.
            </p>
          </div>

          <div className="rounded-[28px] border border-border/40 bg-background p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-2xl font-semibold">Buyer guides that support the shortlist</h3>
            </div>
            <div className="grid gap-3">
              {orderedGuideLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="flex items-center justify-between rounded-2xl border border-border/35 px-4 py-4 text-sm font-medium transition-colors hover:border-primary/30 hover:text-primary"
                >
                  <span>{link.label}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              Read only what helps you shortlist better. The commercial goal is still the same: open real property pages and enquire on concrete homes with confidence.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SeoHubSection;
