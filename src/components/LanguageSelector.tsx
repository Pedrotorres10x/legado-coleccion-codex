import { Loader2 } from "lucide-react";
import { useTranslation, Language, LANGUAGE_LABELS } from "@/contexts/LanguageContext";
import { NativeSelect } from "@/components/ui/native-select";

const languages: Language[] = ["es", "en", "fr", "de"];

const FlagES = () => (
  <svg className="w-5 h-4 rounded-sm shrink-0" viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
    <rect width="640" height="480" fill="#c60b1e"/>
    <rect width="640" height="240" y="120" fill="#ffc400"/>
  </svg>
);

const FlagEN = () => (
  <svg className="w-5 h-4 rounded-sm shrink-0" viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
    <rect width="640" height="480" fill="#012169"/>
    <path d="M75 0l244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z" fill="#fff"/>
    <path d="M424 281l216 159v40L369 281h55zm-184 20l6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z" fill="#C8102E"/>
    <path d="M241 0v480h160V0H241zM0 160v160h640V160H0z" fill="#fff"/>
    <path d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z" fill="#C8102E"/>
  </svg>
);

const FlagFR = () => (
  <svg className="w-5 h-4 rounded-sm shrink-0" viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
    <rect width="213.3" height="480" fill="#002654"/>
    <rect width="213.3" height="480" x="213.3" fill="#fff"/>
    <rect width="213.3" height="480" x="426.6" fill="#CE1126"/>
  </svg>
);

const FlagDE = () => (
  <svg className="w-5 h-4 rounded-sm shrink-0" viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
    <rect width="640" height="160" fill="#000"/>
    <rect width="640" height="160" y="160" fill="#D00"/>
    <rect width="640" height="160" y="320" fill="#FFCE00"/>
  </svg>
);

const FLAGS: Record<Language, () => JSX.Element> = {
  es: FlagES,
  en: FlagEN,
  fr: FlagFR,
  de: FlagDE,
};

const LanguageSelector = () => {
  const { language, setLanguage, isTranslating } = useTranslation();
  const CurrentFlag = FLAGS[language];

  return (
    <div className="flex items-center gap-2">
      <div className="pointer-events-none flex items-center gap-2 text-sm font-medium text-foreground/80 tracking-wide">
        {isTranslating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CurrentFlag />
        )}
        <span className="uppercase">{language}</span>
      </div>
      <NativeSelect
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="h-9 min-w-[140px] bg-transparent text-sm font-medium text-foreground/80 hover:text-primary"
        aria-label="Seleccionar idioma"
      >
        {languages.map((lang) => {
          return (
            <option key={lang} value={lang}>
              {LANGUAGE_LABELS[lang]}
            </option>
          );
        })}
      </NativeSelect>
    </div>
  );
};

export default LanguageSelector;
