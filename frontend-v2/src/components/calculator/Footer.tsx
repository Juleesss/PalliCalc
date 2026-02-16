import { useLanguage } from '../../i18n/LanguageContext.tsx';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="max-w-2xl mx-auto px-4 py-6">
      <p className="text-xs text-gray-400 text-center leading-relaxed">
        {t('app.disclaimer')}
      </p>
    </footer>
  );
}
