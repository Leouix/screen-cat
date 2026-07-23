import { useState } from 'react'
import { TamaguiProvider, YStack, Text, Button, styled } from 'tamagui'
import config from './tamagui.config'
import StarryBackground from './src/components/StarryBackground'
import BirthDatePicker from './src/components/BirthDatePicker'

// Кастомные стилизованные компоненты
const BackgroundView = styled(YStack, {
  pointerEvents: 'none',
  position: 'absolute',
  width: '100%',
  height: '100%',
  backgroundColor: '#060606',
})

const MainContainer = styled(YStack, {
  flex: 1,
  justifyContent: 'flex-end',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingVertical: 30,
})

const PrimaryButton = styled(Button, {
  width: '100%',
  backgroundColor: '#dfe15a10',
  borderRadius: 50,
  marginTop: 15,
  borderWidth: 1,
  borderColor: '#f8df61b3',
  color: '#fffffffa',
  fontSize: 18,
  fontWeight: 'bold',
  pressStyle: { opacity: 0.7 },
})

const SecondaryButton = styled(Button, {
  width: '100%',
  backgroundColor: 'transparent',
  paddingVertical: 5,
  borderRadius: 50,
  marginTop: 15,
  color: '#c3bea6',
  fontSize: 12,
  fontWeight: 'bold',
  textDecorationLine: 'underline',
  pressStyle: { opacity: 0.6 },
})

export default function App() {
  const [date, setDate] = useState(new Date(1995, 0, 1))

  return (
    <TamaguiProvider config={config} defaultTheme="dark">
      <YStack flex={1}>
        <BackgroundView>
          <StarryBackground />
        </BackgroundView>

        <MainContainer>
          <BirthDatePicker date={date} onChange={setDate} />

          <PrimaryButton onPress={() => {}}>NEXT</PrimaryButton>
          <SecondaryButton onPress={() => {}}>Skip</SecondaryButton>
        </MainContainer>
      </YStack>
    </TamaguiProvider>
  )
}