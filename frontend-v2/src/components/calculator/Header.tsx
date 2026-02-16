import { useLanguage } from '../../i18n/LanguageContext.tsx';

export default function Header() {
  const { lang, t, toggleLanguage } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-blue-600">
            {t('app.title')}
          </h1>
          <p className="text-xs text-gray-500">{t('app.subtitle')}</p>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => {
              if (lang !== 'hu') toggleLanguage();
            }}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              lang === 'hu'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            aria-label="Magyar nyelv"
          >
            HU
          </button>
          <button
            type="button"
            onClick={() => {
              if (lang !== 'en') toggleLanguage();
            }}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              lang === 'en'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            aria-label="English language"
          >
            EN
          </button>
        </div>
      </div>
    </header>
  );
}
