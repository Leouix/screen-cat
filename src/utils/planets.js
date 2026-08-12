export const PLANET_NAMES = {
  sun: 'Sun',
  moon: 'Moon',
  mercury: 'Mercury',
  venus: 'Venus',
  mars: 'Mars',
  jupiter: 'Jupiter',
  saturn: 'Saturn',
  uranus: 'Uranus',
  neptune: 'Neptune',
  pluto: 'Pluto',
}

export function getRulingPlanet(birthDateString) {
  const date = new Date(birthDateString)
  const month = date.getMonth() + 1
  const day = date.getDate()

  const rules = [
    { planet: 'mars', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
    { planet: 'venus', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
    { planet: 'mercury', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
    { planet: 'moon', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
    { planet: 'sun', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
    { planet: 'mercury', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
    { planet: 'venus', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
    { planet: 'pluto', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
    { planet: 'jupiter', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
    { planet: 'saturn', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
    { planet: 'uranus', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
    { planet: 'neptune', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
  ]

  for (const rule of rules) {
    if (rule.startMonth > rule.endMonth) {
      if (
        (month === rule.startMonth && day >= rule.startDay) ||
        (month === rule.endMonth && day <= rule.endDay)
      ) {
        return PLANET_NAMES[rule.planet]
      }
    } else {
      if (
        (month === rule.startMonth && day >= rule.startDay) ||
        (month === rule.endMonth && day <= rule.endDay) ||
        (month > rule.startMonth && month < rule.endMonth)
      ) {
        return PLANET_NAMES[rule.planet]
      }
    }
  }

  return 'Unknown'
}
