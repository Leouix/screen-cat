import { useState } from 'react'
import { TamaguiProvider, YStack } from 'tamagui'
import config from './tamagui.config'
import BirthDateScreen from './src/screens/BirthDateScreen'
import NameScreen from './src/screens/NameScreen'
import { Image } from 'tamagui'

const mercuryAsset = require('./assets/mercury.png')

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

  const goBack = () => {
    if (screen === 'name') setScreen('birthDate')
  }

  return (
    <TamaguiProvider config={config} defaultTheme="dark">
       <Image
              source={mercuryAsset}
              width={450}
              height={450}
              resizeMode="contain"
              position="absolute"
              alignSelf="center"
              top={60}
              shadowColor="#000"
              shadowOffset={{ width: 0, height: 8 }}
              shadowOpacity={0.4}
              shadowRadius={20}
              elevation={10}
            />

      {/* <YStack flex={1}>
        {screen === 'birthDate' && (
          <BirthDateScreen birthDate={birthDate} onNext={handleBirthDateNext} />
        )}
        {screen === 'name' && (
          <NameScreen birthDate={birthDate} onNext={handleNameNext} onBack={goBack} />
        )}
      </YStack> */}
    </TamaguiProvider>
  )
}