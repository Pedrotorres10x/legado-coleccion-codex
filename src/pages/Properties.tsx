import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { trackSearch, setupScrollTracking } from "@/lib/metaPixel";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import PropertyFiltersBar from "@/components/PropertyFiltersBar";
import SeoHubSection from "@/components/SeoHubSection";
import { useExternalProperties, type ExternalPropertyFilters, type ExternalPropertySort } from "@/hooks/useExternalProperties";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MessageCircle, Users, CalendarDays, Shield, Award, Clock, AlertTriangle, RefreshCw } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seo-schemas";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import PersonalizedNextStep from "@/components/PersonalizedNextStep";
import { SITE_URL } from "@/lib/site";
import { recordSearchIntent, sortPropertiesByIntent } from "@/lib/personalization";
import { usePersonalization } from "@/hooks/usePersonalization";
import { Language, useTranslation } from "@/contexts/LanguageContext";

// Map hero budget param → [minPrice, maxPrice]
const BUDGET_MAP: Record<string, { minPrice?: number; maxPrice?: number }> = {
  "0-150000":      { maxPrice: 150000 },
  "150000-300000": { minPrice: 150000, maxPrice: 300000 },
  "300000-600000": { minPrice: 300000, maxPrice: 600000 },
  "600000+":       { minPrice: 600000 },
};

function filtersFromParams(params: URLSearchParams): ExternalPropertyFilters {
  const f: ExternalPropertyFilters = {};
  const type   = params.get("type");
  const zone   = params.get("zone");
  const budget = params.get("budget");

  if (type)   f.type = type;
  if (zone)   f.city = zone.charAt(0).toUpperCase() + zone.slice(1);
  if (budget && BUDGET_MAP[budget]) Object.assign(f, BUDGET_MAP[budget]);

  return f;
}

// ─── Skeleton card for loading state ──────────────────────────────────────────
const PropertyCardSkeleton = () => (
  <div className="rounded-2xl overflow-hidden border border-border/30 bg-card">
    <Skeleton className="w-full h-56" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-3 pt-2 border-t border-border/50">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16 ml-auto" />
      </div>
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
    </div>
  </div>
);

const southClusterRoutes = [
  {
    title: "Torrevieja",
    href: "/property-for-sale-torrevieja",
    description: "Broad live stock and one of the clearest entry points into the current south Alicante feed.",
  },
  {
    title: "Pilar de la Horadada",
    href: "/property-for-sale-pilar-de-la-horadada",
    description: "A strong route for practical coastal ownership across apartments, townhouses and villas.",
  },
  {
    title: "Ciudad Quesada and Rojales",
    href: "/property-for-sale-ciudad-quesada-rojales",
    description: "Residential stock with strong current support for buyers looking beyond the coastal strip.",
  },
  {
    title: "Guardamar and San Miguel",
    href: "/property-for-sale-guardamar-del-segura",
    description: "Useful alternatives when the search is moving toward calmer or more residential south Alicante areas.",
  },
];

const areaLabels: Record<string, string> = {
  "property-for-sale-finestrat": "Finestrat",
  "new-build-property-finestrat": "obra nueva en Finestrat",
  "property-for-sale-benidorm": "Benidorm",
  "apartments-for-sale-benidorm": "apartamentos en Benidorm",
  "sea-view-apartments-benidorm": "apartamentos con vistas en Benidorm",
  "property-for-sale-alicante-city": "Alicante city",
  "property-for-sale-orihuela-costa": "Orihuela Costa",
  "property-for-sale-torrevieja": "Torrevieja",
  "property-for-sale-pilar-de-la-horadada": "Pilar de la Horadada",
  "property-for-sale-ciudad-quesada-rojales": "Ciudad Quesada / Rojales",
};

