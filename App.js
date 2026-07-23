import { useState } from 'react'
import { TamaguiProvider, YStack } from 'tamagui'
import config from './tamagui.config'
import BirthDateScreen from './src/screens/BirthDateScreen'
import NameScreen from './src/screens/NameScreen'

export default function App() {
  const [screen, setScreen] = useState('birthDate')
  const [birthDate, setBirthDate] = useState('')

  const handleBirthDateNext = (date) => {
    setBirthDate(date)
    setScreen('name')
  }

  const handleNameNext = (name) => {
    console.log({ birthDate, name })
  }

  return (
    <TamaguiProvider config={config} defaultTheme="dark">
      <YStack flex={1}>
        {screen === 'birthDate' && (
          <BirthDateScreen onNext={handleBirthDateNext} />
        )}
        {screen === 'name' && (
          <NameScreen birthDate={birthDate} onNext={handleNameNext} />
        )}
      </YStack>
    </TamaguiProvider>
  )
}