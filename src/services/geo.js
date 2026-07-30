import cities from '../data/cities_en.json'

const enrichedCities = cities.map((city) => ({
  ...city,
  _searchName: city.name.toLowerCase(),
}))

export function searchCities(query) {
  if (!query || query.trim().length === 0) return []

  const q = query.trim().toLowerCase()

  return enrichedCities
    .filter((city) => city._searchName.includes(q))
    .slice(0, 10)
}
