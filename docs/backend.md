# Architecture

## Обзор

NM Astrology — бэкенд для астрологического приложения, рассчитывающий натальные карты и предоставляющий интерпретации планет в знаках и домах.

## Диаграмма зависимостей

```
┌─────────────────────────────────────────────────────────────┐
│                        cmd/api/main.go                       │
│  - Инициализация DI                                          │
│  - Запуск миграций                                           │
│  - Graceful shutdown                                         │
└───────────────────────────┬─────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ pgxpool  │  │ vsop87   │  │  geo/    │
        │  Pool    │  │   -go    │  │ CitySearch│
        └────┬─────┘  └────┬─────┘  └────┬─────┘
             │             │             │
             ▼             ▼             ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ storage  │  │ service  │  │ api/     │
        │ Queries  │  │  Chart   │  │ Handler  │
        └────┬─────┘  │  Profile │  │ Auth     │
             │        └────┬─────┘  └──────────┘
             │             │
             └──────┬──────┘
                    │
                    ▼
              ┌──────────┐
              │ PostgreSQL│
              └──────────┘
```

## Слои приложения

### 1. API Layer (`internal/api/`)

Отвечает за HTTP-запросы и ответы.

- **auth.go** — регистрация, логин, JWT middleware
- **handler.go** — CRUD-эндпоинты, маршрутизация

**Зона ответственности:**
- Парсинг запросов
- Валидация входных данных
- Вызов service-слоя
- Формирование JSON-ответов

### 2. Service Layer (`internal/service/`)

Бизнес-логика приложения.

- **chart.go** — расчёт натальной карты
  - Конвертация даты/времени → Julian Day
  - Расчёт эклиптических долгот планет (vsop87-go)
  - Расчёт Ascendant
  - Определение домов (Whole Sign)
- **profile.go** — координация сохранения профиля и расчёта карты

**Зона ответственности:**
- Расчёт астрологических данных
- Координация между storage и внешними библиотеками

### 3. Storage Layer (`internal/storage/`)

Автогенерированный sqlc код для работы с БД.

- **db.go** — интерфейс DBTX, структура Queries
- **models.go** — Go-модели таблиц
- **query.sql.go** — методы запросов

**Правило:** не редактировать вручную. Перегенерировать через `sqlc generate`.

### 4. Geo Layer (`internal/geo/`)

Поиск городов по названию.

- **cities.go** — загрузка JSON, поиск по подстроке

## Потоки данных

### Регистрация пользователя

```
POST /api/v1/register
    │
    ├─► auth.Register()
    │   ├─► queries.GetUserByEmail() — проверка уникальности
    │   ├─► bcrypt.GenerateFromPassword() — хеш пароля
    │   └─► queries.CreateUser() — сохранение в БД
    │
    └─► Return {token, user_id}
```

### Получение натальной карты

```
GET /api/v1/profile/natal-chart
    │
    ├─► JWT middleware — проверка токена
    │
    ├─► handler.GetNatalChart()
    │   ├─► queries.GetUserByID() — данные рождения
    │   ├─► queries.GetChartPlacementsByUserID() — знаки
    │   └─► queries.GetChartPlacementsWithHouseInterpretations() — дома
    │
    └─► Return {placements: [...]}
```

### Расчёт натальной карты (при регистрации)

```
service.CalculateNatalChart()
    │
    ├─► calculateJulianDay()
    │   └─► timeutils.CivilToJulian()
    │
    ├─► ephem.EclipticPosition() × 9 планет
    │
    ├─► calculateAscendant()
    │   └─► Формула Meeus (GMST + Latitude)
    │
    └─► calculateHouses() — Whole Sign
```

## Схема БД

```sql
users
├── id (PK)
├── email (UNIQUE)
├── password_hash
├── name
├── birth_date
├── birth_time
├── latitude
├── longitude
├── timezone
└── created_at

user_chart_placements
├── id (PK)
├── user_id (FK → users)
├── planet
├── zodiac_sign
├── house
├── longitude_degrees
└── UNIQUE(user_id, planet)

interpretations
├── id (PK)
├── type ('sign' | 'house')
├── planet
├── zodiac_sign (nullable)
├── house (nullable)
├── title
├── content
├── UNIQUE(planet, zodiac_sign) — для type='sign'
└── UNIQUE(planet, house) — для type='house'
```

## Безопасность

- **JWT-токены** — HS256, TTL 24 часа
- **Пароли** — bcrypt (cost=10)
- **CORS** — не настроен (добавить при необходимости)
- **Rate limiting** — не реализован (добавить при необходимости)

## Точность расчётов

- **Планеты:** ±0.01° (VSOP87 для внутренних планет)
- **Ascendant:** ±0.01° (формула Meeus)
- **Дома:** Whole Sign (точное определение знака)

**Известные ограничения:**
- Дома: только Whole Sign. Placidus требует итеративного алгоритма.
- Высокие широты (>60°): Ascendant может быть неточным.

