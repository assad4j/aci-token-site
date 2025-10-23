// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from './locales/en/translation.json';
import translationFR from './locales/fr/translation.json';
import translationES from './locales/es/translation.json';
import translationDE from './locales/de/translation.json';
import translationPT from './locales/pt/translation.json';
import translationAR from './locales/ar/translation.json';

// 1. Vérifie s'il y a déjà une langue choisie
const savedLng = localStorage.getItem('i18nextLng');

// 2. Détermine la langue par défaut
const browserLang = navigator.language.split('-')[0];
const supportedLangs = ['en', 'fr', 'es', 'de', 'pt', 'ar'];
const defaultLng = savedLng || (supportedLangs.includes(browserLang) ? browserLang : 'en');

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translationEN },
      fr: { translation: translationFR },
      es: { translation: translationES },
      de: { translation: translationDE },
      pt: { translation: translationPT },
      ar: { translation: translationAR },
    },
    lng: defaultLng,         // on part de la langue sauvegardée ou du navigateur
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

const rtlLangs = new Set(['ar']);

i18n.on('languageChanged', lng => {
  document.documentElement.dir = rtlLangs.has(lng) ? 'rtl' : 'ltr';
});

document.documentElement.dir = rtlLangs.has(i18n.language) ? 'rtl' : 'ltr';

export default i18n;
