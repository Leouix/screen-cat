import { PLANET_NAMES } from './planets'

export function buildPredictionPaths(aspects) {
  return aspects.map((a) => ({
    id: `${a.transit_planet}-${a.type}-${a.natal_planet}`,
    color: a.color || '#ffffff',
    aspectType: a.type,
    orb: a.orb,
    separation: a.separation,
    title: a.title,
    content: a.content,
    natal_planet: PLANET_NAMES[a.natal_planet] || a.natal_planet,
    transit_planet: PLANET_NAMES[a.transit_planet] || a.transit_planet,
    visuals: {
      natal_planet_position: a.natal_position,
      transit_planet_position: a.transit_position,
    },
  }))
}
