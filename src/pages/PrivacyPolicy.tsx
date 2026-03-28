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
    controller: string;
    addressLabel: string;
    phoneLabel: string;
    sections: Array<{
      title: string;
      body?: string[];
      items?: string[];
    }>;
    back: string;
  }
> = {
  es: {
    title: "Politica de Privacidad",
    updated: "Ultima actualizacion",
    controller: "Responsable del tratamiento",
    addressLabel: "Direccion",
    phoneLabel: "Telefono",
    sections: [
      {
        title: "2. Datos que recopilamos",
        body: ["Recopilamos los datos personales que nos proporcionas voluntariamente a traves de nuestros formularios de contacto:"],
        items: ["Nombre completo", "Direccion de correo electronico", "Numero de telefono", "Mensaje o consulta", "Propiedad de interes"],
      },
      {
        title: "3. Finalidad del tratamiento",
        body: ["Los datos recogidos se utilizan para:"],
        items: [
          "Atender y responder a tus consultas inmobiliarias",
          "Gestionar solicitudes de informacion sobre propiedades",
          "Enviar informacion comercial sobre nuestros servicios, solo con consentimiento previo",
        ],
      },
      {
        title: "4. Base legal",
        body: [
          "El tratamiento de tus datos se basa en tu consentimiento expreso al rellenar nuestros formularios, asi como en nuestro interes legitimo en responder a tu solicitud conforme al articulo 6.1.a y 6.1.f del RGPD.",
        ],
      },
      {
        title: "5. Conservacion de datos",
        body: [
          "Tus datos personales se conservaran mientras sean necesarios para la finalidad para la que fueron recogidos y durante los plazos legalmente exigidos.",
        ],
      },
      {
        title: "6. Derechos del interesado",
        body: [
          "Puedes ejercer tus derechos de acceso, rectificacion, supresion, limitacion, portabilidad y oposicion contactandonos en la direccion indicada en esta politica.",
        ],
      },
      {
        title: "7. Seguridad",
        body: [
          "Aplicamos medidas tecnicas y organizativas adecuadas para proteger tus datos personales frente a accesos no autorizados, alteracion, perdida o destruccion.",
        ],
      },
    ],
    back: "Volver al inicio",
  },
  en: {
    title: "Privacy Policy",
    updated: "Last updated",
    controller: "Data controller",
    addressLabel: "Address",
    phoneLabel: "Phone",
    sections: [
      {
        title: "2. Data we collect",
        body: ["We collect the personal data you voluntarily provide through our contact forms:"],
        items: ["Full name", "Email address", "Phone number", "Message or enquiry", "Property of interest"],
      },
      {
        title: "3. Purpose of processing",
        body: ["We use the data collected to:"],
        items: [
          "Respond to your real-estate enquiries",
          "Manage requests for information about properties",
          "Send service-related marketing communications, only where prior consent has been given",
        ],
      },
      {
        title: "4. Legal basis",
        body: [
          "We process your data on the basis of your explicit consent when submitting our forms, as well as our legitimate interest in responding to your request, in line with Article 6.1.a and 6.1.f of the GDPR.",
        ],
      },
      {
        title: "5. Data retention",
        body: [
          "Your personal data will be kept only for as long as necessary to fulfil the purpose for which it was collected and for any legally required retention periods.",
        ],
      },
      {
        title: "6. Your rights",
        body: [
          "You may exercise your rights of access, rectification, erasure, restriction, portability and objection by contacting us using the details provided in this policy.",
        ],
      },
      {
        title: "7. Security",
        body: [
          "We apply appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, loss or destruction.",
        ],
      },
    ],
    back: "Back to home",
  },
  fr: {
    title: "Politique de confidentialite",
    updated: "Derniere mise a jour",
    controller: "Responsable du traitement",
    addressLabel: "Adresse",
    phoneLabel: "Telephone",
    sections: [
      {
        title: "2. Donnees collecte es",
        body: ["Nous collectons les donnees personnelles que vous nous transmettez volontairement via nos formulaires de contact :"],
        items: ["Nom et prenom", "Adresse e-mail", "Numero de telephone", "Message ou demande", "Bien qui vous interesse"],
      },
      {
        title: "3. Finalites du traitement",
        body: ["Les donnees recueillies sont utilisees pour :"],
        items: [
          "Repondre a vos demandes immobilieres",
          "Gerer les demandes d'information concernant des biens",
          "Vous adresser des communications commerciales liees a nos services, uniquement avec votre consentement prealable",
        ],
      },
      {
        title: "4. Base juridique",
        body: [
          "Le traitement de vos donnees repose sur votre consentement explicite lorsque vous remplissez nos formulaires, ainsi que sur notre interet legitime a repondre a votre demande, conformement a l'article 6.1.a et 6.1.f du RGPD.",
        ],
      },
      {
        title: "5. Duree de conservation",
        body: [
          "Vos donnees personnelles sont conservees pendant la duree necessaire a la finalite pour laquelle elles ont ete collecte es et pendant toute periode imposee par la legislation applicable.",
        ],
      },
      {
        title: "6. Vos droits",
        body: [
          "Vous pouvez exercer vos droits d'acces, de rectification, d'effacement, de limitation, de portabilite et d'opposition en nous contactant aux coordonnees indiquees dans la presente politique.",
        ],
      },
      {
        title: "7. Securite",
        body: [
          "Nous mettons en oeuvre des mesures techniques et organisationnelles appropriees afin de proteger vos donnees personnelles contre tout acces non autorise, alteration, perte ou destruction.",
        ],
      },
    ],
    back: "Retour a l'accueil",
  },
  de: {
    title: "Datenschutzerklaerung",
    updated: "Letzte Aktualisierung",
    controller: "Verantwortlicher",
    addressLabel: "Anschrift",
    phoneLabel: "Telefon",
    sections: [
      {
        title: "2. Welche Daten wir erheben",
        body: ["Wir erheben die personenbezogenen Daten, die Sie uns freiwillig ueber unsere Kontaktformulare zur Verfuegung stellen:"],
        items: ["Vollstaendiger Name", "E-Mail-Adresse", "Telefonnummer", "Nachricht oder Anfrage", "Immobilie von Interesse"],
      },
      {
        title: "3. Zweck der Verarbeitung",
        body: ["Die erhobenen Daten verwenden wir, um:"],
        items: [
          "Ihre Immobilienanfragen zu beantworten",
          "Anfragen zu bestimmten Immobilien zu bearbeiten",
          "Marketingbezogene Informationen zu unseren Leistungen zu senden, sofern zuvor eine Einwilligung erteilt wurde",
        ],
      },
      {
        title: "4. Rechtsgrundlage",
        body: [
          "Die Verarbeitung Ihrer Daten beruht auf Ihrer ausdruecklichen Einwilligung bei der Uebermittlung unserer Formulare sowie auf unserem berechtigten Interesse, Ihre Anfrage zu beantworten, gemaess Artikel 6.1.a und 6.1.f DSGVO.",
        ],
      },
      {
        title: "5. Speicherdauer",
        body: [
          "Ihre personenbezogenen Daten werden nur so lange gespeichert, wie es fuer den jeweiligen Zweck erforderlich ist und wie es gesetzliche Aufbewahrungspflichten vorsehen.",
        ],
      },
      {
        title: "6. Ihre Rechte",
        body: [
          "Sie koennen Ihre Rechte auf Auskunft, Berichtigung, Loeschung, Einschraenkung, Datenuebertragbarkeit und Widerspruch ausueben, indem Sie uns ueber die in dieser Erklaerung angegebenen Kontaktdaten erreichen.",
        ],
      },
      {
        title: "7. Sicherheit",
        body: [
          "Wir setzen angemessene technische und organisatorische Massnahmen ein, um Ihre personenbezogenen Daten vor unbefugtem Zugriff, Veraenderung, Verlust oder Zerstoerung zu schuetzen.",
        ],
      },
    ],
    back: "Zur Startseite",
  },
};

const PrivacyPolicy = () => {
  const { language } = useTranslation();
  const content = CONTENT[language];

  return (
    <main className="min-h-screen bg-background pt-28 pb-20">
      <div className="container max-w-3xl">
        <h1 className="font-serif text-4xl font-bold mb-8 text-foreground">{content.title}</h1>

        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground text-sm leading-relaxed">
          <p>{content.updated}: {new Date().toLocaleDateString(DATE_LOCALES[language])}</p>

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground mt-8">1. {content.controller}</h2>
            <p>
              <strong className="text-foreground">Legado Inmobiliaria</strong><br />
              {content.addressLabel}: C/ Esperanto 15, 03501 Benidorm, Alicante, Espana<br />
              {content.phoneLabel}: +34 965 065 921
            </p>
          </section>

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
        </div>

        <div className="mt-12">
          <Link to="/" className="text-primary hover:underline text-sm">{"<-"} {content.back}</Link>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
