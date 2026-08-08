import { useEffect, useMemo, useRef } from 'react'
import { StyleSheet, View, Pressable } from 'react-native'
import { Canvas, Group, Circle, Line, Path, BlurMask } from '@shopify/react-native-skia'
import {
  useSharedValue,
  useDerivedValue,
  withTiming,
  withRepeat,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated'

import {
  circlePoint,
  buildSceneMatrix,
  mapScenePoint,
  screenToLocal,
  orbitArcPath,
  dist2,
  distToSegment,
  ORBIT_INNER,
  ORBIT_OUTER,
} from '../utils/trig'

const ORBIT_COLOR = 'rgba(255, 255, 255, 0.35)'
const ORBIT_STROKE = 1
const NATAL_COLOR = '#8f93a3'
const CORE_COLOR = '#f8df61'

const ORIGIN = { x: 0, y: 0 }

export default function DailyPredictionMap({ paths, size, selectedId = null, onSelect }) {
  const cx = size / 2
  const cy = size / 2

  const R_IN = size * ORBIT_INNER
  const R_OUT = size * ORBIT_OUTER
  const CORE_R = size * 0.03
  const NATAL_R = size * 0.018
  const TRANSIT_R = size * 0.024

  const rotation = useSharedValue(0)
  const zoom = useSharedValue(1)
  const panX = useSharedValue(0)
  const panY = useSharedValue(0)

  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  const sceneMatrix = useDerivedValue(() =>
    buildSceneMatrix({
      rotation: rotation.value,
      zoom: zoom.value,
      panX: panX.value,
      panY: panY.value,
      cx,
      cy,
    })
  )

  useEffect(() => {
    if (selectedId) {
      cancelAnimation(rotation)
      return
    }
    const target = rotation.value + Math.PI * 2
    rotation.value = withRepeat(withTiming(target, { duration: 60000, easing: Easing.linear }), -1)
    return () => cancelAnimation(rotation)
  }, [selectedId, rotation])

  const orbitArcs = useMemo(
    () => ({
      backInner: orbitArcPath(R_IN, 180, 180),
      backOuter: orbitArcPath(R_OUT, 180, 180),
      frontInner: orbitArcPath(R_IN, 0, 180),
      frontOuter: orbitArcPath(R_OUT, 0, 180),
    }),
    [R_IN, R_OUT]
  )

  const pathPoints = useMemo(
    () =>
      paths.map((p) => ({
        id: p.id,
        color: p.color,
        natal: circlePoint(p.visuals.natal_planet_position, R_IN),
        transit: circlePoint(p.visuals.transit_planet_position, R_OUT),
      })),
    [paths, R_IN, R_OUT]
  )

  const focusOn = (id) => {
    const point = pathPoints.find((pp) => pp.id === id)
    if (!point) return

    cancelAnimation(rotation)

    const m = buildSceneMatrix({ rotation: rotation.value, zoom: 1, cx, cy })
    const targetZoom = 1.35
    const s = mapScenePoint(m, point.natal.x, point.natal.y)

    panX.value = withTiming(cx - s.x * targetZoom, { duration: 600 })
    panY.value = withTiming(cy - s.y * targetZoom, { duration: 600 })
    zoom.value = withTiming(targetZoom, { duration: 600 })

    const path = paths.find((p) => p.id === id) || null
    onSelectRef.current?.(path)
  }

  const resetFocus = () => {
    zoom.value = withTiming(1, { duration: 500 })
    panX.value = withTiming(0, { duration: 500 })
    panY.value = withTiming(0, { duration: 500 })
    onSelectRef.current?.(null)
  }

  const handleTap = (event) => {
    const { locationX, locationY } = event.nativeEvent
    const m = buildSceneMatrix({
      rotation: rotation.value,
      zoom: zoom.value,
      panX: panX.value,
      panY: panY.value,
      cx,
      cy,
    })
    const local = screenToLocal(m, locationX, locationY)

    const planetHit = size * 0.05
    for (const pp of pathPoints) {
      if (dist2(local, pp.natal) < planetHit * planetHit || dist2(local, pp.transit) < planetHit * planetHit) {
        focusOn(pp.id)
        return
      }
    }

    const lineHit = size * 0.02
    for (const pp of pathPoints) {
      if (distToSegment(local, pp.natal, pp.transit) < lineHit) {
        focusOn(pp.id)
        return
      }
    }

    resetFocus()
  }

  return (
    <View style={{ width: size, height: size }}>
      <Canvas style={{ width: size, height: size }}>
        <Group matrix={sceneMatrix}>
          <Group>
            <Path path={orbitArcs.backInner} color={ORBIT_COLOR} style="stroke" strokeWidth={ORBIT_STROKE} />
            <Path path={orbitArcs.backOuter} color={ORBIT_COLOR} style="stroke" strokeWidth={ORBIT_STROKE} />
          </Group>

          {pathPoints.map((pp) => {
            const isSelected = pp.id === selectedId
            return (
              <Group key={pp.id} opacity={isSelected ? 1 : 0.8}>
                <Line
                  p1={pp.natal}
                  p2={pp.transit}
                  color={pp.color}
                  style="stroke"
                  strokeWidth={isSelected ? 3 : 1.4}
                />
                {isSelected ? <BlurMask blur={6} style="normal" /> : <BlurMask blur={2} style="normal" />}
              </Group>
            )
          })}

          {pathPoints.map((pp) => (
            <Circle key={`natal-${pp.id}`} c={pp.natal} r={NATAL_R} color={NATAL_COLOR} />
          ))}

          <Group>
            <Circle c={ORIGIN} r={CORE_R} color={CORE_COLOR} />
            <BlurMask blur={8} style="normal" />
          </Group>

          {pathPoints.map((pp) => {
            const isSelected = pp.id === selectedId
            return (
              <Group key={`transit-${pp.id}`}>
                <Circle
                  c={pp.transit}
                  r={TRANSIT_R * (isSelected ? 1.35 : 1)}
                  color={pp.color}
                />
                <BlurMask blur={isSelected ? 8 : 4} style="normal" />
              </Group>
            )
          })}

          <Group>
            <Path path={orbitArcs.frontInner} color={ORBIT_COLOR} style="stroke" strokeWidth={ORBIT_STROKE} />
            <Path path={orbitArcs.frontOuter} color={ORBIT_COLOR} style="stroke" strokeWidth={ORBIT_STROKE} />
          </Group>
        </Group>
      </Canvas>

      <Pressable style={StyleSheet.absoluteFill} onPress={handleTap} />
    </View>
  )
}
