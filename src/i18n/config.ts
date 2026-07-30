import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import id from './locales/id.json'
import en from './locales/en.json'

export const SUPPORTED_LOCALES = ['id', 'en'] as const
export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

export const resources = {
  id: { translation: id },
  en: { translation: en },
} as const

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'id',
    supportedLngs: [...SUPPORTED_LOCALES],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: 'edulite-language',
      caches: ['localStorage'],
    },
  })

export default i18n
