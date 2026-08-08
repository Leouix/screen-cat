import { useState } from 'react'
import { useWindowDimensions } from 'react-native'
import { YStack, XStack, Text } from 'tamagui'
import StarryBackground from '../components/StarryBackground'
import DailyPredictionMap from '../components/DailyPredictionMap'
import { BackgroundView } from '../components/shared/StyledComponents'
import { getAspect } from '../utils/aspects'

const MOCK_PATHS = [
  {
    id: 'sun-trine-mars',
    color: '#2ECC71',
    natal_planet: 'Солнце',
    transit_planet: 'Марс',
    visuals: { natal_planet_position: 125, transit_planet_position: 5 },
  },
  {
    id: 'moon-square-jupiter',
    color: '#E74C3C',
    natal_planet: 'Луна',
    transit_planet: 'Юпитер',
    visuals: { natal_planet_position: 210, transit_planet_position: 300 },
  },
  {
    id: 'venus-conjunction-mercury',
    color: '#F1C40F',
    natal_planet: 'Венера',
    transit_planet: 'Меркурий',
    visuals: { natal_planet_position: 45, transit_planet_position: 42 },
  },
  {
    id: 'mars-opposition-saturn',
    color: '#E74C3C',
    natal_planet: 'Марс',
    transit_planet: 'Сатурн',
    visuals: { natal_planet_position: 300, transit_planet_position: 120 },
  },
  {
    id: 'mercury-trine-moon',
    color: '#2ECC71',
    natal_planet: 'Меркурий',
    transit_planet: 'Луна',
    visuals: { natal_planet_position: 175, transit_planet_position: 295 },
  },
]

export default function PredictionScreen() {
  const { width, height } = useWindowDimensions()
  const [selectedPath, setSelectedPath] = useState(null)

  const size = Math.min(width, height)
  const aspect = selectedPath
    ? getAspect(selectedPath.visuals.natal_planet_position, selectedPath.visuals.transit_planet_position)
    : null

  return (
    <YStack flex={1}>
      <BackgroundView>
        <StarryBackground />
      </BackgroundView>

      <YStack flex={1} zIndex={1} alignItems="center" justifyContent="center" paddingHorizontal={50}>
        <Text color="#ffffff" fontFamily="Montserrat_600SemiBold" fontSize={22} letterSpacing={1} marginTop={30}>
          Карта предсказаний
        </Text>

        <DailyPredictionMap paths={MOCK_PATHS} size={size} selectedId={selectedPath?.id} onSelect={setSelectedPath} />

        <YStack height={120} width="100%" alignItems="center" justifyContent="flex-start" paddingTop={8}>
          {selectedPath && aspect ? (
            <XStack
              alignItems="center"
              gap={10}
              backgroundColor="#ffffff0a"
              borderWidth={1}
              borderColor="#ffffff20"
              borderRadius={16}
              paddingHorizontal={18}
              paddingVertical={14}
            >
              <YStack width={14} height={14} borderRadius={7} backgroundColor={aspect.color} />
              <Text color="#ffffff" fontSize={14} fontFamily="Montserrat_500Medium">
                {selectedPath.transit_planet} в {aspect.label.toLowerCase()} с натальным {selectedPath.natal_planet}
              </Text>
            </XStack>
          ) : (
            <Text color="#b2b2bc" fontSize={13} fontFamily="Montserrat_400Regular" textAlign="center">
              Коснитесь планеты или луча, чтобы рассмотреть аспект
            </Text>
          )}
        </YStack>
      </YStack>
    </YStack>
  )
}
