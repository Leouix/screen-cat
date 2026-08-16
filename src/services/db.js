import { openDatabaseAsync } from 'expo-sqlite'

const DB_NAME = 'sprite-app.db'

let dbPromise = null

function buildDataKey({ birthDate, birthTime, latitude, longitude, timezone }) {
  return [birthDate ?? '', birthTime ?? '', latitude ?? '', longitude ?? '', timezone ?? ''].join('|')
}

function getDb() {
  if (!dbPromise) {
    dbPromise = openDatabaseAsync(DB_NAME).then(async (db) => {
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS auth (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          token TEXT NOT NULL,
          user_json TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS prediction (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          date TEXT NOT NULL,
          data_key TEXT,
          data_json TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS profile (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          birth_date TEXT,
          birth_time TEXT,
          name TEXT,
          latitude REAL,
          longitude REAL,
          timezone TEXT,
          synced INTEGER NOT NULL DEFAULT 0
        );
      `)
      try {
        await db.execAsync('ALTER TABLE prediction ADD COLUMN data_key TEXT')
      } catch {}
      try {
        await db.execAsync('ALTER TABLE profile ADD COLUMN synced INTEGER NOT NULL DEFAULT 0')
      } catch {}
      return db
    })
  }
  return dbPromise
}

export async function saveAuth({ token, user }) {
  const db = await getDb()
  await db.runAsync(
    'INSERT INTO auth (id, token, user_json) VALUES (1, ?, ?) ON CONFLICT (id) DO UPDATE SET token = excluded.token, user_json = excluded.user_json',
    token,
    JSON.stringify(user ?? {}),
  )
}

export async function loadAuth() {
  const db = await getDb()
  const row = await db.getFirstAsync('SELECT token, user_json FROM auth WHERE id = 1')
  if (!row) return null
  return { token: row.token, user: JSON.parse(row.user_json) }
}

export async function clearAuth() {
  const db = await getDb()
  await db.runAsync('DELETE FROM auth WHERE id = 1')
}

export async function saveProfile(profile, { synced } = {}) {
  if (!profile) return
  const db = await getDb()
  if (synced === undefined) {
    const row = await db.getFirstAsync('SELECT birth_date, birth_time, name, latitude, longitude, timezone, synced FROM profile WHERE id = 1')
    const same =
      !!row &&
      (row.birth_date ?? null) === (profile.birthDate ?? null) &&
      (row.birth_time ?? null) === (profile.birthTime ?? null) &&
      (row.name ?? null) === (profile.name ?? null) &&
      (row.latitude ?? null) === (profile.latitude ?? null) &&
      (row.longitude ?? null) === (profile.longitude ?? null) &&
      (row.timezone ?? null) === (profile.timezone ?? null)
    const syncValue = same && row ? row.synced : 0
    await db.runAsync(
      'INSERT INTO profile (id, birth_date, birth_time, name, latitude, longitude, timezone, synced) VALUES (1, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (id) DO UPDATE SET birth_date = excluded.birth_date, birth_time = excluded.birth_time, name = excluded.name, latitude = excluded.latitude, longitude = excluded.longitude, timezone = excluded.timezone, synced = excluded.synced',
      profile.birthDate ?? null,
      profile.birthTime ?? null,
      profile.name ?? null,
      profile.latitude ?? null,
      profile.longitude ?? null,
      profile.timezone ?? null,
      syncValue,
    )
  } else {
    await db.runAsync(
      'INSERT INTO profile (id, birth_date, birth_time, name, latitude, longitude, timezone, synced) VALUES (1, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (id) DO UPDATE SET birth_date = excluded.birth_date, birth_time = excluded.birth_time, name = excluded.name, latitude = excluded.latitude, longitude = excluded.longitude, timezone = excluded.timezone, synced = excluded.synced',
      profile.birthDate ?? null,
      profile.birthTime ?? null,
      profile.name ?? null,
      profile.latitude ?? null,
      profile.longitude ?? null,
      profile.timezone ?? null,
      synced ? 1 : 0,
    )
  }
}

export async function loadProfile() {
  const db = await getDb()
  const row = await db.getFirstAsync('SELECT birth_date, birth_time, name, latitude, longitude, timezone, synced FROM profile WHERE id = 1')
  if (!row) return null
  return {
    birthDate: row.birth_date,
    birthTime: row.birth_time,
    name: row.name,
    latitude: row.latitude,
    longitude: row.longitude,
    timezone: row.timezone,
    synced: row.synced === 1,
  }
}

export async function savePrediction(prediction, input) {
  if (!prediction || !prediction.date) return
  const db = await getDb()
  await db.runAsync(
    'INSERT INTO prediction (id, date, data_key, data_json) VALUES (1, ?, ?, ?) ON CONFLICT (id) DO UPDATE SET date = excluded.date, data_key = excluded.data_key, data_json = excluded.data_json',
    prediction.date,
    buildDataKey(input),
    JSON.stringify(prediction),
  )
}

export async function loadPrediction(input) {
  const db = await getDb()
  const row = await db.getFirstAsync('SELECT data_json FROM prediction WHERE id = 1 AND data_key = ?', buildDataKey(input))
  if (!row) return null
  return JSON.parse(row.data_json)
}
