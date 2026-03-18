import { Star, Quote, Globe } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";

/**
 * Reviews here MUST match the JSON-LD `localBusinessSchema` in seo-schemas.ts
 * for consistency with Google's Knowledge Panel.
 */
const schemaReviews = [
  {
    name: "María García",
    flagCode: "es",
    lang: "Española",
    rating: 5,
    date: "Nov 2025",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    text: "Excelente servicio. Encontramos nuestra villa soñada en Benidorm en menos de un mes. El equipo fue muy profesional y atento en todo momento.",
  },
  {
    name: "Hans Müller",
    flagCode: "de",
    lang: "Alemán",
    rating: 5,
    date: "Oct 2025",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    text: "Wir haben unser Traumapartment an der Costa Blanca gefunden. Der Service war ausgezeichnet und mehrsprachig. Sehr empfehlenswert!",
  },
  {
    name: "Jean-Pierre Dubois",
    flagCode: "fr",
    lang: "Francés",
    rating: 5,
    date: "Sep 2025",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
    text: "Service impeccable. Ils nous ont aidé à trouver un magnifique penthouse à Altea. Communication parfaite en français.",
  },
  {
    name: "Carlos Fernández",
    flagCode: "es",
    lang: "Español",
    rating: 5,
    date: "Ago 2025",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    text: "Muy buena selección de propiedades de lujo. El proceso de compra fue transparente y rápido. Recomendable al 100%.",
  },
  {
    name: "Sarah Johnson",
    flagCode: "gb",
    lang: "Británica",
    rating: 5,
    date: "Jul 2025",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    text: "Outstanding experience buying our holiday home in Benidorm. The team handled everything from viewing to paperwork seamlessly.",
  },
  {
    name: "Erik van der Berg",
    flagCode: "nl",
    lang: "Holandés",
    rating: 5,
    date: "Jun 2025",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face",
    text: "Fantastische ervaring. Alles werd geregeld: NIE, bankrekening, hypotheek. We hoefden alleen ons droomhuis te kiezen.",
  },
];

const AGGREGATE = { rating: 4.9, reviews: 127 };

const Testimonials = () => {
  const { t } = useTranslation();

  return (
    <section className="py-14 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-card/50 to-background" />

      <div className="container relative px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 enter-fade-up">
          <p className="text-primary font-medium tracking-[0.2em] uppercase text-xs sm:text-sm mb-2 sm:mb-3">
            {t("test.tag")}
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold">
            {t("test.title1")}{" "}
            <span className="text-gradient-gold">{t("test.title2")}</span>
          </h2>
        </div>

        {/* Aggregate rating */}
        <div className="flex flex-col items-center gap-2 mb-8 md:mb-14 enter-fade-up">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-foreground">{AGGREGATE.rating}</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(AGGREGATE.rating)
                      ? "fill-primary text-primary"
                      : "fill-primary/40 text-primary/40"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-muted-foreground text-sm">
            Basado en {AGGREGATE.reviews} reseñas verificadas
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <Globe className="w-3.5 h-3.5" />
            <span>Clientes de 12+ países</span>
          </div>
        </div>

        {/* Reviews grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {schemaReviews.map((review, i) => (
            <div
              key={review.name}
              className={`group relative p-5 sm:p-6 md:p-7 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors ${
                i >= 3 ? "lg:col-span-1 md:col-span-1" : ""
              } enter-fade-up`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <Quote className="w-9 h-9 text-primary/10 absolute top-5 right-5" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`w-4 h-4 ${
                      j < review.rating
                        ? "fill-primary text-primary"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>

              {/* Review text */}
              <p className="text-foreground/80 text-sm leading-relaxed mb-6 italic line-clamp-4">
                "{review.text}"
              </p>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary">
                    <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-foreground text-sm">{review.name}</p>
                      <img
                        src={`https://flagcdn.com/w20/${review.flagCode}.png`}
                        alt={review.lang}
                        className="w-4 h-3 rounded-sm object-cover"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-muted-foreground text-xs">{review.lang}</p>
                  </div>
                </div>
                <span className="text-muted-foreground text-xs">{review.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
