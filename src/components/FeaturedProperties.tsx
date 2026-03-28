import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/PropertyCard";
import { useFeaturedExternalProperties, type ExternalPropertyFilters } from "@/hooks/useExternalProperties";
import { Language, useTranslation } from "@/contexts/LanguageContext";
import { usePersonalization } from "@/hooks/usePersonalization";
import { getAreaIntentFilters, getAreaRouteMeta, getTopAreaSlug, getTopTopic, sortPropertiesByIntent } from "@/lib/personalization";

const FeaturedProperties = () => {
  const { t, language } = useTranslation();
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

  const copy: Record<Language, {
    areaTitle: (label: string) => string;
    cityTitle: (city: string) => string;
    areaLate: (label: string) => string;
    areaMid: (label: string) => string;
    cityDesc: (city: string) => string;
    defaultDesc: string;
    ctaAreaLate: (label: string) => string;
    ctaAreaMid: (label: string) => string;
    ctaDefault: string;
  }> = {
    es: {
      areaTitle: (label) => `Propiedades para seguir por ${label}`,
      cityTitle: (city) => `Propiedades para retomar en ${city}`,
      areaLate: (label) => `Ya hay intencion suficiente en ${label} como para dejar de explorar en abstracto. Te ensenamos viviendas mejor alineadas con esa ruta para que abras fichas y decidas con mas claridad.`,
      areaMid: (label) => `Ya tenemos senales claras de interes en ${label}. Te ensenamos viviendas mas alineadas con esa ruta para que entres en fichas relevantes cuanto antes.`,
      cityDesc: (city) => `Como ya has mostrado interes en ${city}, esta seleccion intenta devolverte a viviendas cercanas a esa intencion en vez de ensenarte una mezcla generica.`,
      defaultDesc: "El objetivo aqui no es mirar por mirar. Entra en las fichas completas, compara bien cada vivienda y deja tu consulta solo cuando una propiedad te encaje de verdad.",
      ctaAreaLate: (label) => `Abrir fichas en ${label}`,
      ctaAreaMid: (label) => `Seguir por ${label}`,
      ctaDefault: "Abrir mas fichas de propiedades",
    },
    en: {
      areaTitle: (label) => `Properties to keep moving through ${label}`,
      cityTitle: (city) => `Properties to pick back up in ${city}`,
      areaLate: (label) => `There is already enough intent around ${label} to stop browsing in the abstract. These homes are a better place to open full listings, compare properly and decide what deserves the next step.`,
      areaMid: (label) => `We already have strong signals around ${label}. So instead of sending you back into generic browsing, we surface homes that fit this route more closely.`,
      cityDesc: (city) => `Because you have already shown interest in ${city}, this selection tries to bring you back to homes near that intent instead of another mixed feed.`,
      defaultDesc: "Some properties are there to fill a feed. Some deserve a proper look. Open the full listings, compare carefully and only enquire when a home still makes sense after that.",
      ctaAreaLate: (label) => `Open listings in ${label}`,
      ctaAreaMid: (label) => `Continue through ${label}`,
      ctaDefault: "Open more full listings",
    },
    fr: {
      areaTitle: (label) => `Biens pour continuer sur ${label}`,
      cityTitle: (city) => `Biens a reprendre du cote de ${city}`,
      areaLate: (label) => `Il y a deja assez d'intention autour de ${label} pour arreter l'exploration abstraite. Ces biens sont une meilleure base pour ouvrir les fiches, comparer serieusement et decider du vrai prochain pas.`,
      areaMid: (label) => `Nous avons deja des signaux utiles autour de ${label}. Plutot que de revenir a une navigation generique, nous faisons remonter des biens plus coherents avec cette piste.`,
      cityDesc: (city) => `Comme vous avez deja montre un interet pour ${city}, cette selection essaie de vous ramener vers des biens proches de cette intention plutot que vers un flux melange.`,
      defaultDesc: "Certains biens remplissent juste un flux. D'autres meritent un vrai examen. Ouvrez les fiches completes, comparez serieusement et contactez-nous seulement quand le bien tient encore la route.",
      ctaAreaLate: (label) => `Ouvrir les fiches a ${label}`,
      ctaAreaMid: (label) => `Continuer via ${label}`,
      ctaDefault: "Ouvrir plus de fiches completes",
    },
    de: {
      areaTitle: (label) => `Immobilien, um in ${label} weiterzugehen`,
      cityTitle: (city) => `Immobilien zum Wiederaufnehmen in ${city}`,
      areaLate: (label) => `Rund um ${label} ist bereits genug Kaufabsicht da, um nicht weiter abstrakt zu browsen. Diese Immobilien sind der bessere Ort, um Exposes zu oeffnen, sauber zu vergleichen und den naechsten Schritt zu entscheiden.`,
      areaMid: (label) => `Wir haben bereits klare Signale fuer ${label}. Statt Sie wieder in generisches Browsing zu schicken, zeigen wir Immobilien, die besser zu dieser Route passen.`,
      cityDesc: (city) => `Da Sie bereits Interesse an ${city} gezeigt haben, fuehrt diese Auswahl Sie eher zu passenden Immobilien in diesem Umfeld statt zu einem gemischten Feed zurueck.`,
      defaultDesc: "Manche Immobilien fuellen nur einen Feed. Andere verdienen einen echten Blick. Oeffnen Sie die vollstaendigen Exposes, vergleichen Sie sauber und fragen Sie nur dort an, wo es danach noch Sinn ergibt.",
      ctaAreaLate: (label) => `Exposes in ${label} oeffnen`,
      ctaAreaMid: (label) => `Ueber ${label} weitergehen`,
      ctaDefault: "Mehr vollstaendige Exposes oeffnen",
    },
  }[language];

  const title = hasSignal && topArea
    ? copy.areaTitle(topArea.label)
    : hasSignal && recentProperty?.city
      ? copy.cityTitle(recentProperty.city)
      : `${t("featured.title")} ${t("featured.title2")}`;

  const description = hasSignal && topArea
    ? intentStage === "late"
      ? copy.areaLate(topArea.label)
      : copy.areaMid(topArea.label)
    : hasSignal && recentProperty?.city
      ? copy.cityDesc(recentProperty.city)
      : copy.defaultDesc;

  const ctaHref = hasSignal && topArea ? `${topArea.href}#live-inventory` : "/propiedades";
  const ctaLabel =
    hasSignal && topArea
      ? intentStage === "late"
        ? copy.ctaAreaLate(topArea.label)
        : copy.ctaAreaMid(topArea.label)
      : copy.ctaDefault;

  return (
    <section className="py-12 md:py-24 bg-background">
      <div className="container px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-10 md:mb-16 reveal-up">
          <p className="text-primary font-medium tracking-[0.16em] sm:tracking-[0.2em] uppercase text-[11px] sm:text-sm mb-2 sm:mb-3">{t("featured.tag")}</p>
          <h2 className="font-serif text-[2rem] sm:text-4xl md:text-5xl font-bold leading-[1.08]">
            {hasSignal && (topArea || recentProperty?.city) ? title : (
              <>
                {t("featured.title")} <span className="text-gradient-gold">{t("featured.title2")}</span>
              </>
            )}
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-sm sm:text-base leading-6 sm:leading-7 text-muted-foreground">
            {description}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-8">
            {merchandisedProperties?.slice(0, 3).map((p, i) => (
              <PropertyCard key={p.id} property={p} index={i} />
            ))}
          </div>
        )}

        <div className="text-center mt-8 md:mt-12 reveal-up">
          <Link to={ctaHref} className="inline-block w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto border-primary/40 text-foreground hover:bg-primary/10 px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-semibold">
              {ctaLabel}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
