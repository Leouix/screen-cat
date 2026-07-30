import { useState } from 'react'
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
import EarthWithCity from './src/components/EarthWithCity'

export default function App() {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  })

  const [screen, setScreen] = useState('birthDate')
  const [birthDate, setBirthDate] = useState('')
  const [name, setName] = useState('')
  const [selectedCity, setSelectedCity] = useState(null)

  if (!fontsLoaded) return null

  const handleBirthDateNext = (date) => {
    setBirthDate(date)
    setScreen('name')
  }

  const handleNameNext = (name) => {
    setName(name)
    setScreen('city')
  }

  const goBack = () => {
    if (screen === 'name') setScreen('birthDate')
    if (screen === 'city') setScreen('name')
  }

  return (
    <TamaguiProvider config={config} defaultTheme="dark">

      <YStack flex={1}>
        {screen === 'birthDate' && (
          <BirthDateScreen birthDate={birthDate} onNext={handleBirthDateNext} />
        )}
        {screen === 'name' && (
          <NameScreen
            birthDate={birthDate}
            name={name}
            onNameChange={setName}
            onNext={handleNameNext}
            onBack={goBack}
          />
        )}
        {screen === 'city' && (
          <EarthWithCity
            birthDate={birthDate}
            name={name}
            selectedCity={selectedCity}
            onCitySelect={setSelectedCity}
            onBack={goBack}
          />
        )}
      </YStack>

     
    </TamaguiProvider>
  )
}
