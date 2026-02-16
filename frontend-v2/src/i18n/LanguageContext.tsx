// =============================================================================
// PalliCalc v2.0 — Language Context Provider
// Provides bilingual (HU/EN) translation support with interpolation.
// Hungarian is the default language. Persists choice in localStorage.
// =============================================================================

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import hu from './hu';
import en from './en';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Language = 'hu' | 'en';

export interface LanguageContextType {
  /** Current active language. */
  lang: Language;
  /**
   * Translate a key with optional interpolation parameters.
   *
   * Interpolation replaces `{placeholder}` tokens in the translation template
   * with the corresponding value from the `params` object.
   *
   * Lookup order:
   * 1. Current language translations
   * 2. Fallback language translations (the other language)
   * 3. The raw key string itself (so missing keys are visible during dev)
   *
   * @example
   * t('results.totalOme', { value: 270 })
   * // hu -> "Jelenlegi osszes OME: 270 mg/nap"
   */
  t: (key: string, params?: Record<string, string | number>) => string;
  /** Toggle between HU and EN. */
  toggleLanguage: () => void;
  /** Set language explicitly. */
  setLanguage: (lang: Language) => void;
}

// ---------------------------------------------------------------------------
// Translation dictionaries indexed by language
// ---------------------------------------------------------------------------

const translations: Record<Language, Record<string, string>> = {
  hu,
  en,
};

// ---------------------------------------------------------------------------
// localStorage key
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'pallicalc-lang';

/**
 * Read the persisted language from localStorage.
 * Falls back to 'hu' (Hungarian) if not set or invalid.
 */
function getPersistedLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'hu' || stored === 'en') {
      return stored;
    }
  } catch {
    // localStorage may be unavailable (private browsing, SSR)
  }
  return 'hu';
}

/**
 * Persist the language choice to localStorage.
 */
function persistLanguage(lang: Language): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Silently ignore localStorage errors
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const LanguageContext = createContext<LanguageContextType | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [lang, setLangState] = useState<Language>(getPersistedLanguage);

  // Determine the fallback language (the other one)
  const fallbackLang: Language = lang === 'hu' ? 'en' : 'hu';

  const setLanguage = useCallback((newLang: Language) => {
    setLangState(newLang);
    persistLanguage(newLang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLangState((prev) => {
      const next: Language = prev === 'hu' ? 'en' : 'hu';
      persistLanguage(next);
      return next;
    });
  }, []);

  /**
   * Core translation function.
   *
   * 1. Look up key in the active language dictionary.
   * 2. If missing, look up key in the fallback language dictionary.
   * 3. If still missing, return the key itself as a fallback (aids debugging).
   * 4. Replace `{placeholder}` tokens with values from `params`.
   */
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      // Resolve template string
      let template: string =
        translations[lang][key] ??
        translations[fallbackLang][key] ??
        key;

      // Interpolation: replace {placeholder} with param values
      if (params) {
        template = template.replace(
          /\{(\w+)\}/g,
          (match, placeholder: string) => {
            const value = params[placeholder];
            return value !== undefined && value !== null
              ? String(value)
              : match; // Keep original {placeholder} if param missing
          },
        );
      }

      return template;
    },
    [lang, fallbackLang],
  );

  const contextValue = useMemo<LanguageContextType>(
    () => ({
      lang,
      t,
      toggleLanguage,
      setLanguage,
    }),
    [lang, t, toggleLanguage, setLanguage],
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Access the language context from any component.
 *
 * @throws Error if called outside a LanguageProvider.
 *
 * @example
 * const { t, lang, toggleLanguage } = useLanguage();
 * return <p>{t('app.title')}</p>;
 */
export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error(
      'useLanguage() must be used within a <LanguageProvider>. ' +
        'Wrap your app (or the relevant subtree) with <LanguageProvider>.',
    );
  }
  return ctx;
}

export default LanguageContext;
