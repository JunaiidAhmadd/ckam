import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { API_ENDPOINTS, buildApiUrl } from '../../../src/api/endpoints';

const I18nContext = createContext(null);

function getNestedValue(source, key) {
  return key.split('.').reduce((value, part) => {
    if (value && Object.prototype.hasOwnProperty.call(value, part)) return value[part];
    return undefined;
  }, source);
}

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(() => localStorage.getItem('language') || 'en');
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    let cancelled = false;
    const localeUrl = buildApiUrl(API_ENDPOINTS.i18n.localeFile(language));

    fetch(localeUrl, { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) setTranslations(data);
      })
      .catch(() => {
        if (!cancelled) setTranslations({});
      });

    return () => {
      cancelled = true;
    };
  }, [language]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', language === 'ar');
  }, [language]);

  const value = useMemo(() => {
    const setLanguage = (nextLanguage) => {
      localStorage.setItem('language', nextLanguage);
      setLanguageState(nextLanguage);
    };

    const t = (key, fallback = key) => getNestedValue(translations, key) ?? fallback;

    return { language, isRtl: language === 'ar', setLanguage, t };
  }, [language, translations]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider');
  return context;
}
