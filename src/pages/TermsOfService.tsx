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
    idTitle: string;
    addressLabel: string;
    phoneLabel: string;
    sections: Array<{
      title: string;
      body: string[];
    }>;
    back: string;
  }
> = {
  es: {
    title: "Aviso Legal",
    updated: "Ultima actualizacion",
    idTitle: "Datos identificativos",
    addressLabel: "Domicilio",
    phoneLabel: "Telefono",
    sections: [
      {
        title: "2. Objeto",
        body: ["Este sitio web tiene como finalidad la promocion y comercializacion de propiedades inmobiliarias en la Costa Blanca, asi como facilitar el contacto con potenciales compradores o arrendatarios."],
      },
      {
        title: "3. Propiedad intelectual",
        body: ["Todos los contenidos de este sitio web, incluidos textos, imagenes, logotipos, diseno grafico y codigo fuente, estan protegidos por la normativa de propiedad intelectual e industrial. Queda prohibida su reproduccion, distribucion o transformacion sin autorizacion expresa."],
      },
      {
        title: "4. Limitacion de responsabilidad",
        body: ["Legado Inmobiliaria no se hace responsable de posibles errores u omisiones en los contenidos publicados ni de la disponibilidad o continuidad del acceso al sitio web. Los precios y caracteristicas de las propiedades son orientativos y pueden modificarse."],
      },
      {
        title: "5. Enlaces externos",
        body: ["Este sitio web puede incluir enlaces a paginas de terceros sobre las que Legado Inmobiliaria no ejerce control y, por tanto, no asume responsabilidad por sus contenidos ni por sus politicas de privacidad."],
      },
      {
        title: "6. Legislacion aplicable",
        body: ["Cualquier controversia derivada del uso de este sitio web quedara sometida a los juzgados y tribunales de Benidorm, Alicante, Espana, conforme a la legislacion espanola."],
      },
    ],
    back: "Volver al inicio",
  },
  en: {
    title: "Legal Notice",
    updated: "Last updated",
    idTitle: "Identification details",
    addressLabel: "Registered address",
    phoneLabel: "Phone",
    sections: [
      {
        title: "2. Purpose",
        body: ["This website is intended to promote and market real-estate properties on the Costa Blanca and to facilitate contact with prospective buyers or tenants."],
      },
      {
        title: "3. Intellectual property",
        body: ["All content on this website, including text, images, logos, graphic design and source code, is protected by intellectual and industrial property laws. Reproduction, distribution or modification without prior authorisation is prohibited."],
      },
      {
        title: "4. Limitation of liability",
        body: ["Legado Inmobiliaria accepts no liability for any errors or omissions in the published content, nor for the availability or continuity of access to the website. Property prices and features are indicative only and may change."],
      },
      {
        title: "5. External links",
        body: ["This website may include links to third-party websites over which Legado Inmobiliaria has no control and therefore accepts no responsibility for their content or privacy practices."],
      },
      {
        title: "6. Applicable law",
        body: ["Any dispute arising from the use of this website shall be subject to the courts of Benidorm, Alicante, Spain, and governed by Spanish law."],
      },
    ],
    back: "Back to home",
  },
  fr: {
    title: "Mentions legales",
    updated: "Derniere mise a jour",
    idTitle: "Informations d'identification",
    addressLabel: "Adresse",
    phoneLabel: "Telephone",
    sections: [
      {
        title: "2. Objet",
        body: ["Ce site web a pour objet la promotion et la commercialisation de biens immobiliers sur la Costa Blanca, ainsi que la mise en relation avec de potentiels acheteurs ou locataires."],
      },
      {
        title: "3. Propriete intellectuelle",
        body: ["L'ensemble des contenus de ce site, notamment les textes, images, logos, elements graphiques et code source, est protege par la legislation sur la propriete intellectuelle et industrielle. Toute reproduction, diffusion ou modification sans autorisation expresse est interdite."],
      },
      {
        title: "4. Limitation de responsabilite",
        body: ["Legado Inmobiliaria ne saurait etre tenue responsable d'eventuelles erreurs ou omissions dans les contenus publies, ni d'une indisponibilite ou interruption d'acces au site. Les prix et caracteristiques des biens sont fournis a titre indicatif et peuvent etre modifies."],
      },
      {
        title: "5. Liens externes",
        body: ["Ce site peut contenir des liens vers des sites tiers sur lesquels Legado Inmobiliaria n'exerce aucun controle. En consequence, aucune responsabilite n'est assume e quant a leur contenu ou a leur politique de confidentialite."],
      },
      {
        title: "6. Droit applicable",
        body: ["Tout litige resultant de l'utilisation de ce site releve de la competence des tribunaux de Benidorm, Alicante, Espagne, et sera regi par le droit espagnol."],
      },
    ],
    back: "Retour a l'accueil",
  },
  de: {
    title: "Impressum",
    updated: "Letzte Aktualisierung",
    idTitle: "Identifikationsangaben",
    addressLabel: "Anschrift",
    phoneLabel: "Telefon",
    sections: [
      {
        title: "2. Zweck",
        body: ["Diese Website dient der Praesentation und Vermarktung von Immobilien an der Costa Blanca sowie der Kontaktaufnahme mit potenziellen Kaeufern oder Mietinteressenten."],
      },
      {
        title: "3. Geistiges Eigentum",
        body: ["Sae mtliche Inhalte dieser Website, einschliesslich Texte, Bilder, Logos, grafische Gestaltung und Quellcode, sind durch Vorschriften zum geistigen und gewerblichen Eigentum geschuetzt. Eine Vervielfaeltigung, Verbreitung oder Bearbeitung ohne ausdrueckliche Genehmigung ist unzulaessig."],
      },
      {
        title: "4. Haftungsbeschraenkung",
        body: ["Legado Inmobiliaria uebernimmt keine Haftung fuer moegliche Fehler oder Auslassungen in den veroeffentlichten Inhalten sowie fuer die Verfuegbarkeit oder Kontinuitaet des Websitezugangs. Preise und Merkmale der Immobilien dienen nur zur Orientierung und koennen sich aendern."],
      },
      {
        title: "5. Externe Links",
        body: ["Diese Website kann Links zu Websites Dritter enthalten, auf deren Inhalte oder Datenschutzpraktiken Legado Inmobiliaria keinen Einfluss hat und fuer die daher keine Verantwortung uebernommen wird."],
      },
      {
        title: "6. Anwendbares Recht",
        body: ["Fuer alle Streitigkeiten aus der Nutzung dieser Website sind die Gerichte in Benidorm, Alicante, Spanien, zustaendig. Es gilt spanisches Recht."],
      },
    ],
    back: "Zur Startseite",
  },
};

const TermsOfService = () => {
  const { language } = useTranslation();
  const content = CONTENT[language];

  return (
    <main className="min-h-screen bg-background pt-28 pb-20">
      <div className="container max-w-3xl">
        <h1 className="font-serif text-4xl font-bold mb-8 text-foreground">{content.title}</h1>

        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground text-sm leading-relaxed">
          <p>{content.updated}: {new Date().toLocaleDateString(DATE_LOCALES[language])}</p>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mt-8">1. {content.idTitle}</h2>
            <p>
              <strong className="text-foreground">Legado Inmobiliaria</strong><br />
              {content.addressLabel}: C/ Esperanto 15, 03501 Benidorm, Alicante, Espana<br />
              {content.phoneLabel}: +34 965 065 921
            </p>
          </section>

          {content.sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-serif text-xl font-semibold text-foreground mt-8">{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </div>

        <div className="mt-12">
          <Link to="/" className="text-primary hover:underline text-sm">{"<-"} {content.back}</Link>
        </div>
      </div>
    </main>
  );
};

export default TermsOfService;
