import React, { useMemo, useEffect } from 'react'
import { Dimensions } from 'react-native'
import { Canvas, Circle, Fill } from '@shopify/react-native-skia'
import { useSharedValue, useDerivedValue, withRepeat, withTiming } from 'react-native-reanimated'

const STAR_COUNT = 60

const COLORS = [
  'rgba(255, 255, 255, 1)',
  'rgba(255, 223, 140, 1)',
  'rgba(200, 220, 255, 1)',
  'rgba(255, 200, 150, 1)',
]

function generateStars(width, height) {
  return Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: 0.5 + Math.random() * 1.5,
    phase: Math.random() * Math.PI * 2,
    speed: 0.8 + Math.random() * 1.5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }))
}

function Star({ cx, cy, r, color, phase, speed, time }) {
  const opacity = useDerivedValue(() => {
    const wave = Math.sin(time.value * speed + phase)
    return 0.3 + (wave + 1) * 0.35
  })

  return <Circle cx={cx} cy={cy} r={r} color={color} opacity={opacity} />
}

export default function StarryBackground() {
  const { width, height } = Dimensions.get('window')
  const stars = useMemo(() => generateStars(width, height), [width, height])

  const time = useSharedValue(0)

  useEffect(() => {
    time.value = withRepeat(
      withTiming(1000, { duration: 20000 }),
      -1,
      false
    )
  }, [])

  return (
    <Canvas style={{ width, height }}>
      <Fill color="#0B0C10" />
      {stars.map((star, i) => (
        <Star
          key={i}
          cx={star.x}
          cy={star.y}
          r={star.r}
          color={star.color}
          phase={star.phase}
          speed={star.speed}
          time={time}
        />
      ))}
    </Canvas>
  )
}
