#!/usr/bin/env node
// Offline generator for src/data/cities.json.
//
// Sources (GeoNames, CC BY 4.0):
//   cities5000.zip        world cities (population > 5000 or admin seats)
//   RU.zip                all Russian populated places (extra completeness)
//   alternateNamesV2.zip  localized names, filtered to isolanguage=ru
//   countryInfo.txt       country names (English) + country geonameids
//   admin1CodesASCII.txt  admin1 (region) names (English) + geonameids
//
// Downloads are cached in scripts/out/geonames/ (gitignored). Archives are
// streamed through the system `unzip`, nothing is extracted to disk.
//
// Usage:
//   node scripts/build-cities.mjs
//   node scripts/build-cities.mjs --ru-min-pop 2000
//   node scripts/build-cities.mjs --force        # re-download sources
//
// Writes: src/data/cities.json
//
// Hermes cannot compile array literals with more than 65535 elements, so the
// rows are emitted as chunks (see CHUNK_SIZE) that geo.js flattens at runtime.

import { createReadStream, createWriteStream, existsSync, mkdirSync, writeFileSync, statSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { spawn } from 'node:child_process'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const CACHE_DIR = resolve(__dirname, 'out/geonames')
const OUT_FILE = resolve(ROOT, 'src/data/cities.json')

const DUMP = 'https://download.geonames.org/export/dump'
const SOURCES = [
  { url: `${DUMP}/cities5000.zip`, file: 'cities5000.zip' },
  { url: `${DUMP}/RU.zip`, file: 'RU.zip' },
  { url: `${DUMP}/alternateNamesV2.zip`, file: 'alternateNamesV2.zip' },
  { url: `${DUMP}/countryInfo.txt`, file: 'countryInfo.txt' },
  { url: `${DUMP}/admin1CodesASCII.txt`, file: 'admin1CodesASCII.txt' },
]

// geoname table column indexes
const G = {
  id: 0, name: 1, ascii: 2, lat: 4, lng: 5, fclass: 6, fcode: 7,
  cc: 8, admin1: 10, population: 14, timezone: 17,
}

const SEAT_CODES = new Set(['PPLC', 'PPLA', 'PPLA2', 'PPLA3', 'PPLA4', 'PPLG', 'PPLH'])

// Hermes caps array literals at 65535 elements; keep well below it.
const CHUNK_SIZE = 20000

const args = process.argv.slice(2)
const opt = (name, def) => {
  const i = args.indexOf(name)
  return i !== -1 && args[i + 1] ? args[i + 1] : def
}
const FORCE = args.includes('--force')
const RU_MIN_POP = Number(opt('--ru-min-pop', 1000))

// ---------------------------------------------------------------- utilities

function log(...a) {
  console.log(...a)
}

async function download({ url, file }) {
  const dest = resolve(CACHE_DIR, file)
  if (!FORCE && existsSync(dest) && statSync(dest).size > 0) {
    log(`  cached  ${file}`)
    return dest
  }
  log(`  fetching ${file} ...`)
  const res = await fetch(url)
  if (!res.ok || !res.body) throw new Error(`Failed to download ${url}: ${res.status}`)
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest))
  const mb = (statSync(dest).size / 1048576).toFixed(1)
  log(`  saved   ${file} (${mb} MB)`)
  return dest
}

// Streams one entry of a zip archive through `unzip -p` as an async line iterator.
async function* zipLines(zipPath, entry) {
  const child = spawn('unzip', ['-p', zipPath, entry], { stdio: ['ignore', 'pipe', 'inherit'] })
  const rl = createInterface({ input: child.stdout, crlfDelay: Infinity })
  for await (const line of rl) yield line
  const code = await new Promise((res) => child.on('close', res))
  if (code !== 0) throw new Error(`unzip ${zipPath} ${entry} exited with ${code}`)
}

async function* fileLines(path) {
  const rl = createInterface({ input: createReadStream(path), crlfDelay: Infinity })
  for await (const line of rl) yield line
}

function round(n, digits = 4) {
  const f = 10 ** digits
  return Math.round(Number(n) * f) / f
}

function parseCityLine(line, filter) {
  const f = line.split('\t')
  if (f.length < 19 || f[G.fclass] !== 'P') return null
  const cc = f[G.cc]
  if (filter && !filter(f, cc)) return null
  const population = Number(f[G.population]) || 0
  return {
    id: Number(f[G.id]),
    name: f[G.name],
    cc,
    admin1: f[G.admin1],
    lat: round(f[G.lat]),
    lng: round(f[G.lng]),
    tz: f[G.timezone] || '',
    population,
  }
}

