import { useLanguage } from "../i18n/LanguageContext";

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="language-toggle">
      <button
        className={lang === "hu" ? "active" : ""}
        onClick={() => setLang("hu")}
      >
        HU
      </button>
      <button
        className={lang === "en" ? "active" : ""}
        onClick={() => setLang("en")}
      >
        EN
      </button>
    </div>
  );
}
