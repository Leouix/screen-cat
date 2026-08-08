import { Skia } from '@shopify/react-native-skia'

const DEG = Math.PI / 180

export const CHART_R_F = 0.51
export const NATAL_R_F = 0.78
export const NATAL_Z_F = 0
export const TRANSIT_R_F = 0.72
export const TRANSIT_Z_F = 0.32
export const GLOBE_R_F = 0.78
export const PARALLEL_Z_FRACTIONS = [-0.6, -0.3, 0, 0.3, 0.6]

export function projectScenePoint({
  x,
  y,
  z,
  rotation = 0,
  tilt = 1,
  perspective = 800,
  cx = 0,
  cy = 0,
  zoom = 1,
  panX = 0,
  panY = 0,
} = {}) {
  'worklet'
  const cosR = Math.cos(rotation)
  const sinR = Math.sin(rotation)
  const rx = x * cosR - y * sinR
  const ry = x * sinR + y * cosR
  const cosT = Math.cos(tilt)
  const sinT = Math.sin(tilt)
  const y2 = ry * cosT - z * sinT
  const z2 = ry * sinT + z * cosT
  const k = perspective / (perspective - z2)
  return {
    x: cx + rx * k * zoom + panX,
    y: cy + y2 * k * zoom + panY,
    k,
    z2,
    rx,
    y2,
  }
}

export function planetPoint({ deg, rotation = 0, r, z, ...proj }) {
  'worklet'
  const a = deg * DEG + rotation
  return projectScenePoint({
    x: r * Math.sin(a),
    y: -r * Math.cos(a),
    z,
    rotation: 0,
    ...proj,
  })
}

export function buildRingPaths({
  r,
  z,
  rotation = 0,
  segments = 180,
  tilt = 1,
  perspective = 800,
  cx = 0,
  cy = 0,
  zoom = 1,
  panX = 0,
  panY = 0,
}) {
  'worklet'
  const sinT = Math.sin(tilt)
  const cosT = Math.cos(tilt)
  const cotT = cosT / sinT
  const clamped = Math.max(-1, Math.min(1, (z / r) * cotT))
  const deltaDeg = (Math.asin(-clamped) * 180) / Math.PI
  const frontSpan = Math.max(0, Math.min(360, 180 - 2 * deltaDeg))
  const step = 360 / segments
  const frontStart = deltaDeg - (rotation * 180) / Math.PI
  const nFront = frontSpan < 3 ? 0 : Math.max(1, Math.round(frontSpan / step))
  const nBack = segments - nFront

  const front = Skia.PathBuilder.Make()
  const back = Skia.PathBuilder.Make()
  const opts = { r, z, rotation, tilt, perspective, cx, cy, zoom, panX, panY }

  if (nFront > 0) {
    for (let i = 0; i <= nFront; i++) {
      const p = planetPoint({ ...opts, deg: frontStart + i * step })
      if (i === 0) front.moveTo(p.x, p.y)
      else front.lineTo(p.x, p.y)
    }
  }
  if (nBack > 0) {
    const backStart = frontStart + frontSpan
    for (let i = 0; i <= nBack; i++) {
      const p = planetPoint({ ...opts, deg: backStart + i * step })
      if (i === 0) back.moveTo(p.x, p.y)
      else back.lineTo(p.x, p.y)
    }
  }

  return { front: front.detach(), back: back.detach() }
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
