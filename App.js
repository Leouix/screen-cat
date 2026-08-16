import { useCallback, useEffect, useRef, useState } from 'react'
import { BackHandler } from 'react-native'
import { TamaguiProvider, YStack } from 'tamagui'
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat'
import config from './tamagui.config'
import SplashScreen from './src/screens/SplashScreen'
import BirthDateScreen from './src/screens/BirthDateScreen'
import NameScreen from './src/screens/NameScreen'
import EarthWithCity from './src/screens/EarthWithCity'
import PredictionScreen from './src/screens/PredictionScreen'
import BurgerMenu from './src/components/BurgerMenu'
import { loadAuth, clearAuth, loadProfile, saveProfile } from './src/services/db'
import { googleSignOut } from './src/services/auth'

const SCREEN_ORDER = ['splash', 'birthDate', 'name', 'city', 'prediction']

const SPLASH_MIN_MS = 1600

export default function App() {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  })

  const [screen, setScreen] = useState('splash')
  const [birthDate, setBirthDate] = useState('')
  const [birthTime, setBirthTime] = useState('')
  const [name, setName] = useState('')
  const [selectedCity, setSelectedCity] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(null)
  const [storedProfile, setStoredProfile] = useState(null)
  const mountTimeRef = useRef(Date.now())
  const splashHandledRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([loadAuth(), loadProfile()]).then(([auth, profile]) => {
      if (cancelled) return
      setIsLoggedIn(!!auth?.token)
      setStoredProfile(profile)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const splashReady = fontsLoaded && isLoggedIn !== null

  useEffect(() => {
    if (!splashReady) return
    if (splashHandledRef.current) return
    splashHandledRef.current = true
    let cancelled = false
    const delay = Math.max(0, SPLASH_MIN_MS - (Date.now() - mountTimeRef.current))
    const timer = setTimeout(() => {
      if (cancelled) return
      if (isLoggedIn && storedProfile) {
        setBirthDate(storedProfile.birthDate ?? '')
        setBirthTime(storedProfile.birthTime ?? null)
        setName(storedProfile.name ?? '')
        setSelectedCity(
          storedProfile.latitude != null
            ? {
                latitude: storedProfile.latitude,
                longitude: storedProfile.longitude,
                timezone: storedProfile.timezone,
              }
            : null,
        )
        setScreen('prediction')
      } else {
        setScreen('birthDate')
      }
    }, delay)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [splashReady, isLoggedIn, storedProfile])

  const handleLogout = useCallback(async () => {
    await googleSignOut()
    await clearAuth()
    setIsLoggedIn(false)
    setScreen('birthDate')
  }, [])

  const handleAuthChange = useCallback((signedIn, profile) => {
    setIsLoggedIn(!!signedIn)
    if (profile) setStoredProfile(profile)
  }, [])

  const handleBirthDateNext = (date, time) => {
    setBirthDate(date)
    setBirthTime(time)
    saveProfile({
      birthDate: date,
      birthTime: time,
      name,
      latitude: selectedCity?.latitude ?? null,
      longitude: selectedCity?.longitude ?? null,
      timezone: selectedCity?.timezone ?? null,
    })
    setScreen('name')
  }

  const handleNameNext = (name) => {
    setName(name)
    saveProfile({
      birthDate,
      birthTime,
      name,
      latitude: selectedCity?.latitude ?? null,
      longitude: selectedCity?.longitude ?? null,
      timezone: selectedCity?.timezone ?? null,
    })
    setScreen('city')
  }

  const handleCitySelect = (city) => {
    setSelectedCity(city)
  }

  const handleCityNext = (city) => {
    setSelectedCity(city)
    saveProfile({
      birthDate,
      birthTime,
      name,
      latitude: city?.latitude ?? null,
      longitude: city?.longitude ?? null,
      timezone: city?.timezone ?? null,
    })
    setScreen('prediction')
  }

  const goBack = useCallback(() => {
    setScreen((current) => {
      const idx = SCREEN_ORDER.indexOf(current)
      return idx > 0 ? SCREEN_ORDER[idx - 1] : current
    })
  }, [])

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === SCREEN_ORDER[0]) return false
      goBack()
      return true
    })
    return () => subscription.remove()
  }, [screen, goBack])

  return (
    <TamaguiProvider config={config} defaultTheme="dark">

      <YStack flex={1}>
        
        {screen === 'splash' && <SplashScreen fontsLoaded={fontsLoaded} />}
        {screen === 'birthDate' && (
          <BirthDateScreen birthDate={birthDate} birthTime={birthTime} onNext={handleBirthDateNext} />
        )}
        {screen === 'name' && (
          <NameScreen
            birthDate={birthDate}
            birthTime={birthTime}
            name={name}
            onNameChange={setName}
            onNext={handleNameNext}
            onBack={goBack}
          />
        )}
        {screen === 'city' && (
          <EarthWithCity
            birthDate={birthDate}
            birthTime={birthTime}
            name={name}
            selectedCity={selectedCity}
            onCitySelect={handleCitySelect}
            onBack={goBack}
            onNext={handleCityNext}
          />
        )}
        {screen === 'prediction' && (
          <PredictionScreen
            birthDate={birthDate}
            birthTime={birthTime}
            name={name}
            selectedCity={selectedCity}
            onBack={goBack}
            isLoggedIn={isLoggedIn}
            onAuthChange={handleAuthChange}
          />
        )}

        {isLoggedIn && screen !== 'splash' && <BurgerMenu onLogout={handleLogout} />}
      </YStack>

     
    </TamaguiProvider>
  )
}
