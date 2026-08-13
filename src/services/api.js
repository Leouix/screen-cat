import { API_BASE_URL, API_TIMEOUT_MS } from '../config'

async function fetchWithTimeout(url, options, timeoutMs = API_TIMEOUT_MS) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function request(url, options) {
  try {
    const res = await fetchWithTimeout(url, options)
    if (!res.ok) {
      let detail = ''
      try {
        detail = await res.text()
      } catch {}
      const message = detail ? `API error ${res.status}: ${detail}` : `API error: ${res.status}`
      return { ok: false, error: message }
    }
    return { ok: true, data: await res.json() }
  } catch (err) {
    if (err.name === 'AbortError') {
      return { ok: false, error: 'Request timed out' }
    }
    return { ok: false, error: err.message || 'Network error' }
  }
}

async function postJSON(url, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  return request(url, { method: 'POST', headers, body: JSON.stringify(body) })
}

export async function getPlanetByBirthDate(birthDate) {
  return request(`${API_BASE_URL}/api/v1/get-data-planet?birth_date=${birthDate}`)
}

export async function getPrediction({ birthDate, birthTime, latitude, longitude }) {
  const params = new URLSearchParams()
  params.append('birth_date', birthDate)
  if (birthTime) params.append('birth_time', birthTime)
  if (latitude != null) params.append('latitude', String(latitude))
  if (longitude != null) params.append('longitude', String(longitude))

  return request(`${API_BASE_URL}/api/v1/prediction?${params.toString()}`)
}

export async function postGoogleAuth({ idToken, name, email, birthDate, birthTime, latitude, longitude, timezone }) {
  const body = { id_token: idToken, birth_date: birthDate }
  if (name) body.name = name
  if (email) body.email = email
  if (birthTime) body.birth_time = birthTime
  if (latitude != null) body.latitude = latitude
  if (longitude != null) body.longitude = longitude
  if (timezone) body.timezone = timezone

  return postJSON(`${API_BASE_URL}/api/v1/auth/google`, body)
}
