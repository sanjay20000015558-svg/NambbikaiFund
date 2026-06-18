import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

const supportedLanguages = [
  'en', 'hi', 'ta', 'te', 'ml', 'kn', 'bn', 'mr', 'gu', 'pa', 'ur'
];

// Get backend URL for loading translations
const getBackendUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL?.replace('/api', '') || '';
  }
  return '';
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: supportedLanguages,
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'nambikkai_lang',
    },

    backend: {
      loadPath: `${getBackendUrl()}/locales/{{lng}}/translation.json`,
    },

    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
    },

    ns: ['translation'],
    defaultNS: 'translation',
  });

export const changeLanguage = (lng) => {
  return i18n.changeLanguage(lng);
};

export const getCurrentLanguage = () => {
  return i18n.language;
};

export const isRtlLanguage = (lng) => {
  const rtlLanguages = ['ur', 'ar', 'fa', 'he'];
  return rtlLanguages.includes(lng);
};

export { supportedLanguages };
export default i18n;