import { useEffect } from 'react'
import { Image } from 'react-native'
import Animated, { useSharedValue, withTiming, Easing } from 'react-native-reanimated'
import { YStack, Text, Spinner } from 'tamagui'
import StarryBackground from '../components/StarryBackground'

export default function SplashScreen({ fontsLoaded }) {
  const opacity = useSharedValue(0)

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) })
  }, [opacity])

  return (
    <YStack flex={1}>
      <StarryBackground />

      <Animated.View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
          position: 'absolute',
          alignItems: 'center',
          height: '100%',
          width: '100%'
        }}
      >
        
         {fontsLoaded && (
          <Text color="#ffffff" fontSize={24} fontFamily="Montserrat_600SemiBold" letterSpacing={2}>
            Your Prediction Map
          </Text>
        )}

        <Image
          source={require('../../assets/splash-icon.png')}
          style={{ width: 140, height: 140, resizeMode: 'contain' }}
        />
        
      </Animated.View>
    </YStack>
  )
}
