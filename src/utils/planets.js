export const PLANET_NAMES = {
  sun: 'Солнце',
  moon: 'Луна',
  mercury: 'Меркурий',
  venus: 'Венера',
  mars: 'Марс',
  jupiter: 'Юпитер',
  saturn: 'Сатурн',
  uranus: 'Уран',
  neptune: 'Нептун',
}

export function getRulingPlanet(birthDateString) {
  const date = new Date(birthDateString)
  const month = date.getMonth() + 1
  const day = date.getDate()

  const rules = [
    { planet: 'Марс', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
    { planet: 'Венера', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
    { planet: 'Меркурий', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
    { planet: 'Луна', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
    { planet: 'Солнце', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
    { planet: 'Меркурий', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
    { planet: 'Венера', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
    { planet: 'Плутон', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
    { planet: 'Юпитер', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
    { planet: 'Сатурн', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
    { planet: 'Уран', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
    { planet: 'Нептун', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
  ]

  for (const rule of rules) {
    if (rule.startMonth > rule.endMonth) {
      if (
        (month === rule.startMonth && day >= rule.startDay) ||
        (month === rule.endMonth && day <= rule.endDay)
      ) {
        return rule.planet
      }
    } else {
      if (
        (month === rule.startMonth && day >= rule.startDay) ||
        (month === rule.endMonth && day <= rule.endDay) ||
        (month > rule.startMonth && month < rule.endMonth)
      ) {
        return rule.planet
      }
    }
  }

  return 'Неизвестно'
}
