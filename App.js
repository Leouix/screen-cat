import { TamaguiProvider } from 'tamagui'
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat'
import config from './tamagui.config'
import EarthWithCity from './src/components/EarthWithCity'

export default function App() {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  })

  if (!fontsLoaded) return null

  return (
    <TamaguiProvider config={config} defaultTheme="dark">
      <EarthWithCity />
    </TamaguiProvider>
  )
}