const Properties = () => {
  const { language } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialFilters = filtersFromParams(searchParams);
  const isMobile = useIsMobile();

  const [filters, setFilters] = useState<ExternalPropertyFilters>(initialFilters);
  const [sort, setSort] = useState<ExternalPropertySort>("price_desc");
  const [page, setPage] = useState(1);
  const { hasSignal, profile, intentStage } = usePersonalization();

  const { data, isLoading, isError, refetch } = useExternalProperties(filters, sort, page);
  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;
  const normalizedCity = (filters.city || "").toLowerCase();
  const ui: Record<Language, {
    seoTitle: string;
    seoDescription: string;
    heroTitleStart: string;
    heroTitleAccent: string;
    heroTitleEnd: string;
    heroSub: string;
    personalizedDefault: string;
    resultsLate: string;
    resultsDefault: string;
    errorTitle: string;
    errorDesc: string;
    retry: string;
    whatsapp: string;
    noResults: string;
    clearFilters: string;
  }> = {
    es: {
      seoTitle: "Propiedades en Venta en Benidorm y Costa Blanca | Legado Inmobiliaria",
      seoDescription: "Explora mas de 900 propiedades exclusivas en venta: pisos, villas, chalets y aticos en Benidorm, Alicante y la Costa Blanca. Filtra por precio, tipo y ubicacion.",
      heroTitleStart: "Tu nueva vida en la",
      heroTitleAccent: "Costa Blanca",
      heroTitleEnd: "empieza aqui",
      heroSub: "+900 propiedades verificadas · Atencion personalizada · Sin compromiso",
      personalizedDefault: "Usa los filtros para encontrar mejores opciones, pero no te quedes en la rejilla: entra en las fichas completas, revisa bien cada vivienda y envia el formulario solo cuando haya encaje real.",
      resultsLate: "Hemos priorizado primero las viviendas que mejor encajan con tus senales actuales. Abre fichas, compara bien y usa el formulario solo en las que realmente merezcan un siguiente paso.",
      resultsDefault: "Abre las fichas completas para ver fotos reales, detalles y el formulario antes de decidir que viviendas merecen entrar en tu shortlist.",
      errorTitle: "No pudimos cargar las propiedades",
      errorDesc: "Estamos teniendo problemas para conectar con nuestro sistema. Intentalo de nuevo en unos segundos.",
      retry: "Reintentar",
      whatsapp: "Contactar por WhatsApp",
      noResults: "No se encontraron propiedades con estos filtros.",
      clearFilters: "Limpiar filtros",
    },
    en: {
      seoTitle: "Property for Sale in Benidorm and the Costa Blanca | Legado Inmobiliaria",
      seoDescription: "Explore more than 900 exclusive homes for sale across Benidorm, Alicante and the Costa Blanca. Filter by price, property type and location.",
      heroTitleStart: "Your new life on the",
      heroTitleAccent: "Costa Blanca",
      heroTitleEnd: "starts here",
      heroSub: "900+ verified homes · Personal guidance · No pressure",
      personalizedDefault: "Use the filters to refine the shortlist, but do not stay at grid level: open the full listings, review each home properly and enquire only when there is a genuine fit.",
      resultsLate: "We have prioritised the homes that best match your current signals first. Open listings, compare carefully and enquire only on the ones that truly deserve a next step.",
      resultsDefault: "Open the full property pages to review real photos, details and the enquiry form before deciding which homes deserve a place on your shortlist.",
      errorTitle: "We could not load the properties",
      errorDesc: "We are having trouble connecting to the live feed right now. Please try again in a few seconds.",
      retry: "Try again",
      whatsapp: "Contact via WhatsApp",
      noResults: "No properties matched these filters.",
      clearFilters: "Clear filters",
    },
    fr: {
      seoTitle: "Biens a vendre a Benidorm et sur la Costa Blanca | Legado Inmobiliaria",
      seoDescription: "Explorez plus de 900 biens exclusifs a vendre a Benidorm, Alicante et sur la Costa Blanca. Filtrez par prix, type de bien et localisation.",
      heroTitleStart: "Votre nouvelle vie sur la",
      heroTitleAccent: "Costa Blanca",
      heroTitleEnd: "commence ici",
      heroSub: "Plus de 900 biens verifies · Accompagnement personnalise · Sans engagement",
      personalizedDefault: "Utilisez les filtres pour affiner votre selection, mais ne restez pas sur la grille: ouvrez les fiches completes, comparez vraiment chaque bien et contactez-nous seulement lorsqu'il y a un vrai fit.",
      resultsLate: "Nous avons d'abord mis en avant les biens qui correspondent le mieux a vos signaux actuels. Ouvrez les fiches, comparez avec soin et ne passez a l'etape suivante que pour les biens qui le meritent vraiment.",
      resultsDefault: "Ouvrez les fiches completes pour voir les vraies photos, les details et le formulaire avant de decider quels biens meritent une place dans votre selection.",
      errorTitle: "Impossible de charger les biens",
      errorDesc: "Nous rencontrons actuellement un probleme de connexion avec notre flux. Reessayez dans quelques secondes.",
      retry: "Reessayer",
      whatsapp: "Contacter par WhatsApp",
      noResults: "Aucun bien ne correspond a ces filtres.",
      clearFilters: "Effacer les filtres",
    },
    de: {
      seoTitle: "Immobilien zum Verkauf in Benidorm und an der Costa Blanca | Legado Inmobiliaria",
      seoDescription: "Entdecken Sie mehr als 900 exklusive Immobilien in Benidorm, Alicante und an der Costa Blanca. Filtern Sie nach Preis, Immobilientyp und Lage.",
      heroTitleStart: "Ihr neues Leben an der",
      heroTitleAccent: "Costa Blanca",
      heroTitleEnd: "beginnt hier",
      heroSub: "900+ gepruefte Immobilien · Persoenliche Begleitung · Unverbindlich",
      personalizedDefault: "Nutzen Sie die Filter, um die Auswahl einzugrenzen, bleiben Sie aber nicht nur im Raster: Oeffnen Sie die vollstaendigen Exposes, pruefen Sie jede Immobilie richtig und fragen Sie nur dort an, wo es wirklich passt.",
      resultsLate: "Wir haben zuerst die Immobilien priorisiert, die am besten zu Ihren aktuellen Signalen passen. Oeffnen Sie Exposes, vergleichen Sie sorgfaeltig und gehen Sie nur bei wirklich passenden Objekten den naechsten Schritt.",
      resultsDefault: "Oeffnen Sie die vollstaendigen Objektseiten, um echte Fotos, Details und das Anfrageformular zu sehen, bevor Sie entscheiden, welche Immobilien auf Ihre Shortlist gehoeren.",
      errorTitle: "Die Immobilien konnten nicht geladen werden",
      errorDesc: "Zurzeit gibt es ein Verbindungsproblem mit unserem System. Bitte versuchen Sie es in wenigen Sekunden erneut.",
      retry: "Erneut versuchen",
      whatsapp: "Per WhatsApp kontaktieren",
      noResults: "Keine Immobilien entsprechen diesen Filtern.",
      clearFilters: "Filter loeschen",
    },
  }[language];
  const topAreaSlug = profile.lastAreaSlug || Object.entries(profile.areaCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topTopic = Object.entries(profile.topicCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const personalizedHeroLine = hasSignal
    ? `Ya tenemos señales útiles de esta búsqueda${topAreaSlug ? `, especialmente en ${areaLabels[topAreaSlug] || "tu zona prioritaria"}` : ""}${topTopic === "mortgage" ? " y con interés en hipoteca" : topTopic === "legal" ? " y con foco legal" : ""}. Usa el catálogo para volver antes a las fichas que más sentido tienen para ti.`
    : ui.personalizedDefault;
  const merchandisedProperties = data?.properties ? sortPropertiesByIntent(profile, data.properties) : [];
  const resultsIntro = hasSignal && intentStage === "late"
    ? ui.resultsLate
    : ui.resultsDefault;
  const showSouthClusterPromo =
    !filters.city ||
    [
      "torrevieja",
      "orihuela costa",
      "orihuela",
      "rojales",
      "ciudad quesada",
      "guardamar del segura",
      "pilar de la horadada",
      "san miguel de salinas",
    ].includes(normalizedCity);

  const handleFiltersChange = (f: ExternalPropertyFilters) => {
    setFilters(f);
    setPage(1);
    recordSearchIntent({ city: f.city, type: f.type });
    if (Object.values(f).some((v) => v !== undefined)) {
      trackSearch({
        city: f.city,
        property_type: f.type,
        min_price: f.minPrice,
        max_price: f.maxPrice,
        bedrooms: f.minBeds,
        num_results: data?.total,
      });
    }
  };

  useEffect(() => {
    return setupScrollTracking();
  }, []);

  const breadcrumb = buildBreadcrumbSchema([
    { name: "Inicio", url: SITE_URL },
    { name: "Propiedades", url: `${SITE_URL}/propiedades` },
  ]);
  const collectionPageSchema = buildWebPageSchema({
    name: ui.seoTitle,
    description: ui.seoDescription,
    path: "/propiedades",
    type: "CollectionPage",
    breadcrumb,
  });

  return (
    <main className="min-h-screen bg-background">
      <SEOHead
        title={ui.seoTitle}
        description={ui.seoDescription}
        canonical={`${SITE_URL}/propiedades`}
        keywords="propiedades en venta Costa Blanca, pisos en venta Benidorm, villas Alicante, comprar casa en Costa Blanca, catalogo inmobiliario Benidorm"
        jsonLd={[breadcrumb, collectionPageSchema]}
      />
      <Navbar />

      {/* Hero header */}
      <section className="pt-28 sm:pt-32 pb-10 sm:pb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-card/80 to-background" />
        <div className="container relative z-10">
          {/* Emotional hero */}
          <div className="text-center space-y-4 sm:space-y-5 enter-fade-up">
            <h1 className="font-serif text-[2rem] sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.08] sm:leading-tight">
              {ui.heroTitleStart}{" "}
              <span className="text-gradient-gold">{ui.heroTitleAccent}</span>{" "}
              {ui.heroTitleEnd}
            </h1>
            <p className="text-muted-foreground text-[15px] sm:text-base md:text-lg max-w-2xl mx-auto">
              {ui.heroSub}
            </p>
            <p className="text-muted-foreground/90 text-sm md:text-base max-w-3xl mx-auto leading-6 sm:leading-7">
              {personalizedHeroLine}
            </p>
          </div>
          {/* Unified trust bar */}
          <div className="mt-6 sm:mt-8 mx-auto max-w-3xl rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm px-4 sm:px-6 py-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-center gap-x-5 sm:gap-x-8 gap-y-3 text-[11px] sm:text-xs md:text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-primary" /> +1.500 familias asesoradas</span>
              <span className="h-4 w-px bg-border hidden sm:inline-block" />
              <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-primary" /> +15 años de experiencia</span>
              <span className="h-4 w-px bg-border hidden sm:inline-block" />
              <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-primary" /> Certificación API & CRS</span>
              <span className="h-4 w-px bg-border hidden sm:inline-block" />
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary" /> Respuesta en menos de 24h</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="pb-24">
        <div className="container">
          <PropertyFiltersBar
            filters={filters}
            sort={sort}
            onFiltersChange={handleFiltersChange}
            onSortChange={setSort}
            total={data?.total || 0}
            cities={data?.cities || []}
          /> 

          {!isLoading && !isError && (data?.total || 0) > 0 ? (
            <div className="mt-6 rounded-2xl border border-border/35 bg-card/40 px-5 py-4 text-sm leading-7 text-muted-foreground">
              {resultsIntro}
            </div>
          ) : null}

          {isError ? (
            <div className="flex flex-col items-center justify-center py-20 text-center enter-fade-up">
              <div className="animate-gold-pulse rounded-full">
                <AlertTriangle className="h-12 w-12 text-primary mb-4" />
              </div>
              <h2 className="font-serif text-2xl font-bold mb-2">{ui.errorTitle}</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                {ui.errorDesc}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => refetch()} className="bg-gradient-gold text-primary-foreground gap-2">
                  <RefreshCw className="w-4 h-4" />
                  {ui.retry}
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href="https://wa.me/644245670?text=Hola%2C%20la%20web%20no%20me%20carga%20las%20propiedades.%20%C2%BFPodr%C3%ADan%20ayudarme%3F"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {ui.whatsapp}
                  </a>
                </Button>
              </div>
            </div>
          ) : isLoading ? (
            /* Skeleton loading grid */
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : data?.properties.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">{ui.noResults}</p>
              <Button variant="outline" className="mt-4" onClick={() => handleFiltersChange({})}>
                {ui.clearFilters}
              </Button>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                {merchandisedProperties.map((p, i) => (
                  <PropertyCard key={p.id} property={p} index={i} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
                  <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage(page - 1)} className="border-border">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                    <Button
                      key={p}
                      variant={p === page ? "default" : "outline"}
                      size="icon"
                      onClick={() => setPage(p)}
                      className={p === page ? "bg-gradient-gold text-primary-foreground" : "border-border"}
                    >
                      {p}
                    </Button>
                  ))}
                  <Button variant="outline" size="icon" disabled={page === totalPages} onClick={() => setPage(page + 1)} className="border-border">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <PersonalizedNextStep
        title="Continue from your real buying signals"
        description="If you've already shown interest in an area, topic or property, we can use that to send you back to the most useful next step instead of restarting the search from zero."
      />

      {showSouthClusterPromo ? (
        <section className="pb-16">
          <div className="container">
            <div className="rounded-[28px] sm:rounded-[32px] border border-primary/20 bg-[linear-gradient(180deg,rgba(255,248,235,0.95),rgba(255,255,255,0.92))] p-5 sm:p-8 md:p-10">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                  Strong live routes
                </p>
                <h2 className="mt-3 font-serif text-3xl font-semibold md:text-4xl">
                  The south Alicante cluster is the strongest inventory pocket right now
                </h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                  If you are still comparing areas, these routes currently have the best support from the live feed and
                  usually give a clearer shortlist faster than browsing the whole map blindly. From there, the next step should be to open concrete property fichas.
                </p>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {southClusterRoutes.map((route) => (
                  <Link
                    key={route.href}
                    to={route.href}
                    className="rounded-[24px] border border-border/35 bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-serif text-2xl font-semibold">{route.title}</h3>
                      <ChevronRight className="h-4 w-4 shrink-0 text-primary" />
                    </div>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{route.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <SeoHubSection
        title="Need more than a catalog?"
        description="Use the area pages and buyer guides to compare Alicante province properly, especially if you are weighing budget, mortgage strategy or the legal route alongside the shortlist."
      />

      {/* Exit intent popup */}
      <ExitIntentPopup />

      <Footer />
    </main>
  );
};

export default Properties;
