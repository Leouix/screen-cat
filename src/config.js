import { Platform } from 'react-native'

const DEV_FALLBACK = Platform.select({
  android: 'http://10.0.2.2:8080',
  default: 'http://localhost:8080',
})

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEV_FALLBACK

// Locale path prefix of the backend routes: '/ru' for the Russian store build,
// empty (English) for the Google Play build.
export const LOCALIZE_PATH_API = process.env.EXPO_PUBLIC_LOCALIZE_PATH_API || ''

export const API_TIMEOUT_MS = 10000

export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || ''
