#!/usr/bin/env node
// One-off generator: translates the backend interpretation seed into Russian
// for both grammatical genders via the Groq API.
//
// Reads  : ../nm-astrology/data/seed_interpretations.sql
// Cache  : scripts/out/ru-translations.jsonl   (append-only, enables resume)
// Writes : ../nm-astrology/data/seed_interpretations_ru.sql
//
// Usage:
//   node scripts/translate-interpretations.mjs            # full run (resumes)
//   node scripts/translate-interpretations.mjs --type sign --limit 20
//   node scripts/translate-interpretations.mjs --sql-only # rebuild SQL from cache

import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const SEED_IN = resolve(ROOT, '../nm-astrology/data/seed_interpretations.sql')
const SEED_OUT = resolve(ROOT, '../nm-astrology/data/seed_interpretations_ru.sql')
const CACHE_DIR = resolve(__dirname, 'out')
const CACHE_FILE = resolve(CACHE_DIR, 'ru-translations.jsonl')

const API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b'
const BATCH_SIZE = Number(process.env.BATCH_SIZE || 20)

const args = process.argv.slice(2)
const flag = (name) => args.includes(name)
const opt = (name, def) => {
  const i = args.indexOf(name)
  return i !== -1 && args[i + 1] ? args[i + 1] : def
}

const SQL_ONLY = flag('--sql-only')
const ONLY_TYPE = opt('--type', null)
const LIMIT = opt('--limit', null) ? Number(opt('--limit')) : null
// Which env variable holds the Groq key, e.g. --key-env GROQ_WEAL_API_KEY
const KEY_ENV = opt('--key-env', 'GROQ_API_KEY')

function loadEnv() {
  const envPath = resolve(ROOT, '.env')
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2]
  }
}

// ---------------------------------------------------------------- SQL parsing

// Splits one tuple body into fields, honoring '' escapes and NULL.
function parseTuple(body) {
  const fields = []
  let i = 0
  while (i < body.length) {
    while (body[i] === ' ') i++
    if (body[i] === "'") {
      let s = ''
      i++
      while (i < body.length) {
        if (body[i] === "'" && body[i + 1] === "'") {
          s += "'"
          i += 2
        } else if (body[i] === "'") {
          i++
          break
        } else {
          s += body[i++]
        }
      }
      fields.push(s)
    } else {
      let s = ''
      while (i < body.length && body[i] !== ',') s += body[i++]
      s = s.trim()
      fields.push(s === 'NULL' ? null : s)
    }
    while (body[i] === ' ') i++
    if (body[i] === ',') i++
  }
  return fields
}

function parseSeed() {
  const lines = readFileSync(SEED_IN, 'utf8').split('\n')
  const records = []
  for (const line of lines) {
    const t = line.trim()
    if (!t.startsWith("('")) continue
    let body = t.slice(1)
    body = body.replace(/\)\s*(ON CONFLICT DO NOTHING;)?,?\s*$/, '')
    const f = parseTuple(body)
    const type = f[0]
    if (type === 'sign') {
      records.push({ key: `sign|${f[1]}|${f[2]}`, type, planet: f[1], zodiac_sign: f[2], title: f[4], content: f[5] })
    } else if (type === 'house') {
      records.push({ key: `house|${f[1]}|${f[3]}`, type, planet: f[1], house: Number(f[3]), title: f[4], content: f[5] })
    } else if (type === 'aspect') {
      records.push({
        key: `aspect|${f[1]}|${f[4]}|${f[5]}|${f[6]}`,
        type,
        planet: f[1],
        aspect_type: f[4],
        natal_planet: f[5],
        variant_index: Number(f[6]),
        title: f[7],
        content: f[8],
      })
    }
  }
  return records
}

// -------------------------------------------------------------- Groq requests

const GENDER_LABEL = { male: 'мужчина', female: 'женщина' }
const GENDER_FORMS = {
  male: 'Читатель — мужчина. Используй мужские грамматические формы (например: «ты родился», «ты уверен», «ты готов»).',
  female: 'Читатель — женщина. Используй женские грамматические формы (например: «ты родилась», «ты уверена», «ты готова»).',
}

function systemPrompt(gender) {
  return [
    'Ты профессиональный переводчик астрологического мобильного приложения на русский язык.',
    'Переведи переданные тексты на естественный, живой русский язык.',
    'Требования:',
    `- ${GENDER_FORMS[gender]}`,
    '- Сохраняй астрологические термины и названия планет/знаков (Солнце, Луна, Овен, Телец и т.д.).',
    '- Перевод заголовка — без обращения к читателю, только название (например «Солнце в Овне»).',
    '- Не добавляй пояснений, markdown и кавычек вокруг перевода.',
    '- Верни строго JSON вида {"items":[{"key":"<key>","title":"<перевод заголовка>","content":"<перевод текста>"}]}.',
  ].join('\n')
}

