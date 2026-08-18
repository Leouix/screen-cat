import { useEffect, useRef, useState } from 'react'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated'
import { YStack, XStack, Text } from 'tamagui'
import { useWindowDimensions } from 'react-native'

const CARD_H = 114
const PEEK = 54

function StackCard({ aspect, index, count, visible, peek }) {
  const target = index * peek
  const ty = useSharedValue(target + 48)
  const opacity = useSharedValue(0)
  const scale = useSharedValue(0.94)
  const started = useRef(false)

  useEffect(() => {
    if (!visible || started.current) return
    started.current = true
    ty.value = withSpring(target, { damping: 17, stiffness: 160 })
    opacity.value = withTiming(1, { duration: 260 })
    scale.value = withSpring(1, { damping: 17, stiffness: 160 })
  }, [visible, target, ty, opacity, scale])

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: ty.value }, { scale: scale.value }],
  }))

  const { width } = useWindowDimensions()
  const isSmallScreen = width <= 360

  return (
    <Animated.View
      style={[
        style,
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: CARD_H,
          zIndex: count + index,
        },
      ]}
      pointerEvents="none"
    >
      <XStack
        alignItems="flex-start"
        gap={10}
        backgroundColor="#1b1b22"
        borderWidth={1}
        borderColor="#ffffff2b"
        borderRadius={16}
        paddingHorizontal={isSmallScreen ? 10 : 18}
        paddingVertical={14}
        width="100%"
        height="100%"
      >
        <YStack 
          width={14} 
          height={14} 
          borderRadius={7} 
          backgroundColor={aspect.color} 
          marginTop={2} 
        />
        <YStack flex={1} gap={5}>
          <Text
            color="#ffffff"
            fontSize={isSmallScreen ? 13 : 14}
            fontFamily="Montserrat_600SemiBold"
            numberOfLines={1}
          >
            {aspect.title}
          </Text>
          <Text
            color="#b2b2bc"
            fontSize={isSmallScreen ? 14 : 16}
            fontFamily="Montserrat_500Regular"
            lineHeight={20}
            numberOfLines={3}
          >
            {aspect.content}
          </Text>
        </YStack>
      </XStack>
    </Animated.View>
  )
}

export default function AspectCardStack({ items, startDelay = 300, revealDelay = 260 }) {
  const { width } = useWindowDimensions()
  const isSmallScreen = width <= 360
  const peek = isSmallScreen ? 30 : PEEK
  const count = items.length
  const deckH = CARD_H + (count - 1) * peek
  const [revealed, setRevealed] = useState(0)

  useEffect(() => {
    let interval
    const timer = setTimeout(() => {
      setRevealed(1)
      interval = setInterval(() => {
        setRevealed((r) => {
          if (r >= count) {
            clearInterval(interval)
            return r
          }
          return r + 1
        })
      }, revealDelay)
    }, startDelay)
    return () => {
      clearTimeout(timer)
      if (interval) clearInterval(interval)
    }
  }, [count, startDelay, revealDelay])

  return (
    <Animated.View
      style={{
        width: '100%',
        height: deckH,
        position: 'absolute',
        bottom: isSmallScreen ? 10 : 30,
        zIndex: 3,
        maxWidth: 650, 
      }}
      pointerEvents="none"
    >
      {items.map((item, index) => (
        <StackCard
          key={item.id}
          aspect={item}
          index={index}
          count={count}
          peek={peek}
        />
      ))}
    </Animated.View>
  )
}
