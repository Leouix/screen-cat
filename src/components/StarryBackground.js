import React, { useMemo, useEffect } from 'react'
import { Dimensions } from 'react-native'
import { Canvas, Circle, Fill } from '@shopify/react-native-skia'
import { useSharedValue, useDerivedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated'

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

function Star({ x, y, r, color, phase, speed, time, width }) {
  // 1. Плавное мерцание (Opacity)
  const opacity = useDerivedValue(() => {
    const wave = Math.sin(time.value * speed + phase)
    // Раньше: 0.3 + (wave + 1) * 0.35 (разбег от 0.3 до 1.0)
    // Теперь: 0.6 + (wave + 1) * 0.2 (разбег от 0.6 до 1.0) - меньше контраста
    return 0.6 + (wave + 1) * 0.2
  })

  // 2. Движение справа налево (X)
  const cx = useDerivedValue(() => {
    // Коэффициент 2 регулирует общую скорость движения.
    // Умножаем на star.speed, чтобы получился эффект параллакса (разные звезды летят с разной скоростью)
    const shiftX = time.value * speed * 2
    const newX = x - shiftX
    
    // Хак для правильного зацикливания отрицательных чисел в JS,
    // чтобы при уходе за 0 звезда появлялась с другой стороны (width)
    return ((newX % width) + width) % width
  })

  return <Circle cx={cx} cy={y} r={r} color={color} opacity={opacity} />
}

export default function StarryBackground() {
  const { width, height } = Dimensions.get('window')
  const stars = useMemo(() => generateStars(width, height), [width, height])

  const time = useSharedValue(0)

  useEffect(() => {
    // 3. Равномерный таймер (Linear Easing)
    time.value = withRepeat(
      withTiming(1000, { 
        duration: 100000000, // 100 секунд на полный цикл
        easing: Easing.linear // Равномерное движение без ускорений/замедлений
      }),
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
          x={star.x}       // Передаем базовый X, а не сразу в cx
          y={star.y}       // Передаем базовый Y в y, а не cy
          r={star.r}
          color={star.color}
          phase={star.phase}
          speed={star.speed}
          time={time}
          width={width}    // Передаем ширину, чтобы Star знала, где правый край экрана
        />
      ))}
    </Canvas>
  )
}