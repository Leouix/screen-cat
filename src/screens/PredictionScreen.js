import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useWindowDimensions } from 'react-native'
import { YStack, XStack, Text, Spinner, Button } from 'tamagui'
import dayjs from 'dayjs'
import StarryBackground from '../components/StarryBackground'
import DailyPredictionMap from '../components/DailyPredictionMap'
import AspectCardDeck from '../components/AspectCardDeck'
import GoogleAuthOverlay from '../components/GoogleAuthOverlay'
import { BackgroundView, SecondaryButton } from '../components/shared/StyledComponents'
import { buildPredictionPaths } from '../utils/prediction'
import { getPrediction, postGoogleAuth } from '../services/api'
import { saveAuth, clearAuth, loadAuth, savePrediction as persistPrediction, loadPrediction } from '../services/db'
import { signInWithGoogle, googleSignOut } from '../services/auth'

export default function PredictionScreen({ birthDate, birthTime, name, selectedCity, onBack }) {
  const { width, height } = useWindowDimensions()
  const [selectedPath, setSelectedPath] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [authState, setAuthState] = useState('loading') // 'loading' | 'signed_in' | 'auth_required'
  const [authError, setAuthError] = useState(null)
  const [signInLoading, setSignInLoading] = useState(false)

  const size = Math.min(width, height)
  const mapRef = useRef(null)

  const fetchPublicPrediction = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { ok, data, error } = await getPrediction({
        birthDate,
        birthTime,
        latitude: selectedCity?.latitude,
        longitude: selectedCity?.longitude,
      })
      if (!ok) {
        setError(error || 'Failed to load prediction')
        return
      }
      setPrediction(data)
      persistPrediction(data)
    } catch (err) {
      setError(err.message || 'Failed to load prediction')
    } finally {
      setLoading(false)
    }
  }, [birthDate, birthTime, selectedCity])

  useEffect(() => {
    let cancelled = false

    async function init() {
      const cached = await loadPrediction()
      const auth = await loadAuth()
      if (cancelled) return

      const today = dayjs().format('YYYY-MM-DD')
      const hasFreshCache = !!cached && cached.date === today

      if (cached) setPrediction(cached)
      setLoading(!hasFreshCache)

      if (auth && auth.token) {
        setAuthState('signed_in')
        if (!hasFreshCache) {
          fetchPublicPrediction()
        }
      } else {
        setAuthState('auth_required')
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [fetchPublicPrediction])

  const handleLogOut = useCallback(async () => {
    await googleSignOut()
    await clearAuth()
    setAuthState('auth_required')
    onBack?.()
  }, [onBack])

  const handleGoogleSignIn = useCallback(async () => {
    setSignInLoading(true)
    setAuthError(null)
    try {
      const { idToken, user, cancelled } = await signInWithGoogle()
      if (cancelled) return

      const { ok, data, error } = await postGoogleAuth({
        idToken,
        googleName: user.googleName,
        name,
        email: user.email,
        birthDate,
        birthTime,
        latitude: selectedCity?.latitude,
        longitude: selectedCity?.longitude,
        timezone: selectedCity?.timezone,
      })
      if (!ok) throw new Error(error || 'Sign-in failed')

      await saveAuth({ token: data.token, user: { google_name: user.googleName, name, email: user.email, user_id: data.user_id } })
      if (data.prediction) {
        await persistPrediction(data.prediction)
        setPrediction(data.prediction)
      }
      setAuthState('signed_in')
      setError(null)
    } catch (err) {
      setAuthError(err.message || 'Sign-in failed. Try again.')
    } finally {
      setSignInLoading(false)
      setLoading(false)
    }
  }, [birthDate, birthTime, selectedCity])

  const paths = useMemo(() => {
    if (!prediction) return []
    return buildPredictionPaths(prediction.aspects)
  }, [prediction])

  return (
    <YStack flex={1}>
      <BackgroundView>
        <StarryBackground />
      </BackgroundView>

      {authState === 'loading' && (
        <YStack flex={1} zIndex={1} alignItems="center" justifyContent="center" gap={14}>
          <Spinner color="#ffffff" size="large" />
        </YStack>
      )}

      {authState === 'signed_in' && (
      <YStack flex={1} zIndex={1} alignItems="center" justifyContent="center" paddingHorizontal={20}>

        <Text color="#b2b2bc" fontSize={18} fontFamily="Montserrat_400Regular" textAlign="center" position='absolute' top={110} zIndex={2}>
            Your sky today
          </Text>

       {!selectedPath && (
          <Text color="#b2b2bc" fontSize={12} fontFamily="Montserrat_400Regular" textAlign="center" position='absolute' top={140} zIndex={2}>
            Tap an aspect line to inspect it
          </Text>
        )}

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
            <Button backgroundColor="#ffffff18" color="#ffffff" onPress={fetchPublicPrediction}>
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
            <DailyPredictionMap paths={paths} size={size} height={height} selectedId={selectedPath?.id} onSelect={setSelectedPath} ref={mapRef} />

            <AspectCardDeck aspects={paths} hidden={!!selectedPath} onSelect={(aspect) => mapRef.current?.focus(aspect.id)} />

            {selectedPath && (
              <YStack width="100%"  paddingTop={8} position='absolute' bottom={10} zIndex={4}>
                <XStack
                  alignItems="flex-start"
                  gap={10}
                  backgroundColor="#ffffff0a"
                  borderWidth={1}
                  borderColor="#ffffff20"
                  borderRadius={16}
                  paddingHorizontal={10}
                  paddingVertical={14}
                >
                  <YStack width={14} height={14} borderRadius={7} backgroundColor={selectedPath.color} marginTop={2} />
                  <YStack flex={1} gap={5}>
                    <Text color="#ffffff" fontSize={14} fontFamily="Montserrat_600SemiBold">
                      {selectedPath.title}
                    </Text>
                    <Text color="#b2b2bc" fontSize={16} fontFamily="Montserrat_500Regular" lineHeight={20}>
                      {selectedPath.content}
                    </Text>
                  </YStack>
                </XStack>
              </YStack>
            )}
          </>
        )}
      </YStack>
      )}
         {onBack && (
            <YStack alignItems="center" zIndex={5}>
            <SecondaryButton onPress={handleLogOut}>Log Out</SecondaryButton>
             </YStack>
          )}
         {onBack && (
            <SecondaryButton onPress={onBack}>Back</SecondaryButton>
           
          )}

      <GoogleAuthOverlay
        visible={authState === 'auth_required'}
        loading={signInLoading}
        error={authError}
        onSignIn={handleGoogleSignIn}
      />
    </YStack>
  )
}
