import { Star, Quote, Globe } from "lucide-react";
import { Language, useTranslation } from "@/contexts/LanguageContext";

/**
 * Reviews here MUST match the JSON-LD `localBusinessSchema` in seo-schemas.ts
 * for consistency with Google's Knowledge Panel.
 */
type Review = {
  name: string;
  flagCode: string;
  lang: string;
  rating: number;
  date: string;
  avatar: string;
  text: string;
};

const BASE_REVIEWS: Review[] = [
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

const REVIEWS_BY_LANGUAGE: Partial<Record<Language, Review[]>> = {
  en: [
    {
      ...BASE_REVIEWS[0],
      lang: "Spanish client",
      text: "Excellent service. We found our dream villa in Benidorm in under a month. The team was attentive, professional and reassuring from start to finish.",
    },
    {
      ...BASE_REVIEWS[1],
      lang: "German client",
      text: "We found the apartment we had been hoping for on the Costa Blanca. The multilingual support was first-class and the whole process felt safe and well organised.",
    },
    {
      ...BASE_REVIEWS[2],
      lang: "French client",
      text: "A flawless experience. They helped us secure a beautiful penthouse in Altea, and being able to communicate so naturally in French made all the difference.",
    },
    {
      ...BASE_REVIEWS[3],
      lang: "Spanish client",
      text: "A very strong selection of premium properties. The purchase process was transparent, agile and handled with real professionalism.",
    },
    {
      ...BASE_REVIEWS[4],
      lang: "British client",
      text: "An outstanding experience buying our holiday home in Benidorm. The team handled everything from viewings to paperwork with impressive ease.",
    },
    {
      ...BASE_REVIEWS[5],
      lang: "Dutch client",
      text: "A fantastic experience. Everything was arranged for us, from the NIE to the bank account and mortgage. We simply had to choose the right home.",
    },
  ],
  fr: [
    {
      ...BASE_REVIEWS[0],
      lang: "Cliente espagnole",
      text: "Un accompagnement remarquable. Nous avons trouvé la villa de nos rêves à Benidorm en moins d'un mois. L'équipe a été présente, efficace et très rassurante.",
    },
    {
      ...BASE_REVIEWS[1],
      lang: "Client allemand",
      text: "Nous avons trouvé l'appartement que nous cherchions sur la Costa Blanca. Le service multilingue était irréprochable et tout le processus a été parfaitement encadré.",
    },
    {
      ...BASE_REVIEWS[2],
      lang: "Client français",
      text: "Une expérience sans faute. Ils nous ont aidés à acheter un superbe penthouse à Altea, et le fait d'être accompagnés en français a tout changé.",
    },
    {
      ...BASE_REVIEWS[3],
      lang: "Client espagnol",
      text: "Une très belle sélection de biens haut de gamme. Le processus d'achat a été clair, rapide et mené avec beaucoup de sérieux.",
    },
    {
      ...BASE_REVIEWS[4],
      lang: "Cliente britannique",
      text: "Une expérience exceptionnelle pour l'achat de notre résidence secondaire à Benidorm. Les visites, les documents et le suivi ont été gérés avec une grande fluidité.",
    },
    {
      ...BASE_REVIEWS[5],
      lang: "Client néerlandais",
      text: "Une expérience fantastique. Tout a été pris en charge pour nous: NIE, compte bancaire, financement. Il ne nous restait plus qu'à choisir la bonne maison.",
    },
  ],
  de: [
    {
      ...BASE_REVIEWS[0],
      lang: "Spanische Kundin",
      text: "Ein hervorragender Service. Wir haben unsere Traumvilla in Benidorm in weniger als einem Monat gefunden. Das Team war jederzeit aufmerksam, professionell und verlaesslich.",
    },
    {
      ...BASE_REVIEWS[1],
      lang: "Deutscher Kunde",
      text: "Wir haben genau die Wohnung gefunden, die wir an der Costa Blanca gesucht haben. Der mehrsprachige Service war erstklassig und der gesamte Ablauf sehr gut organisiert.",
    },
    {
      ...BASE_REVIEWS[2],
      lang: "Franzoesischer Kunde",
      text: "Eine rundum gelungene Erfahrung. Sie haben uns geholfen, ein wunderschoenes Penthouse in Altea zu kaufen, und die Begleitung auf Franzoesisch war ein echter Pluspunkt.",
    },
    {
      ...BASE_REVIEWS[3],
      lang: "Spanischer Kunde",
      text: "Eine starke Auswahl an hochwertigen Immobilien. Der Kaufprozess war transparent, zuegig und professionell begleitet.",
    },
    {
      ...BASE_REVIEWS[4],
      lang: "Britische Kundin",
      text: "Eine herausragende Erfahrung beim Kauf unseres Ferienhauses in Benidorm. Von den Besichtigungen bis zur gesamten Dokumentation lief alles erstaunlich reibungslos.",
    },
    {
      ...BASE_REVIEWS[5],
      lang: "Niederlaendischer Kunde",
      text: "Eine fantastische Erfahrung. Alles wurde fuer uns organisiert: NIE, Bankkonto, Finanzierung. Wir mussten am Ende nur noch das richtige Zuhause waehlen.",
    },
  ],
};

const UI_COPY: Record<Language, { verified: string; countries: string }> = {
  es: {
    verified: `Basado en ${AGGREGATE.reviews} reseñas verificadas`,
    countries: "Clientes de 12+ países",
  },
  en: {
    verified: `Based on ${AGGREGATE.reviews} verified reviews`,
    countries: "Clients from 12+ countries",
  },
  fr: {
    verified: `Basé sur ${AGGREGATE.reviews} avis vérifiés`,
    countries: "Des clients dans plus de 12 pays",
  },
  de: {
    verified: `Basierend auf ${AGGREGATE.reviews} verifizierten Bewertungen`,
    countries: "Kunden aus mehr als 12 Laendern",
  },
};

const AGGREGATE = { rating: 4.9, reviews: 127 };

const Testimonials = () => {
  const { t, language } = useTranslation();
  const reviews = REVIEWS_BY_LANGUAGE[language] ?? BASE_REVIEWS;
  const ui = UI_COPY[language];

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
            {ui.verified}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <Globe className="w-3.5 h-3.5" />
            <span>{ui.countries}</span>
          </div>
        </div>

        {/* Reviews grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {reviews.map((review, i) => (
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
