import { Platform } from 'react-native'

const DEV_FALLBACK = Platform.select({
  android: 'http://10.0.2.2:8080',
  default: 'http://localhost:8080',
})

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEV_FALLBACK

export const API_TIMEOUT_MS = 10000
