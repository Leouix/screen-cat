import { useCallback, useEffect, useMemo, useState } from 'react'
import { useWindowDimensions } from 'react-native'
import { YStack, XStack, Text, Spinner, Button } from 'tamagui'
import StarryBackground from '../components/StarryBackground'
import DailyPredictionMap from '../components/DailyPredictionMap'
import { BackgroundView } from '../components/shared/StyledComponents'
import { ASPECT_TYPES } from '../utils/aspects'
import { buildPredictionPaths } from '../utils/prediction'
import { getPrediction } from '../services/api'

export default function PredictionScreen({ birthDate, birthTime, selectedCity }) {
  const { width, height } = useWindowDimensions()
  const [selectedPath, setSelectedPath] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const size = Math.min(width, height)

  const loadPrediction = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getPrediction({
        birthDate,
        birthTime,
        latitude: selectedCity?.latitude,
        longitude: selectedCity?.longitude,
      })
      setPrediction(data)
    } catch (err) {
      setError(err.message || 'Failed to load prediction')
    } finally {
      setLoading(false)
    }
  }, [birthDate, birthTime, selectedCity])

  useEffect(() => {
    loadPrediction()
  }, [loadPrediction])

  const paths = useMemo(() => {
    if (!prediction) return []
    return buildPredictionPaths(prediction.aspects)
  }, [prediction])

  const aspect = selectedPath ? ASPECT_TYPES[selectedPath.aspectType] : null

  return (
    <YStack flex={1}>
      <BackgroundView>
        <StarryBackground />
      </BackgroundView>

      <YStack flex={1} zIndex={1} alignItems="center" justifyContent="center" paddingHorizontal={50}>
        <Text color="#ffffff" fontFamily="Montserrat_600SemiBold" fontSize={22} letterSpacing={1} marginTop={30}>
          Prediction Map
        </Text>

        {loading ? (
          <YStack flex={1} alignItems="center" justifyContent="center" gap={14}>
            <Spinner color="#ffffff" size="large" />
            <Text color="#b2b2bc" fontSize={13} fontFamily="Montserrat_400Regular">
              Calculating today's transits…
            </Text>
          </YStack>
        ) : error ? (
          <YStack flex={1} alignItems="center" justifyContent="center" gap={14} paddingHorizontal={20}>
            <Text color="#ffffff" fontSize={15} fontFamily="Montserrat_500Medium" textAlign="center">
              {error}
            </Text>
            <Button backgroundColor="#ffffff18" color="#ffffff" onPress={loadPrediction}>
              Try again
            </Button>
          </YStack>
        ) : paths.length === 0 ? (
          <YStack flex={1} alignItems="center" justifyContent="center">
            <Text color="#b2b2bc" fontSize={13} fontFamily="Montserrat_400Regular" textAlign="center">
              No active aspects today
            </Text>
          </YStack>
        ) : (
          <>
            <DailyPredictionMap paths={paths} size={size} selectedId={selectedPath?.id} onSelect={setSelectedPath} />

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
                    {selectedPath.transit_planet} {aspect.label} natal {selectedPath.natal_planet}
                  </Text>
                </XStack>
              ) : (
                <Text color="#b2b2bc" fontSize={13} fontFamily="Montserrat_400Regular" textAlign="center">
                  Tap a planet or aspect line to inspect it
                </Text>
              )}
            </YStack>
          </>
        )}
      </YStack>
    </YStack>
  )
}
