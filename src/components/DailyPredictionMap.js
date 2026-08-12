import { useEffect, useMemo, useRef } from 'react'
import { StyleSheet, View, Pressable } from 'react-native'
import { Canvas, Group, Circle, Line, Path, Text, RoundedRect, BlurMask, useFont } from '@shopify/react-native-skia'
import { Montserrat_500Medium } from '@expo-google-fonts/montserrat'
import {
  useSharedValue,
  useDerivedValue,
  withTiming,
  withRepeat,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated'

import {
  projectScenePoint,
  planetPoint,
  buildRingPaths,
  dist2,
  distToSegment,
  CHART_R_F,
  NATAL_R_F,
  NATAL_Z_F,
  TRANSIT_R_F,
  TRANSIT_Z_F,
  GLOBE_R_F,
  PARALLEL_Z_FRACTIONS,
} from '../utils/trig'

const ORBIT_COLOR = '#ffffff'
const SPHERE_COLOR = '#ffffff'
const NATAL_COLOR = '#8f93a3'
const CORE_COLOR = '#f8df61'

function RingLayer({ rotation, zoom, panX, panY, cx, cy, r, z, color, backOpacity, frontOpacity }) {
  const ring = useDerivedValue(() =>
    buildRingPaths({
      r,
      z,
      rotation: rotation.value,
      cx,
      cy,
      zoom: zoom.value,
      panX: panX.value,
      panY: panY.value,
    })
  )
  const frontPath = useDerivedValue(() => ring.value.front)
  const backPath = useDerivedValue(() => ring.value.back)

  return (
    <>
      <Path path={backPath} color={color} style="stroke" strokeWidth={1} opacity={backOpacity} />
      <Path path={frontPath} color={color} style="stroke" strokeWidth={1} opacity={frontOpacity} />
    </>
  )
}

function AspectLine({ path, rotation, zoom, panX, panY, cx, cy, natalR, natalZ, transitR, transitZ, selected, dimmed }) {
  const line = useDerivedValue(() => {
    const a = planetPoint({
      deg: path.visuals.natal_planet_position,
      rotation: rotation.value,
      r: natalR,
      z: natalZ,
      cx,
      cy,
      zoom: zoom.value,
      panX: panX.value,
      panY: panY.value,
    })
    const b = planetPoint({
      deg: path.visuals.transit_planet_position,
      rotation: rotation.value,
      r: transitR,
      z: transitZ,
      cx,
      cy,
      zoom: zoom.value,
      panX: panX.value,
      panY: panY.value,
    })
    const depth = (a.z2 + b.z2) / 2
    return {
      p1: { x: a.x, y: a.y },
      p2: { x: b.x, y: b.y },
      alpha: dimmed ? 0.3 : selected ? 1 : depth >= 0 ? 0.85 : 0.45,
    }
  })
  const p1 = useDerivedValue(() => line.value.p1)
  const p2 = useDerivedValue(() => line.value.p2)
  const opacity = useDerivedValue(() => line.value.alpha)

  return (
    <Group>
      <Line
        p1={p1}
        p2={p2}
        color={path.color}
        opacity={opacity}
        style="stroke"
        strokeWidth={selected ? 3 : 1.4}
      />
      {selected ? <BlurMask blur={2} style="normal" /> : <BlurMask blur={2} style="normal" />}
    </Group>
  )
}

function PlanetDot({
  deg,
  r,
  z,
  rotation,
  zoom,
  panX,
  panY,
  cx,
  cy,
  color,
  baseR,
  selected,
  dimmed,
  blur,
}) {
  const pos = useDerivedValue(() =>
    planetPoint({
      deg,
      rotation: rotation.value,
      r,
      z,
      cx,
      cy,
      zoom: zoom.value,
      panX: panX.value,
      panY: panY.value,
    })
  )
  const c = useDerivedValue(() => ({ x: pos.value.x, y: pos.value.y }))
  const dotR = useDerivedValue(() => baseR * pos.value.k * zoom.value * (selected ? 1.35 : 1))
  const opacity = useDerivedValue(() => (dimmed ? 0.55 : 1))

  return (
    <Group>
      <Circle c={c} r={dotR} color={color} opacity={opacity} />
      <BlurMask blur={blur} style="normal" />
    </Group>
  )
}

function PlanetLabel({
  name,
  width,
  fontSize,
  deg,
  r,
  z,
  rotation,
  zoom,
  panX,
  panY,
  cx,
  cy,
  color,
  font,
  subtitle,
  subtitleFont,
  dimmed,
}) {
  const pos = useDerivedValue(() =>
    planetPoint({
      deg,
      rotation: rotation.value,
      r,
      z,
      cx,
      cy,
      zoom: zoom.value,
      panX: panX.value,
      panY: panY.value,
    })
  )
  const textPos = useDerivedValue(() => {
    const dx = pos.value.x - cx
    const dy = pos.value.y - cy
    const len = Math.hypot(dx, dy) || 1
    const off = (len + 14) / len
    return {
      x: cx + dx * off - width / 2,
      y: cy + dy * off + fontSize * 0.4,
    }
  })
  const x = useDerivedValue(() => textPos.value.x)
  const y = useDerivedValue(() => textPos.value.y)
  const subtitleY = useDerivedValue(() => textPos.value.y + fontSize * 1.2)
  const subWidth = useMemo(
    () => (subtitle && subtitleFont ? subtitleFont.measureText(subtitle).width : 0),
    [subtitle, subtitleFont]
  )
  const padX = 4
  const padY = 1
  const subH = subtitle ? fontSize * 1.2 + fontSize * 0.4 : 0
  const bgW = Math.max(width, subWidth) + padX * 2
  const bgH = fontSize + subH + padY * 2
  const bgX = useDerivedValue(() => textPos.value.x - padX)
  const bgY = useDerivedValue(() => textPos.value.y - fontSize - padY)
  const opacity = useSharedValue(dimmed ? 0 : 1)
  const subtitleOpacity = useSharedValue(dimmed ? 0 : 0.85)

  useEffect(() => {
    opacity.value = withTiming(dimmed ? 0 : 1, { duration: 200 })
    subtitleOpacity.value = withTiming(dimmed ? 0 : 0.85, { duration: 200 })
  }, [dimmed, opacity, subtitleOpacity])

  return (
    <>
      <RoundedRect x={bgX} y={bgY} width={bgW} height={bgH} r={4} color="rgba(16,16,24,0.48)" opacity={opacity} />
      <Text x={x} y={y} text={name} font={font} color={color} opacity={opacity} />
      {subtitle && <Text x={x} y={subtitleY} text={subtitle} font={subtitleFont} color={color} opacity={subtitleOpacity} />}
    </>
  )
}

export default function DailyPredictionMap({ paths, size, height = size, selectedId = null, onSelect }) {
  const cx = size / 2
  const cy = height * 0.45 - 30

  const CHART_R = size * CHART_R_F
  const NATAL_R = CHART_R * NATAL_R_F
  const NATAL_Z = CHART_R * NATAL_Z_F
  const TRANSIT_R = CHART_R * TRANSIT_R_F
  const TRANSIT_Z = CHART_R * TRANSIT_Z_F
  const GLOBE_R = CHART_R * GLOBE_R_F
  const CORE_R = size * 0.03
  const NATAL_DOT = size * 0.016
  const TRANSIT_DOT = size * 0.022

  const rotation = useSharedValue(0)
  const zoom = useSharedValue(1)
  const panX = useSharedValue(0)
  const panY = useSharedValue(0)

  const labelFont = useFont(Montserrat_500Medium, 11)
  const subtitleFont = useFont(Montserrat_500Medium, 9)

  const selectedPath = useMemo(() => {
    if (!selectedId) return null
    return paths.find((p) => p.id === selectedId) || null
  }, [selectedId, paths])

  const { natalLabels, transitLabels } = useMemo(() => {
    const natal = new Map()
    const transit = new Map()
    for (const p of paths) {
      if (!natal.has(p.natal_planet)) {
        natal.set(p.natal_planet, {
          name: p.natal_planet,
          deg: p.visuals.natal_planet_position,
          color: NATAL_COLOR,
        })
      }
      if (!transit.has(p.transit_planet)) {
        transit.set(p.transit_planet, {
          name: p.transit_planet,
          deg: p.visuals.transit_planet_position,
          color: p.color,
        })
      }
    }
    return { natalLabels: [...natal.values()], transitLabels: [...transit.values()] }
  }, [paths])

  const labelWidths = useMemo(() => {
    const widths = {}
    if (!labelFont) return widths
    for (const l of [...natalLabels, ...transitLabels]) {
      if (widths[l.name] === undefined) widths[l.name] = labelFont.measureText(l.name).width
    }
    return widths
  }, [labelFont, natalLabels, transitLabels])

  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  useEffect(() => {
    if (selectedId) {
      cancelAnimation(rotation)
      return
    }
    const target = rotation.value + Math.PI * 2
    rotation.value = withRepeat(withTiming(target, { duration: 50000, easing: Easing.linear }), -1)
    return () => cancelAnimation(rotation)
  }, [selectedId, rotation])

  const spherePaths = useMemo(
    () =>
      PARALLEL_Z_FRACTIONS.map((zf) => {
        const z = zf * CHART_R
        const r = Math.sqrt(GLOBE_R * GLOBE_R - z * z)
        const paths3d = buildRingPaths({ r, z, rotation: 0, segments: 200, cx, cy })
        return { ...paths3d, key: zf }
      }),
    [CHART_R, GLOBE_R, cx, cy]
  )

  const backdropTransform = useDerivedValue(() => [
    { translateX: panX.value + cx * (1 - zoom.value) },
    { translateY: panY.value + cy * (1 - zoom.value) },
    { scale: zoom.value },
  ])

  const corePos = useDerivedValue(() => {
    const p = projectScenePoint({
      x: 0,
      y: 0,
      z: 0,
      rotation: rotation.value,
      cx,
      cy,
      zoom: zoom.value,
      panX: panX.value,
      panY: panY.value,
    })
    return { x: p.x, y: p.y }
  })
  const coreR = useDerivedValue(() => CORE_R * zoom.value)

  const focusOn = (id) => {

    const path = paths.find((p) => p.id === id)
    if (!path) return

    cancelAnimation(rotation)

    const proj = { rotation: rotation.value, cx, cy }
    const natal = planetPoint({ deg: path.visuals.natal_planet_position, r: NATAL_R, z: NATAL_Z, ...proj })
    const transit = planetPoint({ deg: path.visuals.transit_planet_position, r: TRANSIT_R, z: TRANSIT_Z, ...proj })

    const mid = { x: (natal.x + transit.x) / 2, y: (natal.y + transit.y) / 2 }
    const span = Math.hypot(transit.x - natal.x, transit.y - natal.y)

    const MAX_ZOOM = 1.35
    const MIN_ZOOM = 0.8
    const FOCUS_SPAN = size * 0.95
    const targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, FOCUS_SPAN / Math.max(span, 1)))

    panX.value = withTiming(-(mid.x - cx) * targetZoom, { duration: 600 })
    panY.value = withTiming(-(mid.y - cy) * targetZoom, { duration: 600 })
    zoom.value = withTiming(targetZoom, { duration: 600 })

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
    const proj = {
      rotation: rotation.value,
      zoom: zoom.value,
      panX: panX.value,
      panY: panY.value,
      cx,
      cy,
    }
    const tap = { x: locationX, y: locationY }

    const planetHit = size * 0.05 * zoom.value
    for (const p of paths) {
      const natal = planetPoint({ deg: p.visuals.natal_planet_position, r: NATAL_R, z: NATAL_Z, ...proj })
      const transit = planetPoint({ deg: p.visuals.transit_planet_position, r: TRANSIT_R, z: TRANSIT_Z, ...proj })
      if (dist2(tap, natal) < planetHit * planetHit || dist2(tap, transit) < planetHit * planetHit) {
        focusOn(p.id)
        return
      }
    }

    const lineHit = size * 0.02 * zoom.value
    for (const p of paths) {


      const natal = planetPoint({ deg: p.visuals.natal_planet_position, r: NATAL_R, z: NATAL_Z, ...proj })


      const transit = planetPoint({ deg: p.visuals.transit_planet_position, r: TRANSIT_R, z: TRANSIT_Z, ...proj })


      if (distToSegment(tap, natal, transit) < lineHit) {
       focusOn(p.id)
        return
      }
    }

    resetFocus()
  }

  return (
    <View style={{ width: size, height }}>
      <Canvas style={{ width: size, height }}>
        <Group transform={backdropTransform}>
          {spherePaths.map((s) => (
            <Group key={s.key}>
              <Path path={s.back} color={SPHERE_COLOR} style="stroke" strokeWidth={1} opacity={0.08} />
              <Path path={s.front} color={SPHERE_COLOR} style="stroke" strokeWidth={1} opacity={0.16} />
            </Group>
          ))}
        </Group>

        <RingLayer
          rotation={rotation}
          zoom={zoom}
          panX={panX}
          panY={panY}
          cx={cx}
          cy={cy}
          r={NATAL_R}
          z={NATAL_Z}
          color={ORBIT_COLOR}
          backOpacity={0.16}
          frontOpacity={0.4}
        />
        <RingLayer
          rotation={rotation}
          zoom={zoom}
          panX={panX}
          panY={panY}
          cx={cx}
          cy={cy}
          r={TRANSIT_R}
          z={TRANSIT_Z}
          color={ORBIT_COLOR}
          backOpacity={0.22}
          frontOpacity={0.6}
        />

        <Group>
          <Circle c={corePos} r={coreR} color={CORE_COLOR} />
          <BlurMask blur={8} style="normal" />
        </Group>

        {paths.map((p) => (
          <AspectLine
            key={p.id}
            path={p}
            rotation={rotation}
            zoom={zoom}
            panX={panX}
            panY={panY}
            cx={cx}
            cy={cy}
            natalR={NATAL_R}
            natalZ={NATAL_Z}
            transitR={TRANSIT_R}
            transitZ={TRANSIT_Z}
            selected={p.id === selectedId}
            dimmed={selectedId !== null && p.id !== selectedId}
          />
        ))}

        {paths.map((p) => (
          <PlanetDot
            key={`natal-${p.id}`}
            deg={p.visuals.natal_planet_position}
            r={NATAL_R}
            z={NATAL_Z}
            rotation={rotation}
            zoom={zoom}
            panX={panX}
            panY={panY}
            cx={cx}
            cy={cy}
            color={NATAL_COLOR}
            baseR={NATAL_DOT}
            selected={p.id === selectedId}
            dimmed={selectedId !== null && p.id !== selectedId}
            blur={2}
          />
        ))}

        {paths.map((p) => (
          <PlanetDot
            key={`transit-${p.id}`}
            deg={p.visuals.transit_planet_position}
            r={TRANSIT_R}
            z={TRANSIT_Z}
            rotation={rotation}
            zoom={zoom}
            panX={panX}
            panY={panY}
            cx={cx}
            cy={cy}
            color={p.color}
            baseR={TRANSIT_DOT}
            selected={p.id === selectedId}
            dimmed={selectedId !== null && p.id !== selectedId}
            blur={p.id === selectedId ? 8 : 4}
          />
        ))}

        <Group zIndex={10}>
          {natalLabels.map((l) => (
            <PlanetLabel
              key={`natal-label-${l.name}`}
              name={l.name}
              width={labelWidths[l.name] ?? 0}
              fontSize={10}
              deg={l.deg}
              r={NATAL_R}
              z={NATAL_Z}
              rotation={rotation}
              zoom={zoom}
              panX={panX}
              panY={panY}
              cx={cx}
              cy={cy}
              color={l.color}
              font={labelFont}
              subtitle="natal"
              subtitleFont={subtitleFont}
              dimmed={selectedPath !== null && l.name !== selectedPath.natal_planet}
            />
          ))}

          {transitLabels.map((l) => (
            <PlanetLabel
              key={`transit-label-${l.name}`}
              name={l.name}
              width={labelWidths[l.name] ?? 0}
              fontSize={10}
              deg={l.deg}
              r={TRANSIT_R}
              z={TRANSIT_Z}
              rotation={rotation}
              zoom={zoom}
              panX={panX}
              panY={panY}
              cx={cx}
              cy={cy}
              color={l.color}
              font={labelFont}
              dimmed={selectedPath !== null && l.name !== selectedPath.transit_planet}
            />
          ))}
        </Group>
      </Canvas>

      <Pressable style={StyleSheet.absoluteFill} onPress={handleTap} />
    </View>
  )
}
