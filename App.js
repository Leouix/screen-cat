import { TamaguiProvider } from 'tamagui'
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat'
import config from './tamagui.config'
import Earth3d from './src/components/Earth3d'

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
      <Earth3d targetLat={40.7283} targetLng={73.9942} />
    </TamaguiProvider>
  )
}