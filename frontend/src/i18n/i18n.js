import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

const supportedLanguages = [
  'en', 'hi', 'ta', 'te', 'ml', 'kn', 'bn', 'mr', 'gu', 'pa', 'ur'
];

// Load English resources synchronously as fallback
const enResources = {
  translation: {
    "welcome": "Welcome to Nambikkai Fund",
    "slogan": "Give Hope, Save Lives",
    "donate": "Donate",
    "loading": "Loading...",
    "login": "Login",
    "register": "Register",
    "navbar": {
      "brand": "Nambikkai Fund",
      "tagline": "Hope for Every Patient"
    }
  }
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
      loadPath: '/locales/{{lng}}/translation.json',
      requestOptions: {
        cache: 'no-store',
      },
    },

    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
    },

    ns: ['translation'],
    defaultNS: 'translation',

    // Return the key itself as fallback if translation not found
    returnNull: false,
    returnEmptyString: false,
    returnKeyPrefix: false,
  });

// Load English fallback immediately for SSR/SSG compatibility
i18n.addResourceBundle('en', 'translation', enResources.translation, true, true);

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