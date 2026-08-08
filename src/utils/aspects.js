export const ASPECT_TYPES = {
  conjunction: { degrees: 0, color: '#F1C40F', label: 'Соединение' },
  sextile: { degrees: 60, color: '#2ECC71', label: 'Секстиль' },
  square: { degrees: 90, color: '#E74C3C', label: 'Квадрат' },
  trine: { degrees: 120, color: '#2ECC71', label: 'Тригон' },
  opposition: { degrees: 180, color: '#E74C3C', label: 'Оппозиция' },
}

const ORBS = {
  conjunction: 8,
  sextile: 6,
  square: 7,
  trine: 8,
  opposition: 8,
}

export function normalizeDegrees(d) {
  return ((d % 360) + 360) % 360
}

export function angularDistance(a, b) {
  const diff = Math.abs(normalizeDegrees(a) - normalizeDegrees(b))
  return Math.min(diff, 360 - diff)
}

export function getAspect(a, b) {
  const diff = angularDistance(a, b)
  let best = null
  let bestOrb = Infinity

  for (const [type, def] of Object.entries(ASPECT_TYPES)) {
    const orb = Math.abs(diff - def.degrees)
    if (orb < ORBS[type] && orb < bestOrb) {
      bestOrb = orb
      best = { type, color: def.color, label: def.label, orb, separation: diff }
    }
  }

  return best
}
