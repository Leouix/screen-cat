import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { DEFAULT_LOCALE, setApiLocale } from '../config'
import { loadSetting, saveSetting } from '../services/db'
import en from './locales/en'
import ru from './locales/ru'

export const LOCALE_KEY = 'locale'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
  },
  lng: DEFAULT_LOCALE,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
})

setApiLocale(DEFAULT_LOCALE)

i18n.on('languageChanged', (lang) => {
  setApiLocale(lang)
  saveSetting(LOCALE_KEY, lang).catch(() => {})
})

// Restores the persisted language and falls back to the env default, saving it
// on first launch so the choice survives restarts.
export async function initI18n() {
  const saved = await loadSetting(LOCALE_KEY)
  const locale = saved || DEFAULT_LOCALE
  if (locale !== i18n.language) await i18n.changeLanguage(locale)
  if (!saved) await saveSetting(LOCALE_KEY, locale)
  return locale
}

export default i18n
