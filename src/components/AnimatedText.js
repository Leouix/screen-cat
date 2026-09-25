import { useEffect } from 'react'
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'
import { XStack } from 'tamagui'

const STEP_MS = 45
const DURATION_MS = 350
const RISE = 14

function AnimatedLetter({ char, index, letterStyle, step, duration, rise }) {
  const reduceMotion = useReducedMotion()
  const progress = useSharedValue(reduceMotion ? 1 : 0)

  useEffect(() => {
    if (reduceMotion) {
      progress.value = 1
      return
    }
    progress.value = withDelay(
      index * step,
      withTiming(1, { duration, easing: Easing.out(Easing.cubic) }),
    )
  }, [index, reduceMotion, progress, step, duration])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * rise }],
  }))

  return (
    <Animated.Text style={[letterStyle, animatedStyle]} accessible={false}>
      {char}
    </Animated.Text>
  )
}

// Reveals text letter by letter (fade + rise). Words stay intact when the row
// wraps, and the system "reduce motion" setting skips the animation.
export default function AnimatedText({
  text,
  letterStyle,
  containerStyle,
  wordGap = 10,
  rowGap = 4,
  step = STEP_MS,
  duration = DURATION_MS,
  rise = RISE,
}) {
  const words = String(text ?? '').split(' ')

  let cursor = 0
  const rows = words.map((word, wordIndex) => {
    const letters = Array.from(word).map((char, charIndex) => {
      const index = cursor
      cursor += 1
      return (
        <AnimatedLetter
          key={charIndex}
          char={char}
          index={index}
          letterStyle={letterStyle}
          step={step}
          duration={duration}
          rise={rise}
        />
      )
    })

    return (
      <XStack key={wordIndex} flexDirection="row" alignItems="baseline">
        {letters}
      </XStack>
    )
  })

  return (
    <XStack
      flexWrap="wrap"
      justifyContent="center"
      alignItems="baseline"
      columnGap={wordGap}
      rowGap={rowGap}
      accessibilityRole="header"
      accessibilityLabel={text}
      style={containerStyle}
    >
      {rows}
    </XStack>
  )
}
