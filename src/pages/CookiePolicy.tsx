import { Link } from "react-router-dom";
import { Language, useTranslation } from "@/contexts/LanguageContext";

const DATE_LOCALES: Record<Language, string> = {
  es: "es-ES",
  en: "en-GB",
  fr: "fr-FR",
  de: "de-DE",
};

const CONTENT: Record<
  Language,
  {
    title: string;
    updated: string;
    sections: Array<{
      title: string;
      body?: string[];
      items?: string[];
    }>;
    moreInfoPrefix: string;
    moreInfoLink: string;
    back: string;
  }
> = {
  es: {
    title: "Politica de Cookies",
    updated: "Ultima actualizacion",
    sections: [
      {
        title: "1. Que son las cookies?",
        body: [
          "Las cookies son pequenos archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Se utilizan para recordar preferencias, mejorar la experiencia de navegacion y, en algunos casos, con fines analiticos.",
        ],
      },
      {
        title: "2. Cookies que utilizamos",
        body: [
          "Cookies tecnicas (necesarias): son imprescindibles para el funcionamiento del sitio web. Permiten la navegacion y el uso de funciones basicas como la sesion de usuario y las preferencias de idioma.",
        ],
        items: [
          "cookie_consent - Almacena tu preferencia de cookies. Duracion: 1 ano.",
          "language - Guarda la preferencia de idioma seleccionada. Duracion: sesion.",
          "Cookies analiticas (opcionales) - Nos permiten entender como los visitantes interactuan con el sitio web para mejorar su funcionamiento y contenido.",
        ],
      },
      {
        title: "3. Gestion de cookies",
        body: [
          "Puedes aceptar o rechazar las cookies no esenciales desde el banner que aparece al visitar nuestro sitio por primera vez. Tambien puedes configurar tu navegador para bloquear o eliminar cookies en cualquier momento.",
          "Ten en cuenta que desactivar algunas cookies puede afectar la funcionalidad del sitio web.",
        ],
      },
      {
        title: "4. Como eliminar cookies",
        body: [
          "Puedes eliminar las cookies almacenadas en tu navegador desde la configuracion de privacidad:",
        ],
        items: [
          "Chrome: Configuracion -> Privacidad y seguridad -> Cookies",
          "Firefox: Opciones -> Privacidad y seguridad -> Cookies",
          "Safari: Preferencias -> Privacidad -> Gestionar datos",
        ],
      },
      {
        title: "5. Mas informacion",
      },
    ],
    moreInfoPrefix: "Para mas informacion sobre el tratamiento de tus datos, consulta nuestra ",
    moreInfoLink: "Politica de Privacidad",
    back: "Volver al inicio",
  },
  en: {
    title: "Cookie Policy",
    updated: "Last updated",
    sections: [
      {
        title: "1. What are cookies?",
        body: [
          "Cookies are small text files stored on your device when you visit a website. They help remember preferences, improve your browsing experience and, in some cases, support analytics.",
        ],
      },
      {
        title: "2. Cookies we use",
        body: [
          "Strictly necessary cookies: these are essential for the website to function properly. They support navigation and core features such as user session handling and language preferences.",
        ],
        items: [
          "cookie_consent - Stores your cookie preference. Duration: 1 year.",
          "language - Stores your selected language preference. Duration: session.",
          "Analytics cookies (optional) - Help us understand how visitors use the website so we can improve performance and content.",
        ],
      },
      {
        title: "3. Managing cookies",
        body: [
          "You can accept or reject non-essential cookies through the banner shown when you first visit our website. You can also configure your browser to block or delete cookies at any time.",
          "Please note that disabling certain cookies may affect how the website works.",
        ],
      },
      {
        title: "4. How to delete cookies",
        body: [
          "You can remove cookies stored in your browser from its privacy settings:",
        ],
        items: [
          "Chrome: Settings -> Privacy and security -> Cookies",
          "Firefox: Options -> Privacy and security -> Cookies",
          "Safari: Preferences -> Privacy -> Manage website data",
        ],
      },
      {
        title: "5. Further information",
      },
    ],
    moreInfoPrefix: "For more information about how we process your data, please see our ",
    moreInfoLink: "Privacy Policy",
    back: "Back to home",
  },
  fr: {
    title: "Politique relative aux cookies",
    updated: "Derniere mise a jour",
    sections: [
      {
        title: "1. Que sont les cookies ?",
        body: [
          "Les cookies sont de petits fichiers texte enregistres sur votre appareil lorsque vous consultez un site web. Ils servent a memoriser certaines preferences, a ameliorer la navigation et, dans certains cas, a produire des statistiques.",
        ],
      },
      {
        title: "2. Les cookies que nous utilisons",
        body: [
          "Cookies techniques (necessaires) : ils sont indispensables au bon fonctionnement du site. Ils permettent la navigation et l'utilisation de fonctions essentielles comme la session utilisateur et la langue choisie.",
        ],
        items: [
          "cookie_consent - Enregistre votre choix en matiere de cookies. Duree : 1 an.",
          "language - Enregistre votre preference de langue. Duree : session.",
          "Cookies analytiques (facultatifs) - Nous aident a comprendre l'utilisation du site afin d'en ameliorer les performances et le contenu.",
        ],
      },
      {
        title: "3. Gestion des cookies",
        body: [
          "Vous pouvez accepter ou refuser les cookies non essentiels via le bandeau affiche lors de votre premiere visite. Vous pouvez egalement configurer votre navigateur pour bloquer ou supprimer les cookies a tout moment.",
          "Veuillez noter que la desactivation de certains cookies peut affecter le bon fonctionnement du site.",
        ],
      },
      {
        title: "4. Comment supprimer les cookies",
        body: [
          "Vous pouvez supprimer les cookies enregistres dans votre navigateur a partir de ses parametres de confidentialite :",
        ],
        items: [
          "Chrome : Parametres -> Confidentialite et securite -> Cookies",
          "Firefox : Options -> Vie privee et securite -> Cookies",
          "Safari : Preferences -> Confidentialite -> Gerer les donnees",
        ],
      },
      {
        title: "5. Informations complementaires",
      },
    ],
    moreInfoPrefix: "Pour en savoir plus sur le traitement de vos donnees, consultez notre ",
    moreInfoLink: "Politique de confidentialite",
    back: "Retour a l'accueil",
  },
  de: {
    title: "Cookie-Richtlinie",
    updated: "Letzte Aktualisierung",
    sections: [
      {
        title: "1. Was sind Cookies?",
        body: [
          "Cookies sind kleine Textdateien, die auf Ihrem Geraet gespeichert werden, wenn Sie eine Website besuchen. Sie helfen dabei, Einstellungen zu speichern, die Nutzung zu verbessern und in manchen Faellen statistische Auswertungen zu ermoeglichen.",
        ],
      },
      {
        title: "2. Welche Cookies wir verwenden",
        body: [
          "Technisch notwendige Cookies: Diese sind fuer den Betrieb der Website erforderlich. Sie ermoeglichen die Navigation und grundlegende Funktionen wie Benutzersitzung und Spracheinstellungen.",
        ],
        items: [
          "cookie_consent - Speichert Ihre Cookie-Auswahl. Dauer: 1 Jahr.",
          "language - Speichert Ihre gewaehlte Sprache. Dauer: Sitzung.",
          "Analyse-Cookies (optional) - Helfen uns zu verstehen, wie Besucher die Website nutzen, damit wir Inhalte und Funktion laufend verbessern koennen.",
        ],
      },
      {
        title: "3. Verwaltung von Cookies",
        body: [
          "Sie koennen nicht notwendige Cookies ueber das Banner akzeptieren oder ablehnen, das beim ersten Besuch unserer Website angezeigt wird. Zudem koennen Sie Cookies jederzeit in Ihrem Browser blockieren oder loeschen.",
          "Bitte beachten Sie, dass die Deaktivierung bestimmter Cookies die Funktionalitaet der Website beeintraechtigen kann.",
        ],
      },
      {
        title: "4. So loeschen Sie Cookies",
        body: [
          "Gespeicherte Cookies koennen Sie ueber die Datenschutzeinstellungen Ihres Browsers entfernen:",
        ],
        items: [
          "Chrome: Einstellungen -> Datenschutz und Sicherheit -> Cookies",
          "Firefox: Einstellungen -> Datenschutz und Sicherheit -> Cookies",
          "Safari: Einstellungen -> Datenschutz -> Website-Daten verwalten",
        ],
      },
      {
        title: "5. Weitere Informationen",
      },
    ],
    moreInfoPrefix: "Weitere Informationen zur Verarbeitung Ihrer Daten finden Sie in unserer ",
    moreInfoLink: "Datenschutzerklaerung",
    back: "Zur Startseite",
  },
};

const CookiePolicy = () => {
  const { language } = useTranslation();
  const content = CONTENT[language];

  return (
    <main className="min-h-screen bg-background pt-28 pb-20">
      <div className="container max-w-3xl">
        <h1 className="font-serif text-4xl font-bold mb-8 text-foreground">{content.title}</h1>

        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground text-sm leading-relaxed">
          <p>{content.updated}: {new Date().toLocaleDateString(DATE_LOCALES[language])}</p>

          {content.sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-serif text-xl font-semibold text-foreground mt-8">{section.title}</h2>
              {section.body?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.items && (
                <ul className="list-disc pl-6 space-y-1">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <p>
            {content.moreInfoPrefix}
            <Link to="/privacidad" className="text-primary hover:underline">
              {content.moreInfoLink}
            </Link>.
          </p>
        </div>

        <div className="mt-12">
          <Link to="/" className="text-primary hover:underline text-sm">{"<-"} {content.back}</Link>
        </div>
      </div>
    </main>
  );
};

export default CookiePolicy;
