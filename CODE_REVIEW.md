# Код-ревью Sprite App

Дата: 2026-08-16
Охват: **фронтенд** (`sprite-app`) + **бэкенд** (`nm-astrology`), включая незакоммиченные изменения бэкенда (`PUT /api/v1/profile`, `internal/api/google_verify.go`). Бэкенд собран (`go build`) и тесты проходят (`go test`).

---

## Статус предыдущего ревью (2026-08-12)

**Закрыто:**
- **Timezone теперь передаётся.** `updateProfile` и `postGoogleAuth` уходят с `timezone` (`api.js:53-74`), в `syncProfile`/`handleGoogleSignIn` таймзона города пробрасывается (`PredictionScreen.js:36-43`).
- `expo-sqlite` больше не мёртвый — используется в `db.js`.
- `dayjs` используется (`PredictionScreen.js:108`).

**Не закрыто:**
- Проп `onSelect` в `DeckCard` не используется (`AspectCardDeck.js:9, 123`).
- `Dimensions.get('window')` вместо `useWindowDimensions` (`StarryBackground.js:51`, `Earth3d.js:92`).
- «when were you born?» без капса (`BirthDateScreen.js:61`).

---

## Критические

++ **Утечка `password_hash` в API.** `GetProfile` и `UpdateProfile` сериализуют `storage.User` целиком, а у структуры есть `json:"password_hash"` (`models.go:27`). Т.е. `GET /api/v1/profile` и `PUT /api/v1/profile` отдают bcrypt-хэш пароля клиенту (`handler.go:320, 391`). При этом `docs/API.md:226` прямо обещает, что хэш «не возвращается в API». Нужна DTO профиля без `password_hash`.

- **Натальная карта всегда пустая.** `ProfileService.CreateProfileAndCalculateChart` (`profile.go:21`) нигде не вызывается — `profileService` инжектится, но не используется (`main.go:86-89`). Значит `user_chart_placements` не заполняется, и `GET /api/v1/profile/natal-chart` всегда вернёт `placements: []`. После `UpdateProfile` кэш расчёта тоже не пересчитывается.

++ **`Register` усекает координаты до целых.** `float64ToNumeric` (в `auth.go:101-102` и `profile.go:82-91`) берёт `big.Int` от float — дробная часть теряется: 55.7558 → 55. Google-флоу использует `float64ToNumericExact` (`google.go:177`). Расхождение: регистрация по email хранит некорректные lat/lng. Нужно использовать `float64ToNumericExact` везде.

++ **Timezone не участвует в расчёте предсказания.** «Сегодня» определяется как `time.Now().UTC()` (`handler.go:196`), таймзона пользователя игнорируется и в `buildPredictionResponse`, и в `CalculateTransits` (`transit.go:27`). Для дневного гороскопа это критично: «день» у пользователя в +9 может отличаться от UTC.

- **JWT живёт вечно.** `generateToken` не ставит `exp` (`auth.go:168-175`) — украденный токен валиден бессрочно. Задокументировано как осознанное решение, но стоит хотя бы долгий TTL + refresh.

- **JWTMiddleware не фиксирует алгоритм подписи.** Нет `jwt.WithValidMethods([]string{"HS256"})` (`auth.go:191-193`) — классический вектор algorithm confusion (секрет не публичный, но лучше зафиксировать явно).

---

## Важные

- **`UpdateProfile` не атомарен.** Сначала `UPDATE users`, потом `buildPredictionResponse`; при ошибке расчёта профиль уже изменён, а клиент получает 500 (`handler.go:369-391`). Лучше считать prediction до коммита или делать расчёт до обновления.

- **Нет валидации формата `birth_date`.** `parseDate` возвращает `Valid: false` (`auth.go:227-233`), запись в `birth_date DATE NOT NULL` падает → 500 вместо 400. То же в `Register`.

- **`GetNatalChart` делает лишний запрос ради проверки существования:** `user, err := ...; _ = user` (`handler.go:79-84`). Запрос можно удалить или использовать результат.

- **Заглушки неиспользуемых импортов:** `var _ = json.Marshal`, `var _ = pgtype.Numeric{}` (`handler.go:21-22`) — сейчас `json` и `pgtype` реально используются, заглушки мёртвые.

- **Дублирование `numericToFloat64`** в `handler.go:418-435` и `profile.go:63-80`.

- **Нет rate-limiting** на `/login` и `/auth/google` (`auth.go`, `google.go`) — открыт брутфорс/перебор; `/prediction` — дорогой расчёт без кэша (легко досить).

- **Анонимный пользователь не может увидеть прогноз.** При `auth_required` рендерится только `GoogleAuthOverlay` без варианта «Skip» (`PredictionScreen.js:263-268`). Публичный `GET /prediction` тогда фактически никто не использует — либо убрать блокировку, либо сделать эндпоинт приватным.

- **Деблирование городов в city_en.json

---

## Мелочи (фронтенд)

- `handleGoogleSignIn` использует `name` (строка 149), но в `deps` его нет (`PredictionScreen.js:174`).
- `init()` в `PredictionScreen.js:97-127`: `cancelled` проверяется только один раз после `Promise.all` — при размонтировании во время `syncProfile`/`fetchPublicPrediction` возможен setState после анмаунта.
- Мёртвый импорт `TextDecoration` из skia (`BirthDateScreen.js:16`).
- `onSelect` в `DeckCard` не используется (`AspectCardDeck.js:9`).
- `Dimensions.get('window')` в `StarryBackground.js:51` и `Earth3d.js:92` — не устаревают при ресайзе/повороте.
- «when were you born?» без капса и точки (`BirthDateScreen.js:61`).
- Русские комментарии в `StarryBackground.js` и `Earth3d.js` — кодовая база уже на английском.
- `EarthWithCity.js:17` рисует дефолтный Бишкек, но в прогноз при «Skip» уходит `lat/lng = undefined` → бэкенд считает для (0,0) — экран и запрос показывают разное.
- Лишние пробелы в `App.js:139`.

## Мелочи (бэкенд / инфраструктура)

- `docs/API.md` устарел: эндпоинт `GET /api/v1/geo/cities` удалён из кода (в `SetupRoutes` его нет), примеры и поля на русском, обещание про `password_hash` не соответствует коду.
- `AGENTS.md` (фронтенд) говорит про **Expo 54**, а в `package.json` — **SDK 57** (`expo ^57`, RN 0.86, react 19.2.3). Документация отстала от проекта.
- `seedInterpretations` читает `data/seed_interpretations.sql` относительно cwd (`main.go:141`) — при запуске из другой директории seed молча пропустится.
- Кэш prediction — одна строка `id=1` (`db.js:21-26`) — хранит только последний input. Для MVP ок, но при нескольких профилях на устройстве не масштабируется.
- На фронтенде нет линтера и тестов; в бэкенде тесты есть только для `aspect`-логики.
- Незакоммиченная работа на бэкенде: `PUT /profile` (`handler.go`, `query.sql`, `query.sql.go`) и `internal/api/google_verify.go` (untracked) — стоит закоммитить, чтобы изменения не потерялись.
