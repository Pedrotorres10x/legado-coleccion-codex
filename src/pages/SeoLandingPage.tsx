import { useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeEuro,
  Building2,
  CheckCircle2,
  FileCheck,
  Globe2,
  Landmark,
  MapPinned,
  Scale,
  Search,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import SeoQuickNav from "@/components/SeoQuickNav";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SITE_URL } from "@/lib/site";
import { buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seo-schemas";
import { seoLandingPages } from "@/lib/seoLandingPages";
import { useExternalProperties } from "@/hooks/useExternalProperties";
import { recordAreaIntent } from "@/lib/personalization";

const processSteps = [
  {
    title: "Shortlist the right area",
    description:
      "We help narrow the search by intended use, budget, ownership style and the part of Alicante province that fits best.",
    icon: Search,
  },
  {
    title: "Compare real properties",
    description:
      "The live feed turns strategy into a real shortlist with current inventory instead of generic advice.",
    icon: Building2,
  },
  {
    title: "Review financing options",
    description:
      "Mortgage planning can still make sense even for cash-capable buyers who want to preserve liquidity and optionality.",
    icon: Landmark,
  },
  {
    title: "Coordinate legal checks",
    description:
      "Contracts, documentation, debts, licences and completion timing are reviewed as part of one connected process.",
    icon: Scale,
  },
  {
    title: "Complete with support",
    description:
      "Search, legal coordination and purchase management stay aligned through notary and post-completion steps.",
    icon: FileCheck,
  },
];

const defaultQuickLinks = [
  { label: "Alicante Province", href: "/property-for-sale-alicante-province" },
  { label: "Best Areas", href: "/best-areas-to-buy-property-in-alicante-province" },
  { label: "How to Buy", href: "/guides/how-to-buy-property-in-alicante-as-a-foreigner" },
  { label: "Mortgage Guide", href: "/guides/mortgage-in-spain-for-non-residents" },
  { label: "Legal Guide", href: "/guides/legal-process-for-buying-property-in-spain" },
];

const provinceClusters = [
  {
    title: "North Alicante / Marina Baixa",
    description:
      "Benidorm, Altea, Finestrat, Villajoyosa, La Nucia and Alfaz del Pi capture apartment demand, premium coastal searches and residential long-stay ownership.",
    links: [
      { label: "Benidorm", href: "/property-for-sale-benidorm" },
      { label: "Altea", href: "/property-for-sale-altea" },
      { label: "Finestrat", href: "/property-for-sale-finestrat" },
    ],
  },
  {
    title: "Alicante City Area",
    description:
      "Alicante city, Playa de San Juan, El Campello and Santa Pola suit buyers who want practical year-round use, city access and cleaner coastal livability.",
    links: [
      { label: "Alicante City", href: "/property-for-sale-alicante-city" },
      { label: "Playa de San Juan", href: "/property-for-sale-playa-de-san-juan" },
      { label: "Santa Pola", href: "/property-for-sale-santa-pola" },
    ],
  },
  {
    title: "Vega Baja / South",
    description:
      "Orihuela Costa, Torrevieja, Guardamar, Ciudad Quesada and nearby zones give buyers the province's strongest micro-area choice and comparison depth.",
    links: [
      { label: "Orihuela Costa", href: "/property-for-sale-orihuela-costa" },
      { label: "Torrevieja", href: "/property-for-sale-torrevieja" },
      { label: "Guardamar", href: "/property-for-sale-guardamar-del-segura" },
    ],
  },
];

const benidormMoneyLinks = [
  {
    title: "Apartments for Sale in Benidorm",
    description: "The clearest apartment-led commercial search for buyers already focused on Benidorm.",
    href: "/apartments-for-sale-benidorm",
  },
  {
    title: "Sea View Apartments in Benidorm",
    description: "A stronger feature-led page for buyers prioritising visual value and repeat-use appeal.",
    href: "/sea-view-apartments-benidorm",
  },
  {
    title: "Property Under 200k in Benidorm",
    description: "Budget-led search for practical buyers who need realism and smarter trade-offs.",
    href: "/property-under-200k-benidorm",
  },
];

const finestratProductCards = [
  {
    title: "Modern apartments",
    description:
      "Useful for buyers wanting lower-maintenance ownership, community amenities and a clean, contemporary residential environment.",
  },
  {
    title: "Contemporary villas",
    description:
      "Relevant for buyers who want outdoor space, stronger privacy and a more premium version of Finestrat's modern product.",
  },
  {
    title: "New-build strategy",
    description:
      "This search works best when development choice, payment stages, financing and legal review are all aligned before commitment.",
  },
];

const southClusterCards = [
  {
    title: "Torrevieja",
    description:
      "One of the strongest live-stock coastal routes in the current feed, especially for buyers who want broad comparison and practical ownership options.",
    href: "/property-for-sale-torrevieja",
  },
  {
    title: "Pilar de la Horadada",
    description:
      "A strong south Alicante route for buyers comparing apartments, townhouses and villas with good repeat-use appeal.",
    href: "/property-for-sale-pilar-de-la-horadada",
  },
  {
    title: "Rojales and Ciudad Quesada",
    description:
      "Residential stock with some of the clearest live support right now, especially for buyers who want more space and a calmer ownership model.",
    href: "/property-for-sale-ciudad-quesada-rojales",
  },
  {
    title: "Guardamar and San Miguel",
    description:
      "Useful supporting routes when the shortlist is moving toward calmer coastal living or more residential south Alicante alternatives.",
    href: "/property-for-sale-guardamar-del-segura",
  },
];

const southClusterSlugs = new Set([
  "property-for-sale-torrevieja",
  "property-for-sale-pilar-de-la-horadada",
  "property-for-sale-rojales",
  "property-for-sale-ciudad-quesada-rojales",
  "property-for-sale-guardamar-del-segura",
  "property-for-sale-san-miguel-de-salinas",
  "property-for-sale-orihuela-costa",
]);

const buyerIntentSections: Record<
  string,
  {
    eyebrow: string;
    title: string;
    description: string;
    cards: { title: string; description: string }[];
  }
> = {
  "property-for-sale-torrevieja": {
    eyebrow: "What to open first",
    title: "Start with the fichas that usually clarify Torrevieja fastest",
    description:
      "Torrevieja is broad enough to create noise. The best route is to open concrete property pages in the formats that usually reveal fit, budget realism and repeat-use practicality first.",
    cards: [
      {
        title: "Apartment fichas first",
        description:
          "Torrevieja is highly apartment-led, so opening those property pages first usually gives the clearest read on value, layout and usability.",
      },
      {
        title: "Budget realism second",
        description:
          "Use the ficha to compare terrace, building standard, distance and maintenance trade-offs instead of judging by asking price alone.",
      },
      {
        title: "Then shortlist for enquiry",
        description:
          "Once two or three homes survive that comparison, the form becomes the natural next step instead of a speculative enquiry.",
      },
    ],
  },
  "property-for-sale-pilar-de-la-horadada": {
    eyebrow: "What to open first",
    title: "Use Pilar de la Horadada to compare practical homes, not just area names",
    description:
      "This route works best when buyers move quickly from zone-level interest into real fichas across townhouses, apartments and villas, then see what actually fits their use case.",
    cards: [
      {
        title: "Townhouse and villa fichas",
        description:
          "These usually show the area's practical ownership model better than staying in broad comparison pages for too long.",
      },
      {
        title: "Check repeated-use suitability",
        description:
          "Open the full details to judge outdoor space, layout and day-to-day practicality for second-home or longer-stay ownership.",
      },
      {
        title: "Enquire only when the fit is clear",
        description:
          "The right moment to send the form is after one property clearly stands out, not before.",
      },
    ],
  },
  "property-for-sale-ciudad-quesada-rojales": {
    eyebrow: "What to open first",
    title: "Residential searches need ficha-level comparison even more",
    description:
      "Ciudad Quesada and the wider Rojales cluster are less about casual browsing and more about finding the right residential home format, space profile and ownership model.",
    cards: [
      {
        title: "Villa and house fichas first",
        description:
          "These pages reveal privacy, outdoor space, layout and day-to-day livability far better than an area overview ever can.",
      },
      {
        title: "Compare long-stay fit",
        description:
          "Focus on the homes that could genuinely work for relocation, retirement or repeated medium stays rather than generic “Costa Blanca” appeal.",
      },
      {
        title: "Use the form for real next steps",
        description:
          "Once a specific home feels right, use the form to move toward visit planning, financial clarity or a purchase conversation.",
      },
    ],
  },
  "property-for-sale-rojales": {
    eyebrow: "What to open first",
    title: "Rojales works best when the shortlist becomes concrete quickly",
    description:
      "This is a residential route, so the best signal comes from opening the right fichas and comparing houses, villas and practical ownership formats directly.",
    cards: [
      {
        title: "Open residential homes first",
        description:
          "Rojales tends to make the most sense at ficha level, where space, outdoor use and practical everyday fit become visible.",
      },
      {
        title: "Judge livability, not just location",
        description:
          "The right home here is usually defined by day-to-day comfort and long-stay suitability, not by a flashy micro-area label.",
      },
      {
        title: "Enquire on the strongest fit",
        description:
          "When one property clearly fits your residential goals, the form becomes the right next move.",
      },
    ],
  },
  "property-for-sale-guardamar-del-segura": {
    eyebrow: "What to open first",
    title: "Guardamar becomes clearer when you compare calmer coastal fichas directly",
    description:
      "This route usually works best for buyers who stop comparing labels and start opening concrete apartment or residential fichas to judge comfort and coastal fit.",
    cards: [
      {
        title: "Coastal apartment fichas",
        description:
          "These usually show best whether Guardamar delivers the calmer ownership model the buyer is actually looking for.",
      },
      {
        title: "Check long-stay usability",
        description:
          "Use the ficha to assess terrace use, building quality and whether the home works beyond short holiday periods.",
      },
      {
        title: "Then compare one or two alternatives",
        description:
          "A small shortlist is enough. From there, the enquiry should happen on the home that feels most usable, not the area that sounds nicest.",
      },
    ],
  },
  "property-for-sale-san-miguel-de-salinas": {
    eyebrow: "What to open first",
    title: "This is a space-and-practicality search, so ficha detail matters early",
    description:
      "San Miguel de Salinas usually appeals once buyers move into real homes and compare how much space, privacy and residential comfort they are actually getting.",
    cards: [
      {
        title: "Townhouse and villa fichas",
        description:
          "These usually expose the real trade-off between inland calm, space and access to the wider south Alicante lifestyle.",
      },
      {
        title: "Look for real base potential",
        description:
          "The strongest homes here are the ones that could work as a true base in Spain, not just as a short-stay property.",
      },
      {
        title: "Use the form once the use case fits",
        description:
          "If a property clearly supports your retirement, relocation or long-stay plan, that is the moment to enquire.",
      },
    ],
  },
  "property-for-sale-orihuela-costa": {
    eyebrow: "What to open first",
    title: "Orihuela Costa is easier once you move from area search into concrete fichas",
    description:
      "This market is fragmented enough that buyers can lose time in micro-area comparison. The faster route is to open real homes, then let the right property narrow the area for you.",
    cards: [
      {
        title: "Open apartment and townhouse fichas",
        description:
          "Those often give the clearest entry into Orihuela Costa ownership and make the differences between micro-areas easier to feel.",
      },
      {
        title: "Use micro-areas only to refine",
        description:
          "Villamartín, La Zenia, Cabo Roig and Campoamor help when needed, but they should support the shortlist, not replace it.",
      },
      {
        title: "Convert on the right property",
        description:
          "When one ficha stands out on layout, location and price logic, the form should follow naturally from there.",
      },
    ],
  },
  "property-for-sale-alicante-province": {
    eyebrow: "What to open first",
    title: "Use the province page to reach the right fichas faster",
    description:
      "Alicante province is broad enough to create endless comparison. The smart move is to use this page to choose the right cluster quickly, then open real homes inside that route instead of staying at province level for too long.",
    cards: [
      {
        title: "Choose the right cluster first",
        description:
          "North, city belt and south Alicante each behave differently. Once one cluster feels closer to your goals, move down into live property pages there.",
      },
      {
        title: "Open fichas, not only area pages",
        description:
          "Area routes help structure the search, but the real decision starts when you compare layouts, prices, photos and details inside specific homes.",
      },
      {
        title: "Then convert on the best-fit home",
        description:
          "When one property clearly fits better than the rest, use its own form as the natural next step instead of continuing to browse the whole province.",
      },
    ],
  },
  "property-for-sale-benidorm": {
    eyebrow: "What to open first",
    title: "Benidorm works best when you move into apartment fichas quickly",
    description:
      "This market is strong because it is clear. The faster path is to open real apartment and sea-view property pages, compare fit and convenience, and avoid getting stuck in generic area browsing.",
    cards: [
      {
        title: "Apartment fichas first",
        description:
          "Benidorm is primarily apartment-led, so those property pages usually show fastest whether the area really matches the buyer's expectations.",
      },
      {
        title: "Then compare view and building quality",
        description:
          "The ficha is where sea-view value, terrace use, amenities and convenience become concrete enough to judge properly.",
      },
      {
        title: "Enquire on the shortlist, not the city",
        description:
          "The lead should happen when one or two homes stand out clearly, not while the search is still just “Benidorm in general.”",
      },
    ],
  },
  "property-for-sale-finestrat": {
    eyebrow: "What to open first",
    title: "Finestrat buyers usually need product comparison more than more reading",
    description:
      "This is one of the clearest product-led markets in the province. The shortest route to confidence is to open modern apartment and villa fichas, then compare which format really fits.",
    cards: [
      {
        title: "Open modern apartment fichas",
        description:
          "These usually reveal the low-friction, community-led ownership model that brings many buyers to Finestrat in the first place.",
      },
      {
        title: "Compare against villa fichas",
        description:
          "The real decision often sits between a more accessible modern unit and a larger contemporary home with stronger privacy and outdoor space.",
      },
      {
        title: "Use the form when one product wins",
        description:
          "Once the right product type becomes obvious, the enquiry should happen from that exact home rather than from broad new-build curiosity.",
      },
    ],
  },
  "property-for-sale-alicante-city": {
    eyebrow: "What to open first",
    title: "City-plus-coast searches become clearer at ficha level very quickly",
    description:
      "Alicante city is less about spectacle and more about usability. The best route is to open the homes that could realistically work for day-to-day life and judge them in full detail.",
    cards: [
      {
        title: "Open practical apartment fichas",
        description:
          "These usually show fastest whether the search is really about city living, relocation or part-year ownership with a strong everyday base.",
      },
      {
        title: "Compare urban fit against coastal alternatives",
        description:
          "The ficha helps expose whether Alicante city itself works better than a beach-first route such as Playa de San Juan or El Campello.",
      },
      {
        title: "Use the form when the base feels right",
        description:
          "When a property looks genuinely livable and aligned with your use case, that is the right time to enquire.",
      },
    ],
  },
  "apartments-for-sale-benidorm": {
    eyebrow: "What to open first",
    title: "Apartment intent converts best when you compare real fichas fast",
    description:
      "This is already a narrow commercial search, so the page should help buyers move almost immediately into real apartment fichas and compare the homes that could actually make the shortlist.",
    cards: [
      {
        title: "Open the clearest apartment fichas",
        description:
          "Look first at the homes with the strongest combination of layout, building standard and repeat-use practicality.",
      },
      {
        title: "Judge the trade-offs in full detail",
        description:
          "The ficha is where terrace size, floor, amenities and exact position finally become concrete enough to compare properly.",
      },
      {
        title: "Submit the form on the winners",
        description:
          "Once one or two apartments stand out, use the property form there instead of switching back into broad city browsing.",
      },
    ],
  },
  "sea-view-apartments-benidorm": {
    eyebrow: "What to open first",
    title: "Sea-view intent needs ficha-level comparison even faster",
    description:
      "Sea view is emotional, so this route works best when buyers move quickly into real property pages and compare whether the premium is justified in specific homes.",
    cards: [
      {
        title: "Open the strongest view candidates",
        description:
          "The key is not just whether a home has a view, but how usable, open and defensible that view really is from the actual apartment.",
      },
      {
        title: "Compare premium against practicality",
        description:
          "Use the ficha to balance visual value against floorplan, terrace, building quality and repeat-use comfort.",
      },
      {
        title: "Enquire when the premium makes sense",
        description:
          "The right moment to send the form is when one apartment clearly justifies its premium better than the rest.",
      },
    ],
  },
  "new-build-property-finestrat": {
    eyebrow: "What to open first",
    title: "New-build buyers need product fichas, not more generic new-build copy",
    description:
      "This is already a late-funnel search. The fastest way forward is to compare the real modern homes in detail and let the right product shape the next step.",
    cards: [
      {
        title: "Open the cleanest modern fichas",
        description:
          "Look at the homes that best show layout, finish, outdoor space and the kind of ownership experience you actually want.",
      },
      {
        title: "Compare apartment versus villa reality",
        description:
          "The ficha is what turns abstract new-build interest into a real decision between more accessible units and stronger premium product.",
      },
      {
        title: "Use the form when one development stands out",
        description:
          "Once a specific property or phase becomes the clear favourite, the enquiry should happen from that exact ficha.",
      },
    ],
  },
};

const themeStyles = {
  province: {
    hero:
      "bg-[radial-gradient(circle_at_top_left,_rgba(245,208,145,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(191,219,254,0.12),_transparent_30%),linear-gradient(180deg,rgba(23,23,23,0.98),rgba(23,23,23,0.78))]",
    accent: "from-amber-50/80 via-background to-sky-50/50",
    card: "bg-[linear-gradient(180deg,rgba(255,248,235,0.95),rgba(255,255,255,0.88))]",
  },
  coastal: {
    hero:
      "bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.24),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(253,224,71,0.12),_transparent_28%),linear-gradient(180deg,rgba(12,25,38,0.98),rgba(20,40,58,0.82))]",
    accent: "from-sky-50/80 via-background to-amber-50/50",
    card: "bg-[linear-gradient(180deg,rgba(245,251,255,0.96),rgba(255,255,255,0.9))]",
  },
  premium: {
    hero:
      "bg-[radial-gradient(circle_at_top_left,_rgba(253,230,138,0.18),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.06),_transparent_22%),linear-gradient(180deg,rgba(26,20,14,0.98),rgba(34,27,20,0.84))]",
    accent: "from-stone-50/80 via-background to-amber-50/40",
    card: "bg-[linear-gradient(180deg,rgba(252,249,244,0.96),rgba(255,255,255,0.9))]",
  },
  modern: {
    hero:
      "bg-[radial-gradient(circle_at_top_left,_rgba(134,239,172,0.14),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(96,165,250,0.16),_transparent_32%),linear-gradient(180deg,rgba(17,24,39,0.98),rgba(26,36,54,0.84))]",
    accent: "from-emerald-50/60 via-background to-sky-50/50",
    card: "bg-[linear-gradient(180deg,rgba(244,255,249,0.96),rgba(255,255,255,0.9))]",
  },
  south: {
    hero:
      "bg-[radial-gradient(circle_at_top_left,_rgba(249,168,212,0.12),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(253,224,71,0.12),_transparent_26%),linear-gradient(180deg,rgba(31,23,23,0.98),rgba(46,32,32,0.84))]",
    accent: "from-rose-50/60 via-background to-amber-50/40",
    card: "bg-[linear-gradient(180deg,rgba(255,247,248,0.96),rgba(255,255,255,0.9))]",
  },
} as const;

const landingTopics: Record<string, string[]> = {
  "property-for-sale-finestrat": ["modern", "new_build"],
  "new-build-property-finestrat": ["modern", "new_build"],
  "new-build-property-orihuela-costa": ["new_build"],
  "apartments-for-sale-benidorm": ["apartments"],
  "sea-view-apartments-benidorm": ["apartments", "sea_view"],
  "property-under-200k-benidorm": ["budget", "apartments"],
  "property-for-sale-benidorm": ["apartments", "sea_view"],
  "property-for-sale-alicante-city": ["city_living"],
  "property-for-sale-orihuela-costa": ["south_cluster"],
  "property-for-sale-torrevieja": ["south_cluster"],
  "property-for-sale-pilar-de-la-horadada": ["south_cluster"],
  "property-for-sale-ciudad-quesada-rojales": ["south_cluster", "residential"],
  "property-for-sale-rojales": ["south_cluster", "residential"],
  "property-for-sale-san-miguel-de-salinas": ["south_cluster", "residential"],
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

function buildCatalogHref(catalogParams?: Record<string, string>) {
  if (!catalogParams || Object.keys(catalogParams).length === 0) {
    return "/propiedades";
  }

  const params = new URLSearchParams(catalogParams);
  return `/propiedades?${params.toString()}`;
}

const ListingSkeleton = () => (
  <div className="rounded-[28px] overflow-hidden border border-border/40 bg-card">
    <Skeleton className="h-64 w-full" />
    <div className="space-y-4 p-5">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-10 w-full" />
    </div>
  </div>
);

type SeoLandingPageProps = {
  slug: string;
};

const SeoLandingPage = ({ slug }: SeoLandingPageProps) => {
  const page = seoLandingPages[slug];
  const activePage = page ?? seoLandingPages["property-for-sale-alicante-province"];
  const { data, isLoading, isError } = useExternalProperties(activePage.filters, "price_desc", 1);

  useEffect(() => {
    if (!page) return;
    recordAreaIntent({
      slug: page.slug,
      city: page.filters.city || page.filters.cityAny?.[0] || page.h1.replace("Property for Sale in ", ""),
      topics: landingTopics[page.slug] || [],
    });
  }, [page]);

  if (!page) {
    return <Navigate to="/" replace />;
  }
  const liveListings = data?.properties.slice(0, 6) ?? [];
  const totalMatches = data?.total ?? 0;
  const hasLimitedInventory = !isLoading && !isError && totalMatches > 0 && totalMatches <= 3;
  const hasNoInventory = !isLoading && !isError && totalMatches === 0;
  const theme = themeStyles[page.theme ?? "coastal"];
  const breadcrumb = buildBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: page.h1, url: `${SITE_URL}/${page.slug}` },
  ]);
  const faqSchema = buildFaqSchema(page.faq);
  const landingPageSchema = buildWebPageSchema({
    name: page.seoTitle,
    description: page.seoDescription,
    path: `/${page.slug}`,
    type: "CollectionPage",
    breadcrumb,
  });
  const catalogHref = buildCatalogHref(page.catalogParams);
  const buyerIntent = buyerIntentSections[page.slug];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SEOHead
        title={page.seoTitle}
        description={page.seoDescription}
        canonical={`${SITE_URL}/${page.slug}`}
        keywords={[page.h1, "property for sale Costa Blanca", "Alicante real estate", "Legado Inmobiliaria"].join(", ")}
        jsonLd={[breadcrumb, landingPageSchema, faqSchema]}
      />
      <Navbar />

      <section className={`relative overflow-hidden border-b border-border/30 ${theme.hero} pt-32 text-white`}>
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_45%,rgba(255,255,255,0.02))]" />
        <div className="absolute -left-10 top-28 h-40 w-40 rounded-full border border-white/10 bg-white/5 blur-2xl" />
        <div className="absolute right-10 top-40 h-32 w-32 rounded-full border border-primary/20 bg-primary/10 blur-2xl" />
        <div className="container relative z-10 pb-24">
          <div className="grid gap-10 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
            <div className="max-w-4xl">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                <Globe2 className="h-4 w-4 text-primary" />
                {page.eyebrow}
              </p>
              <h1 className="max-w-4xl font-serif text-4xl font-bold leading-tight md:text-6xl">
                {page.h1}
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-7 text-white/78 md:text-lg">
                {page.intro}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="bg-gradient-gold text-primary-foreground hover:opacity-90">
                  <Link to={catalogHref}>{page.heroCtaLabel}</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <Link to={`${catalogHref}#live-inventory`}>View matching properties</Link>
                </Button>
              </div>
            </div>

            {page.heroMetrics?.length ? (
              <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                {page.heroMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-[26px] border border-white/12 bg-white/8 px-5 py-5 backdrop-blur-sm"
                  >
                    <div className="font-serif text-3xl font-semibold text-white">{metric.value}</div>
                    <div className="mt-2 text-sm leading-6 text-white/68">{metric.label}</div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {page.trustItems.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/12 bg-white/8 px-4 py-4 text-sm leading-6 text-white/82 backdrop-blur-sm"
              >
                <span className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  <span>{item}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SeoQuickNav
        links={[
          { label: "Open Property Pages", href: catalogHref },
          ...page.relatedLinks.slice(0, 3).map((link) => ({ label: link.label, href: link.href })),
          ...defaultQuickLinks.slice(1),
        ].filter((link, index, self) => self.findIndex((item) => item.href === link.href) === index)}
      />

      {page.slug === "property-for-sale-alicante-province" ? (
        <section className="py-16">
          <div className="container">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                Province clusters
              </p>
              <h2 className="mt-3 font-serif text-3xl font-semibold md:text-4xl">
                Three buying worlds inside one province
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Alicante province is easiest to understand when it is broken into the north coastal cluster,
                the Alicante city belt and the south Alicante / Vega Baja market.
              </p>
            </div>
            <div className="mt-10 grid gap-6 xl:grid-cols-3">
              {provinceClusters.map((cluster) => (
                <div
                  key={cluster.title}
                  className="rounded-[30px] border border-border/40 bg-[linear-gradient(180deg,rgba(255,248,235,0.95),rgba(255,255,255,0.9))] p-7"
                >
                  <h3 className="font-serif text-2xl font-semibold">{cluster.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{cluster.description}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {cluster.links.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        className="rounded-full border border-border/35 bg-background px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {page.slug === "property-for-sale-benidorm" ? (
        <section className="py-16 border-y border-border/35 bg-card/25">
          <div className="container">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                Benidorm search routes
              </p>
              <h2 className="mt-3 font-serif text-3xl font-semibold md:text-4xl">
                Go narrower when the intent is already clear
              </h2>
            </div>
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {benidormMoneyLinks.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="rounded-[28px] border border-border/40 bg-background p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25"
                >
                  <h3 className="font-serif text-2xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.description}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Explore page
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {page.slug === "property-for-sale-finestrat" ? (
        <section className="py-16">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[32px] border border-border/40 bg-[linear-gradient(180deg,rgba(244,255,249,0.96),rgba(255,255,255,0.9))] p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                  Product-led market
                </p>
                <h2 className="mt-3 font-serif text-3xl font-semibold">Why Finestrat behaves differently</h2>
                <p className="mt-5 text-base leading-8 text-muted-foreground">
                  Buyers in Finestrat often start with product preference before they start with micro-area nuance.
                  That is why this market benefits so much from comparing modern apartments, contemporary villas and
                  new-build structure at the same time.
                </p>
                <Link
                  to="/new-build-property-finestrat"
                  className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                >
                  Explore the new-build page
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-5">
                {finestratProductCards.map((card) => (
                  <div key={card.title} className="rounded-[26px] border border-border/40 bg-background p-6">
                    <h3 className="font-serif text-2xl font-semibold">{card.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{card.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-16">
        <div className="container">
          <div className="grid gap-6 lg:grid-cols-3">
            {page.highlights.map((highlight) => (
              <div
                key={highlight.title}
                className={`rounded-[28px] border border-border/40 ${theme.card} p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25`}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <MapPinned className="h-6 w-6" />
                </div>
                <h2 className="font-serif text-2xl font-semibold">{highlight.title}</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {highlight.description}
                </p>
                {highlight.href ? (
                  <Link
                    to={highlight.href}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                  >
                    Open property route
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {buyerIntent ? (
        <section className="border-y border-border/40 bg-card/35 py-16">
          <div className="container">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                  {buyerIntent.eyebrow}
                </p>
                <h2 className="mt-3 font-serif text-3xl font-semibold md:text-4xl">
                  {buyerIntent.title}
                </h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                  {buyerIntent.description}
                </p>
              </div>
              <Button asChild variant="outline" className="w-fit">
                <Link to={`${catalogHref}#live-inventory`}>Open matching property pages</Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {buyerIntent.cards.map((card) => (
                <div key={card.title} className="rounded-[26px] border border-border/40 bg-background p-6">
                  <h3 className="font-serif text-2xl font-semibold">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section id="live-inventory" className="border-y border-border/40 bg-card/35 py-16">
        <div className="container">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                Live inventory
              </p>
              <h2 className="mt-3 font-serif text-3xl font-semibold md:text-4xl">
                {page.listingTitle}
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                {page.listingDescription}
              </p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                The next best step is to open the full property pages, review photos and specifications properly, and
                enquire only on the homes that genuinely fit.
              </p>
              {!isLoading && !isError && totalMatches > 0 ? (
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  Showing {liveListings.length} live {liveListings.length === 1 ? "property" : "properties"} from{" "}
                  {totalMatches} current match{totalMatches === 1 ? "" : "es"}.
                </p>
              ) : null}
            </div>
            <Button asChild variant="outline" className="w-fit">
              <Link to={catalogHref}>Open more property details</Link>
            </Button>
          </div>

          {isError ? (
            <div className="mt-10 rounded-[28px] border border-destructive/20 bg-destructive/5 p-8 text-sm leading-7 text-muted-foreground">
              We could not load the live feed right now. The SEO landing is in place, but the inventory block needs the feed connection to respond.
            </div>
          ) : isLoading ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <ListingSkeleton key={index} />
              ))}
            </div>
          ) : liveListings.length > 0 ? (
            <>
              <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {liveListings.map((property, index) => (
                  <PropertyCard key={property.id} property={property} index={index} />
                ))}
              </div>

              {hasLimitedInventory ? (
                <div className="mt-8 rounded-[28px] border border-border/40 bg-background p-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                    Limited live inventory
                  </p>
                  <h3 className="mt-3 font-serif text-2xl font-semibold">
                    This area is matching lightly right now
                  </h3>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
                    The current feed is showing a smaller shortlist than usual for this landing. If the exact area is
                    still your priority, this page will update automatically as matching stock appears. If you want to
                    widen the search, the related nearby areas below are the strongest next step.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button asChild size="sm" className="bg-gradient-gold text-primary-foreground hover:opacity-90">
                      <Link to={catalogHref}>Open more property pages</Link>
                    </Button>
                    {page.relatedLinks.slice(0, 2).map((link) => (
                      <Button key={link.href} asChild size="sm" variant="outline">
                        <Link to={link.href}>{link.label}</Link>
                      </Button>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="mt-10 rounded-[32px] border border-border/40 bg-background p-8 md:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                Live inventory is quiet right now
              </p>
              <h3 className="mt-3 font-serif text-3xl font-semibold">
                No current properties matched this landing
              </h3>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
                The page is active and ready, but the current feed is not returning live stock for this exact search at
                the moment. That can happen when availability is temporarily thin or when the nearest matching stock is
                sitting in nearby zones rather than this exact landing.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="bg-gradient-gold text-primary-foreground hover:opacity-90">
                  <Link to={catalogHref}>Open more property pages</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/property-for-sale-alicante-province">Compare nearby property routes</Link>
                </Button>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {page.relatedLinks.slice(0, 3).map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="rounded-[24px] border border-border/35 bg-card px-5 py-5 transition-colors hover:border-primary/25 hover:text-primary"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-sm font-semibold">{link.label}</div>
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {page.areaCards?.length ? (
        <section className="py-16">
          <div className="container">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                Area snapshot
              </p>
              <h2 className="mt-3 font-serif text-3xl font-semibold md:text-4xl">
                Nearby routes that can widen the shortlist
              </h2>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {page.areaCards.map((card) => (
                <div key={card.title} className="rounded-[24px] border border-border/35 bg-card p-6">
                  <h3 className="font-serif text-xl font-semibold">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{card.description}</p>
                  {card.href ? (
                    <Link to={card.href} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      Open route
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {southClusterSlugs.has(page.slug) ? (
        <section className="py-16 border-y border-border/35 bg-card/25">
          <div className="container">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                South Alicante cluster
              </p>
              <h2 className="mt-3 font-serif text-3xl font-semibold md:text-4xl">
                Compare the strongest live routes around this search
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                These pages currently form the most commercially grounded cluster in the feed. If this exact landing
                is not the final fit, the nearby routes below are the best next places to compare.
              </p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {southClusterCards
                .filter((card) => card.href !== `/${page.slug}`)
                .map((card) => (
                  <Link
                    key={card.href}
                    to={card.href}
                    className="rounded-[26px] border border-border/40 bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-serif text-2xl font-semibold">{card.title}</h3>
                      <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
                    </div>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{card.description}</p>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-16">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                Market perspective
              </p>
              <h2 className="mt-3 font-serif text-3xl font-semibold md:text-4xl">
                {page.marketTitle}
              </h2>
              <div className="mt-6 space-y-5 text-base leading-8 text-muted-foreground">
                {page.marketBody.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-border/40 bg-card p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                360 buying support
              </p>
              <h2 className="mt-3 font-serif text-3xl font-semibold">
                More than a property portal
              </h2>
              <div className="mt-8 space-y-5">
                {processSteps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.title} className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold">{step.title}</h3>
                        <p className="mt-1 text-sm leading-7 text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`border-y border-border/35 bg-gradient-to-b ${theme.accent} py-16`}>
        <div className="container">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[30px] border border-border/40 bg-background p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <BadgeEuro className="h-6 w-6" />
                </div>
                <h2 className="font-serif text-2xl font-semibold">Mortgage strategy for non-residents</h2>
              </div>
              <p className="mt-5 text-sm leading-7 text-muted-foreground">
                Financing is not only for buyers who need it. Many foreign buyers use a mortgage to preserve liquidity, keep capital available for other investments and avoid concentrating too much cash in one property.
              </p>
            </div>

            <div className="rounded-[30px] border border-border/40 bg-background p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Scale className="h-6 w-6" />
                </div>
                <h2 className="font-serif text-2xl font-semibold">Legal coordination through completion</h2>
              </div>
              <p className="mt-5 text-sm leading-7 text-muted-foreground">
                Title review, debts, contract structure, developer checks where relevant, taxes and notary completion should all sit inside one joined-up process instead of being treated as separate tasks.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[30px] border border-border/40 bg-card p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                Nearby property routes
              </p>
              <h2 className="mt-3 font-serif text-3xl font-semibold">Use nearby routes only if they help you reach a better fit</h2>
              <div className="mt-6 flex flex-col gap-4">
                {page.relatedLinks.map((link) => (
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
              <h2 className="mt-3 font-serif text-3xl font-semibold">Questions buyers usually ask here</h2>
              <div className="mt-6 space-y-5">
                {page.faq.map((item) => (
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
              Start with support
            </p>
            <h2 className="mt-3 max-w-3xl font-serif text-3xl font-semibold md:text-5xl">
              Buy in Alicante province with search, mortgage and legal help aligned from day one
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/72">
              Use the live inventory to shortlist the right properties, then move forward with the buying structure that suits your goals instead of piecing the process together on your own.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-gradient-gold text-primary-foreground hover:opacity-90">
                <Link to={catalogHref}>{page.heroCtaLabel}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link to="/propiedades">Open more property pages</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default SeoLandingPage;
