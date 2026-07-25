import { useMemo } from 'react'
import {
  useImage,
  Canvas,
  Image as SkiaImage,
  Rect,
  LinearGradient,
  Group,
  Skia,
} from '@shopify/react-native-skia'
import { View } from 'react-native'

const DEFAULT_INNER_SHADOW = {
  side: 'top',
  spread: 0.5,
  opacity: 0.4,
  color: '#000000',
}

function getGradientPoints(side, size) {
  const half = size / 2

  switch (side) {
    case 'left':
      return { start: { x: 0, y: half }, end: { x: size, y: half } }
    case 'right':
      return { start: { x: size, y: half }, end: { x: 0, y: half } }
    case 'top':
      return { start: { x: half, y: 0 }, end: { x: half, y: size } }
    case 'bottom':
      return { start: { x: half, y: size }, end: { x: half, y: 0 } }
    default:
      return { start: { x: 0, y: half }, end: { x: size, y: half } }
  }
}

function getGradientStops(spread) {
  const blur = Math.min(0.5, spread * 0.25)
  return [0, 0.5 - blur, 0.5 + blur, 1]
}

export default function PlanetImage({
  source,
  size = 550,
  dimOverlay = 0,
  innerShadow = {},
  style,
}) {
  const shadow = useMemo(
    () => ({ ...DEFAULT_INNER_SHADOW, ...innerShadow }),
    [innerShadow]
  )

  const image = useImage(source)

  const { start, end } = useMemo(
    () => getGradientPoints(shadow.side, size),
    [shadow.side, size]
  )

  const positions = useMemo(
    () => getGradientStops(shadow.spread),
    [shadow.spread]
  )

  const colors = useMemo(() => {
    const hex = shadow.color
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return [
      Skia.Color(`rgba(${r}, ${g}, ${b}, ${shadow.opacity})`),
      Skia.Color(`rgba(${r}, ${g}, ${b}, ${shadow.opacity})`),
      Skia.Color(`rgba(${r}, ${g}, ${b}, 0)`),
      Skia.Color(`rgba(${r}, ${g}, ${b}, 0)`),
    ]
  }, [shadow.color, shadow.opacity])

  if (!image) return null

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Canvas style={{ width: size, height: size }}>
        <SkiaImage
          image={image}
          x={0}
          y={0}
          width={size}
          height={size}
          fit="contain"
        />
        {dimOverlay > 0 && (
          <Rect
            x={0}
            y={0}
            width={size}
            height={size}
            color={Skia.Color(`rgba(0, 0, 0, ${dimOverlay})`)}
          />
        )}
        <Group>
          <Rect x={0} y={0} width={size} height={size}>
            <LinearGradient
              start={start}
              end={end}
              colors={colors}
              positions={positions}
            />
          </Rect>
        </Group>
      </Canvas>
    </View>
  )
}
