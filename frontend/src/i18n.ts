import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/publicTrace.json';
import hi from './locales/hi/publicTrace.json';

void i18n.use(initReactI18next).init({
  resources: {
    en: { publicTrace: en },
    hi: { publicTrace: hi },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
