import { openDatabaseAsync } from 'expo-sqlite'

const DB_NAME = 'sprite-app.db'

let dbPromise = null

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
          data_json TEXT NOT NULL
        );
      `)
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

export async function savePrediction(prediction) {
  if (!prediction || !prediction.date) return
  const db = await getDb()
  await db.runAsync(
    'INSERT INTO prediction (id, date, data_json) VALUES (1, ?, ?) ON CONFLICT (id) DO UPDATE SET date = excluded.date, data_json = excluded.data_json',
    prediction.date,
    JSON.stringify(prediction),
  )
}

export async function loadPrediction() {
  const db = await getDb()
  const row = await db.getFirstAsync('SELECT data_json FROM prediction WHERE id = 1')
  if (!row) return null
  return JSON.parse(row.data_json)
}
