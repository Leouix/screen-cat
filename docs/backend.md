# Backend: NM Astrology

## Обзор

NM Astrology — бэкенд астрологического приложения на Go, расположенный в `../nm-astrology`. Рассчитывает натальные карты (VSOP87), ежедневные прогнозы (транзитные аспекты) и интерпретации планет в знаках, домах и аспектах.

> Актуальная документация бэкенда живёт в самом проекте: `../nm-astrology/docs/{API,ARCHITECTURE,SETUP}.md`. Здесь — краткое описание для работы над фронтендом.

## Стек

Go 1.26 · PostgreSQL 16 · chi/v5 · pgx/v5 · sqlc · golang-migrate · golang-jwt/v5 · vsop87-go · golang.org/x/time · go-cache · slog · Docker.

## Слои приложения

```
cmd/api/main.go                Точка входа, DI, миграции, seed, graceful shutdown
internal/
  api/                         HTTP-слой
    auth.go                    Регистрация, логин, refresh/logout, JWT middleware
    google.go / google_verify.go  Вход через Google (верификация ID-токена, RS256)
    handler.go                 CRUD-эндпоинты, маршрутизация (chi)
    prediction_cache.go        Кэш прогнозов
    ratelimit.go               Per-IP token bucket rate limiting
  service/                     Бизнес-логика
    chart.go                   Расчёт натальной карты (VSOP87, Ascendant Meeus, Whole Sign)
    transit.go                 Транзитные аспекты на произвольную дату
    aspect.go / aspect_text.go Расчёт и авторские тексты аспектов
    profile.go                 Сохранение профиля + расчёт карты
  storage/                     sqlc-генерация (db.go, models.go, query.sql.go)
  numeric/                     Конвертеры pgtype.Numeric <-> float64
  logger/                      Глобальный slog.Logger
migrations/                    golang-migrate миграции
data/seed_interpretations.sql  Seed интерпретаций (sign / house / aspect)
```

Правило для `internal/storage/`: не редактировать вручную — перегенерировать через `sqlc generate`.

## Эндпоинты

| Метод | Путь | Auth | Описание | Клиент (sprite-app) |
|---|---|---|---|---|
| `POST` | `/api/v1/register` | — | Регистрация (bcrypt + JWT) | — |
| `POST` | `/api/v1/login` | — | Логин → пара токенов | — |
| `POST` | `/api/v1/auth/google` | — | Вход через Google ID-токен | `postGoogleAuth` |
| `POST` | `/api/v1/refresh` | — | Ротация refresh-токена | — |
| `POST` | `/api/v1/logout` | — | Отзыв refresh-токена | — |
| `GET` | `/api/v1/get-data-planet?birth_date=` | — | Знак Солнца + интерпретация | `getPlanetByBirthDate` |
| `GET` | `/api/v1/prediction` | —* | Ежедневный прогноз (транзиты) | `getPrediction` |
| `GET` | `/api/v1/profile` | Bearer | Профиль пользователя | — |
| `PUT` | `/api/v1/profile` | Bearer | Обновить данные рождения + прогноз | `updateProfile` |
| `GET` | `/api/v1/profile/natal-chart` | Bearer | Натальная карта с интерпретациями | — |

\* `prediction` доступен публично на уровне API, но фронтенд-экран 4 требует авторизации (Google).

## Схема БД (PostgreSQL)

```sql
users
  id, email (UNIQUE), password_hash, name, birth_date (DATE),
  birth_time (TIME), latitude, longitude, timezone, created_at

user_chart_placements
  id, user_id (FK), planet, zodiac_sign, house,
  longitude_degrees, UNIQUE(user_id, planet)

interpretations
  id, type ('sign'|'house'|'aspect'), planet, zodiac_sign (NULL),
  house (NULL), aspect_type (NULL), natal_planet (NULL),
  variant_index (NULL), title, content

refresh_tokens
  id, user_id (FK), token_hash (SHA-256, UNIQUE),
  expires_at, revoked_at, created_at
```

## Безопасность

- **JWT** — access-токены HS256 (`jwt.WithValidMethods(["HS256"])`), долгий TTL (~90 дней)
- **Refresh-токены** — TTL 1 год, SHA-256 хэш в БД, ротация и отзыв через `/refresh` и `/logout`
- **Google OAuth** — верификация ID-токена (`RS256`, `GOOGLE_WEB_CLIENT_ID`)
- **Пароли** — bcrypt (cost=10)
- **Rate limiting** — per-IP token bucket: auth-эндпоинты (`RATE_LIMIT_AUTH_PER_MIN`, по умолчанию 10) и chart-эндпоинты (`RATE_LIMIT_CHART_PER_MIN`, по умолчанию 30)

## Точность расчётов

- **Планеты:** VSOP87, эклиптические долготы 9 планет
- **Ascendant:** формула Meeus
- **Дома:** Whole Sign
- **Прогноз:** транзитные аспекты (4–5 в день), кэшируются по дате в таймзоне пользователя; тексты интерпретаций — из БД с фолбэком на шаблоны в коде

**Известные ограничения:** только Whole Sign (Placidus требует итеративного алгоритма); высокие широты (>60°) — Ascendant может быть неточным.
