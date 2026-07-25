const BASE_URL = 'http://10.0.2.2:8080'

export async function getPlanetByBirthDate(birthDate) {
  const url = `${BASE_URL}/api/v1/get-data-planet?birth_date=${birthDate}`
  console.log('[API] GET', url)
  try {
    const res = await fetch(url)
    console.log('[API] Response status:', res.status)
    if (!res.ok) {
      const text = await res.text()
      console.log('[API] Error body:', text)
      throw new Error(`API error: ${res.status}`)
    }
    const data = await res.json()
    console.log('[API] Response data:', JSON.stringify(data, null, 2))
    return data
  } catch (err) {
    console.log('[API] Fetch failed:', err.message)
    throw err
  }
}
