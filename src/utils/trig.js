import {
  Skia,
  processTransform3d,
  multiply4,
  translate,
  scale,
  mapPoint3d,
  invert4,
} from '@shopify/react-native-skia'

export const ORBIT_INNER = 0.22
export const ORBIT_OUTER = 0.36

export function circlePoint(degrees, radius) {
  'worklet'
  const rad = (degrees * Math.PI) / 180
  return { x: radius * Math.sin(rad), y: -radius * Math.cos(rad) }
}

export function buildSceneMatrix({
  rotation = 0,
  zoom = 1,
  panX = 0,
  panY = 0,
  cx = 0,
  cy = 0,
  flatten = 0.4,
  tilt = 0.38,
  perspective = 600,
} = {}) {
  'worklet'
  const scene = processTransform3d([
    { translate: [cx, cy] },
    { perspective },
    { rotateX: tilt },
    { scaleX: 1, scaleY: flatten },
    { rotateZ: rotation },
  ])

  if (zoom === 1 && panX === 0 && panY === 0) {
    return scene
  }
  return multiply4(multiply4(translate(panX, panY), scale(zoom, zoom, 1)), scene)
}

export function mapScenePoint(m, x, y) {
  'worklet'
  const [px, py] = mapPoint3d(m, [x, y, 0])
  return { x: px, y: py }
}

export function screenToLocal(m, sx, sy) {
  'worklet'
  const inv = invert4(m)
  const [px, py] = mapPoint3d(inv, [sx, sy, 0])
  return { x: px, y: py }
}

export function orbitArcPath(r, fromDeg, sweepDeg) {
  const rect = { x: -r, y: -r, width: r * 2, height: r * 2 }
  return Skia.PathBuilder.Make().addArc(rect, fromDeg, sweepDeg).detach()
}

export function dist2(a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return dx * dx + dy * dy
}

export function distToSegment(p, a, b) {
  const abx = b.x - a.x
  const aby = b.y - a.y
  const apx = p.x - a.x
  const apy = p.y - a.y
  const len2 = abx * abx + aby * aby
  if (len2 === 0) return Math.sqrt(dist2(p, a))
  const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / len2))
  const projx = a.x + t * abx
  const projy = a.y + t * aby
  return Math.sqrt(dist2(p, { x: projx, y: projy }))
}
