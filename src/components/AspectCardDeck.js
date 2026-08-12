import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated'
import { YStack, XStack, Text } from 'tamagui'

const CARD_H = 114
const PEEK = 64

function DeckCard({ aspect, slot, count, onPress, hidden }) {
  const topOffset = (count - 1 - slot) * PEEK
  const ty = useSharedValue(topOffset)
  const opacity = useSharedValue(1)
  const firstRender = useRef(true)

  useEffect(() => {
    opacity.value = withTiming(hidden ? 0 : 1, { duration: 200 })
  }, [hidden, opacity])

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      ty.value = topOffset
      return
    }
    ty.value = withSpring(topOffset, { damping: 18, stiffness: 170 })
  }, [slot, topOffset, ty])

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: ty.value }],
  }))

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
          zIndex: count - slot,
        },
      ]}
    >
      <XStack
        alignItems="flex-start"
        gap={10}
        backgroundColor="#1b1b22"
        borderWidth={1}
        borderColor="#ffffff2b"
        borderRadius={16}
        paddingHorizontal={12}
        paddingVertical={14}
        width="100%"
        height="100%"
        pressStyle={{ opacity: 0.85 }}
        onPress={onPress}
      >
        <YStack width={14} height={14} borderRadius={7} backgroundColor={aspect.color} marginTop={2} />
        <YStack flex={1} gap={5}>
          <Text color="#ffffff" fontSize={14} fontFamily="Montserrat_600SemiBold" numberOfLines={1}>
            {aspect.title}
          </Text>
          <Text
            color="#b2b2bc"
            fontSize={16}
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

export default function AspectCardDeck({ aspects, hidden = false }) {
  const [order, setOrder] = useState(() => aspects.map((a) => a.id).reverse())

  useEffect(() => {
    setOrder(aspects.map((a) => a.id).reverse())
  }, [aspects])

  const byId = useMemo(() => new Map(aspects.map((a) => [a.id, a])), [aspects])

  const moveToFront = useCallback((id) => {
    setOrder((prev) => {
      const idx = prev.indexOf(id)
      if (idx <= 0) return prev
      return [id, ...prev.slice(0, idx), ...prev.slice(idx + 1)]
    })
  }, [])

  const count = order.length
  const deckH = CARD_H + (count - 1) * PEEK

  return (
    <Animated.View
      style={{
        width: '100%',
        height: deckH,
        position: 'absolute',
        bottom: 10,
        zIndex: 3,
      }}
      pointerEvents={hidden || count === 0 ? 'none' : 'box-none'}
    >
      {order.map((id, slot) => {
        const aspect = byId.get(id)
        if (!aspect) return null
        return (
          <DeckCard
            key={id}
            aspect={aspect}
            slot={slot}
            count={count}
            onPress={() => moveToFront(id)}
            hidden={hidden}
          />
        )
      })}
    </Animated.View>
  )
}