// ---------------------------------------------------------------- pipeline

async function main() {
  mkdirSync(CACHE_DIR, { recursive: true })
  log('Downloading GeoNames sources:')
  const files = {}
  for (const src of SOURCES) files[src.file] = await download(src)

  // 1. World cities (population > 5000 / admin seats).
  log('Parsing cities5000 ...')
  const cities = new Map()
  for await (const line of zipLines(files['cities5000.zip'], 'cities5000.txt')) {
    const c = parseCityLine(line)
    if (c) cities.set(c.id, c)
  }
  log(`  cities5000 entries: ${cities.size}`)

  // 2. Extra Russian completeness (all populated places >= RU_MIN_POP or seats).
  log(`Parsing RU extract (min population ${RU_MIN_POP} or seat) ...`)
  let ruAdded = 0
  for await (const line of zipLines(files['RU.zip'], 'RU.txt')) {
    const c = parseCityLine(line, (f) => Number(f[G.population]) >= RU_MIN_POP || SEAT_CODES.has(f[G.fcode]))
    if (!c) continue
    if (!cities.has(c.id)) ruAdded++
    cities.set(c.id, c)
  }
  log(`  total entries: ${cities.size} (+${ruAdded} from RU extract)`)

  // 3. English regions (admin1) and countries, keeping their geonameids.
  log('Parsing countryInfo and admin1CodesASCII ...')
  const regionMeta = new Map() // "RU.48" -> { en, id }
  for await (const line of fileLines(files['admin1CodesASCII.txt'])) {
    if (!line || line.startsWith('#')) continue
    const [code, name, , id] = line.split('\t')
    if (!code) continue
    regionMeta.set(code, { en: name, id: Number(id) })
  }

  const countryMeta = new Map() // "RU" -> { en, id }
  for await (const line of fileLines(files['countryInfo.txt'])) {
    if (!line || line.startsWith('#')) continue
    const f = line.split('\t')
    if (!f[0]) continue
    countryMeta.set(f[0], { en: f[4], id: Number(f[16]) })
  }

  // 4. Russian names for cities, regions and countries.
  log('Streaming alternateNamesV2 (ru only) ...')
  const needed = new Set(cities.keys())
  for (const r of regionMeta.values()) needed.add(r.id)
  for (const c of countryMeta.values()) needed.add(c.id)

  const ruNames = new Map() // geonameid -> ru name
  const preferred = new Set()
  let scanned = 0
  for await (const line of zipLines(files['alternateNamesV2.zip'], 'alternateNamesV2.txt')) {
    scanned++
    const f = line.split('\t')
    if (f.length < 4 || f[2] !== 'ru') continue
    const id = Number(f[1])
    if (!needed.has(id)) continue
    const name = f[3]
    if (!name) continue
    const isPreferred = f[4] === '1'
    const currentPreferred = preferred.has(id)
    if (ruNames.get(id) === undefined || (isPreferred && !currentPreferred)) {
      ruNames.set(id, name)
      if (isPreferred) preferred.add(id)
    }
  }
  log(`  alternateNamesV2 lines scanned: ${scanned}, ru names kept: ${ruNames.size}`)

  // 5. Build output structures.
  const referencedRegions = new Set()
  for (const c of cities.values()) referencedRegions.add(`${c.cc}.${c.admin1}`)

  const countries = {}
  for (const [cc, meta] of countryMeta) countries[cc] = [meta.en, ruNames.get(meta.id) || meta.en]

  const regions = {}
  for (const code of referencedRegions) {
    const meta = regionMeta.get(code)
    if (!meta) continue
    const ru = ruNames.get(meta.id) || meta.en
    if (ru !== meta.en) regions[code] = [meta.en, ru]
  }

  const rows = [...cities.values()]
    .map((c) => [c.name, ruNames.get(c.id) || '', c.cc, c.admin1, c.lat, c.lng, c.tz, c.population])
    .sort((a, b) => b[7] - a[7])

  const chunks = []
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) chunks.push(rows.slice(i, i + CHUNK_SIZE))

  const out = { v: 1, countries, regions, chunks }
  writeFileSync(OUT_FILE, JSON.stringify(out))

  const mb = (statSync(OUT_FILE).size / 1048576).toFixed(2)
  log('')
  log(`Wrote ${OUT_FILE}`)
  log(`  cities:   ${rows.length} (${chunks.length} chunks)`)
  log(`  regions:  ${Object.keys(regions).length}`)
  log(`  countries:${Object.keys(countries).length}`)
  log(`  size:     ${mb} MB`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
