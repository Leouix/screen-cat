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
import EarthWithCity from './src/screens/EarthWithCity'

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

  if (!fontsLoaded) return null

  const handleBirthDateNext = (date, time) => {
    setBirthDate(date)
    setBirthTime(time)
    setScreen('name')
    console.log('[Screen 1 → 2] BirthDate data:', { birthDate: date, birthTime: time })
  }

  const handleNameNext = (name) => {
    setName(name)
    setScreen('city')
    console.log('[Screen 2 → 3] Data so far:', { birthDate, birthTime, name })
  }

  const handleCitySelect = (city) => {
    setSelectedCity(city)
    console.log('[Screen 3] City selected:', {
      birthDate,
      birthTime,
      name,
      selectedCity: city
        ? { name: city.name, country: city.country, latitude: city.latitude, longitude: city.longitude }
        : null,
    })
  }

  const handleCityNext = (city) => {
    console.log('[Screen 3 → next] City step done:', {
      birthDate,
      birthTime,
      name,
      selectedCity: city
        ? { name: city.name, country: city.country, latitude: city.latitude, longitude: city.longitude }
        : null,
    })
  }

  const goBack = () => {
    if (screen === 'name') setScreen('birthDate')
    if (screen === 'city') setScreen('name')
  }

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
      </YStack>

     
    </TamaguiProvider>
  )
}
