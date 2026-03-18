import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/PropertyCard";
import { useFeaturedExternalProperties, type ExternalPropertyFilters } from "@/hooks/useExternalProperties";
import { useTranslation } from "@/contexts/LanguageContext";
import { usePersonalization } from "@/hooks/usePersonalization";
import { getAreaIntentFilters, getAreaRouteMeta, getTopAreaSlug, getTopTopic, sortPropertiesByIntent } from "@/lib/personalization";

const FeaturedProperties = () => {
  const { t } = useTranslation();
  const { hasSignal, profile, intentStage } = usePersonalization();
  const recentProperty = profile.recentProperties[0];
  const topAreaSlug = getTopAreaSlug(profile);
  const topArea = getAreaRouteMeta(topAreaSlug);
  const topTopic = getTopTopic(profile);

  const personalizedFilters: ExternalPropertyFilters = (() => {
    if (recentProperty?.city) {
      return { cityAny: [recentProperty.city] };
    }

    if (topAreaSlug && getAreaIntentFilters(topAreaSlug)) {
      return getAreaIntentFilters(topAreaSlug) as ExternalPropertyFilters;
    }

    if (topTopic === "apartments") return { type: "piso" };
    if (topTopic === "villa") return { type: "villa" };
    return {};
  })();

  const hasPersonalizedFilters = Object.keys(personalizedFilters).length > 0;
  const { data: genericProperties, isLoading: isGenericLoading } = useFeaturedExternalProperties();
  const { data: personalizedProperties, isLoading: isPersonalizedLoading } =
    useFeaturedExternalProperties(personalizedFilters);

  const activeProperties =
    hasSignal && hasPersonalizedFilters && (personalizedProperties?.length || 0) > 0
      ? personalizedProperties
      : genericProperties;
  const merchandisedProperties = activeProperties ? sortPropertiesByIntent(profile, activeProperties) : activeProperties;
  const isLoading =
    isGenericLoading || (hasSignal && hasPersonalizedFilters ? isPersonalizedLoading : false);

  const title = hasSignal && topArea
    ? `Propiedades para seguir por ${topArea.label}`
    : hasSignal && recentProperty?.city
      ? `Propiedades para retomar en ${recentProperty.city}`
      : `${t("featured.title")} ${t("featured.title2")}`;

  const description = hasSignal && topArea
    ? intentStage === "late"
      ? `Ya hay intención suficiente en ${topArea.label} como para dejar de explorar en abstracto. Te enseñamos viviendas mejor alineadas con esa ruta para que abras fichas y decidas con más claridad.`
      : `Ya tenemos señales claras de interés en ${topArea.label}. Te enseñamos viviendas más alineadas con esa ruta para que entres en fichas relevantes cuanto antes.`
    : hasSignal && recentProperty?.city
      ? `Como ya has mostrado interés en ${recentProperty.city}, esta selección intenta devolverte a viviendas cercanas a esa intención en vez de enseñarte una mezcla genérica.`
      : "El objetivo aquí no es mirar por mirar. Entra en las fichas completas, compara bien cada vivienda y deja tu consulta solo cuando una propiedad te encaje de verdad.";

  const ctaHref = hasSignal && topArea ? `${topArea.href}#live-inventory` : "/propiedades";
  const ctaLabel =
    hasSignal && topArea
      ? intentStage === "late"
        ? `Abrir fichas en ${topArea.label}`
        : `Seguir por ${topArea.label}`
      : "Abrir más fichas de propiedades";

  return (
    <section className="py-14 md:py-24 bg-background">
      <div className="container px-4 sm:px-6">
        <div className="text-center mb-10 md:mb-16 reveal-up">
          <p className="text-primary font-medium tracking-[0.2em] uppercase text-xs sm:text-sm mb-2 sm:mb-3">{t("featured.tag")}</p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold">
            {hasSignal && (topArea || recentProperty?.city) ? title : (
              <>
                {t("featured.title")} <span className="text-gradient-gold">{t("featured.title2")}</span>
              </>
            )}
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-sm sm:text-base leading-7 text-muted-foreground">
            {description}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
            {merchandisedProperties?.slice(0, 3).map((p, i) => (
              <PropertyCard key={p.id} property={p} index={i} />
            ))}
          </div>
        )}

        <div className="text-center mt-8 md:mt-12 reveal-up">
          <Link to={ctaHref}>
            <Button variant="outline" className="border-primary/40 text-foreground hover:bg-primary/10 px-8 py-6 text-base font-semibold">
              {ctaLabel}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