async function callGroq(gender, batch) {
  const userContent = JSON.stringify({
    items: batch.map((r) => ({ key: r.key, title: r.title, content: r.content })),
  })

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env[KEY_ENV]}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.3,
      max_completion_tokens: 8000,
      reasoning_effort: 'low',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt(gender) },
        { role: 'user', content: userContent },
      ],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    const err = new Error(`Groq ${res.status}: ${text}`)
    err.status = res.status
    err.daily = /tokens per day|tokens_per_day|TPD/i.test(text)
    throw err
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content ?? ''
  const parsed = JSON.parse(content)
  if (!Array.isArray(parsed.items)) throw new Error('unexpected Groq JSON shape')
  return parsed.items
}

async function withRetry(fn, label) {
  const delays = [2000, 5000, 15000, 30000, 60000]
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (err.daily) throw err
      if (attempt >= delays.length) throw err
      const wait = delays[attempt]
      console.warn(`  retry ${label} in ${wait / 1000}s (${err.status || ''} ${err.message.slice(0, 120)})`)
      await new Promise((r) => setTimeout(r, wait))
    }
  }
}

// -------------------------------------------------------------------- SQL out

function sqlStr(s) {
  return `'${String(s).replace(/'/g, "''")}'`
}

function buildSql(records, translations) {
  const lines = [
    '-- Auto-generated by scripts/translate-interpretations.mjs. Do not edit by hand.',
    '-- Russian translations (male/female) for interpretations seeded by seed_interpretations.sql.',
    '',
  ]
  let missing = 0
  for (const r of records) {
    const m = translations.get(`${r.key}|male`)
    const f = translations.get(`${r.key}|female`)
    if (!m || !f) {
      missing++
      continue
    }
    let where
    if (r.type === 'sign') where = `type = 'sign' AND planet = ${sqlStr(r.planet)} AND zodiac_sign = ${sqlStr(r.zodiac_sign)}`
    else if (r.type === 'house') where = `type = 'house' AND planet = ${sqlStr(r.planet)} AND house = ${r.house}`
    else where = `type = 'aspect' AND planet = ${sqlStr(r.planet)} AND aspect_type = ${sqlStr(r.aspect_type)} AND natal_planet = ${sqlStr(r.natal_planet)} AND variant_index = ${r.variant_index}`

    lines.push(
      `UPDATE interpretations SET title_ru_male = ${sqlStr(m.title)}, content_ru_male = ${sqlStr(m.content)}, title_ru_female = ${sqlStr(f.title)}, content_ru_female = ${sqlStr(f.content)} WHERE ${where};`,
    )
  }
  return { sql: lines.join('\n') + '\n', missing }
}

function loadCache() {
  const map = new Map()
  if (!existsSync(CACHE_FILE)) return map
  for (const line of readFileSync(CACHE_FILE, 'utf8').split('\n')) {
    if (!line.trim()) continue
    try {
      const e = JSON.parse(line)
      map.set(`${e.key}|${e.gender}`, { title: e.title, content: e.content })
    } catch {}
  }
  return map
}

// ----------------------------------------------------------------------- main

async function main() {
  loadEnv()
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true })

  const records = parseSeed().filter((r) => !ONLY_TYPE || r.type === ONLY_TYPE)
  console.log(`Parsed ${records.length} records`)

  const translations = loadCache()
  console.log(`Cache: ${translations.size} translated entries`)

  if (!SQL_ONLY) {
    if (!process.env[KEY_ENV]) throw new Error(`${KEY_ENV} is not set`)

    const pending = records.filter((r) => !translations.has(`${r.key}|male`) || !translations.has(`${r.key}|female`))
    const target = LIMIT ? pending.slice(0, LIMIT) : pending
    console.log(`Pending: ${pending.length}, processing: ${target.length}`)

    // Both genders are produced per batch so finished records accumulate and
    // remain usable even if a run stops on the daily token limit.
    outer: for (let i = 0; i < target.length; i += BATCH_SIZE) {
      const batch = target.slice(i, i + BATCH_SIZE)
      for (const gender of ['male', 'female']) {
        const todo = batch.filter((r) => !translations.has(`${r.key}|${gender}`))
        if (todo.length === 0) continue
        process.stdout.write(`[${gender}] ${i + batch.length}/${target.length} ... `)
        try {
          const items = await withRetry(() => callGroq(gender, todo), `${gender} ${i}`)
          for (const it of items) {
            if (!it.key || !it.content) continue
            const entry = { key: it.key, gender, title: it.title ?? '', content: it.content }
            translations.set(`${it.key}|${gender}`, { title: entry.title, content: entry.content })
            appendFileSync(CACHE_FILE, JSON.stringify(entry) + '\n')
          }
          console.log('ok')
        } catch (err) {
          if (err.daily) {
            console.warn(`\nDaily token limit reached. Progress saved. Rerun later to resume.`)
            break outer
          }
          throw err
        }
      }
    }
  }

  const { sql, missing } = buildSql(records, translations)
  writeFileSync(SEED_OUT, sql)
  console.log(`Wrote ${SEED_OUT} (missing translations: ${missing})`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
