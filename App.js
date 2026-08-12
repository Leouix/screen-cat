import { useCallback, useEffect, useState } from 'react'
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
import BirthDateScreen from './src/screens/BirthDateScreen'
import NameScreen from './src/screens/NameScreen'
import EarthWithCity from './src/screens/EarthWithCity'
import PredictionScreen from './src/screens/PredictionScreen'

const SCREEN_ORDER = ['birthDate', 'name', 'city', 'prediction']

export default function App() {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  })

  const [screen, setScreen] = useState('birthDate')
  const [birthDate, setBirthDate] = useState('')
  const [birthTime, setBirthTime] = useState('')
  const [name, setName] = useState('')
  const [selectedCity, setSelectedCity] = useState(null)

  const handleBirthDateNext = (date, time) => {
    setBirthDate(date)
    setBirthTime(time)
    setScreen('name')
  }

  const handleNameNext = (name) => {
    setName(name)
    setScreen('city')
  }

  const handleCitySelect = (city) => {
    setSelectedCity(city)
  }

  const handleCityNext = (city) => {
    setSelectedCity(city)
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

  if (!fontsLoaded) return null

  return (
    <TamaguiProvider config={config} defaultTheme="dark">

      <YStack flex={1}>
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
            selectedCity={selectedCity}
            onBack={goBack}
          />
        )}
      </YStack>

     
    </TamaguiProvider>
  )
}
