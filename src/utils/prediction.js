import { PLANET_NAMES } from './planets'

export function buildPredictionPaths(aspects, t) {
  const localize = (key) => {
    const canonical = PLANET_NAMES[key] || key
    if (!t || !PLANET_NAMES[key]) return canonical
    return t(`planets.${key}`)
  }

  return aspects.map((a) => ({
    id: `${a.transit_planet}-${a.type}-${a.natal_planet}`,
    color: a.color || '#ffffff',
    aspectType: a.type,
    orb: a.orb,
    separation: a.separation,
    title: a.title,
    content: a.content,
    natal_planet: localize(a.natal_planet),
    transit_planet: localize(a.transit_planet),
    visuals: {
      natal_planet_position: a.natal_position,
      transit_planet_position: a.transit_position,
    },
  }))
}
