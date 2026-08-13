import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { GOOGLE_WEB_CLIENT_ID } from '../config'

GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID })

export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
  const result = await GoogleSignin.signIn()

  if (result.type === 'cancelled') {
    return { cancelled: true }
  }

  const userInfo = result.data
  if (!userInfo.idToken) {
    throw new Error('No Google ID token received')
  }

  return {
    cancelled: false,
    idToken: userInfo.idToken,
    user: {
      name: userInfo.user?.name || '',
      email: userInfo.user?.email || '',
    },
  }
}

export async function googleSignOut() {
  try {
    await GoogleSignin.signOut()
  } catch {}
}

export async function isGoogleSignedIn() {
  try {
    return await GoogleSignin.isSignedIn()
  } catch {
    return false
  }
}
