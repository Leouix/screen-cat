import { Platform } from 'react-native'

const DEV_FALLBACK = Platform.select({
  android: 'http://10.0.2.2:8080',
  default: 'http://localhost:8080',
})

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEV_FALLBACK

// Default app locale. Single source of truth for both the initial UI language
// and the backend locale prefix (see localizePath). 'ru' or 'en'.
export const DEFAULT_LOCALE = process.env.EXPO_PUBLIC_LOCALE || 'ru'

let currentLocale = DEFAULT_LOCALE

// Kept in sync with the active i18n language so every request targets the
// matching backend locale without threading the language through call sites.
export function setApiLocale(locale) {
  currentLocale = locale || DEFAULT_LOCALE
}

export function getApiLocale() {
  return currentLocale
}

// Backend locale prefix: English lives under /api/v1 (empty prefix), Russian
// under /ru/api/v1.
export function localizePath(locale = currentLocale) {
  return !locale || locale === 'en' ? '' : `/${locale}`
}

export const API_TIMEOUT_MS = 10000

export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || ''
