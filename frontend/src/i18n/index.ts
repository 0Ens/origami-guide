import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import { en } from './locales/en'
import { tr } from './locales/tr'

export const SUPPORTED_LANGUAGES = ['tr', 'en'] as const
export type Language = (typeof SUPPORTED_LANGUAGES)[number]

void i18n
  .use(LanguageDetector) // 1. saved choice (localStorage), 2. browser language
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, tr: { translation: tr } },
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true, // "tr-TR" -> "tr"
    fallbackLng: 'en',
    interpolation: { escapeValue: false }, // React already escapes output
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'origami.language',
      caches: ['localStorage'],
    },
  })

// Keep <html lang> in sync for screen readers and correct hyphenation.
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
})

export function currentLanguage(): Language {
  const lng = i18n.resolvedLanguage
  return lng === 'tr' ? 'tr' : 'en'
}

export default i18n
