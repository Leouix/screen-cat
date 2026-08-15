# Архитектура приложения

## Обзор

Sprite App — Expo-приложение (SDK 57, New Architecture) на React Native + Tamagui. Проводит пользователя через 4 экрана сбора данных и показывает ежедневный астрологический прогноз (транзитные аспекты). Бэкенд — Go (`../nm-astrology`, см. [backend.md](./backend.md)).

## Слои

```
┌─────────────────────────────────┐
│      App.js (навигация, auth)   │
├─────────────────────────────────┤
│           Screens               │  BirthDate, Name, City, Prediction
├─────────────────────────────────┤
│         Components              │  StarryBackground, PlanetImage, Earth3d,
│                                 │  CitySearch, DailyPredictionMap,
│                                 │  AspectCardDeck, GoogleAuthOverlay,
│                                 │  BurgerMenu, SunDecoration,
│                                 │  shared/StyledComponents
├─────────────────────────────────┤
│          Services               │  api.js, auth.js, db.js, geo.js
├─────────────────────────────────┤
│   Utils / Data / Config         │  planets.js, prediction.js, trig.js,
│                                 │  cities_en.json, config.js
└─────────────────────────────────┘
```

## Навигация

Ручная, на `useState` + `BackHandler` в `App.js`. Порядок экранов — `SCREEN_ORDER = ['birthDate', 'name', 'city', 'prediction']`. Каждый экран получает собранные данные (`birthDate`, `birthTime`, `name`, `selectedCity`) через пропсы и на «NEXT» передаёт их дальше. Кнопка «Back» и системная кнопка «назад» возвращают на предыдущий экран. `expo-router`/`@react-navigation` не используются.

## Экраны

| Экран | Компонент | Собирает | Выходные данные |
|---|---|---|---|
| 1. Дата рождения | `BirthDateScreen` | дата + время (wheel-picker) | `birthDate` (`YYYY-MM-DD`), `birthTime` |
| 2. Планета и имя | `NameScreen` | планета-управитель + имя | `name` |
| 3. Город | `EarthWithCity` | город рождения | `selectedCity` (`name`, `country`, `latitude`, `longitude`, `timezone`) |
| 4. Карта предсказаний | `PredictionScreen` | прогноз + авторизация | — |

## Компоненты

| Компонент | Описание |
|---|---|
| `StarryBackground` | Звёздное небо (Skia, мерцание + дрейф) |
| `SunDecoration` | Декоративное «солнце» (Skia) |
| `PlanetImage` | Планета с внутренней тенью (Skia) |
| `Earth3d` | 3D-Земля с маркером города (Skia) |
| `CitySearch` | Поиск города по локальному `cities_en.json` |
| `DailyPredictionMap` | Круговая карта аспектов дня (Skia) |
| `AspectCardDeck` | Колода карточек аспектов |
| `GoogleAuthOverlay` | Оверлей входа через Google |
| `BurgerMenu` | Меню (бургер) с выходом из аккаунта |
| `shared/StyledComponents` | Переиспользуемые стилизованные примитивы (`BackgroundView`, `Label`, `PrimaryButton`, `SecondaryButton`, `BackButton`, `MainContainer`, `Divider`, `StyledInput` и др.) |

## State Management

Локальное состояние в `App.js` (`birthDate`, `birthTime`, `name`, `selectedCity`, `isLoggedIn`) и внутри экранов (`useState`, `useRef`). Долгоживущие данные (токен, профиль, кэш прогноза) — в SQLite через `services/db.js`. Внешние стейт-библиотеки (Redux/Zustand) не используются.

## Сервисы

| Сервис | Назначение |
|---|---|
| `api.js` | fetch-клиент с таймаутом (AbortController): `getPlanetByBirthDate`, `getPrediction`, `updateProfile`, `postGoogleAuth` |
| `auth.js` | Google Sign-In: `signInWithGoogle`, `googleSignOut`, `isGoogleSignedIn` |
| `db.js` | SQLite (`expo-sqlite`): таблицы `auth`, `profile`, `prediction` (кэш по дате + input-ключ) |
| `geo.js` | Поиск городов по подстроке в `data/cities_en.json` |

## Хранение данных (expo-sqlite)

| Таблица | Содержимое |
|---|---|
| `auth` | JWT-токен + данные пользователя (`user_json`) |
| `profile` | Данные рождения: `birth_date`, `birth_time`, `name`, `latitude`, `longitude`, `timezone` |
| `prediction` | Кэш прогноза: `date`, `data_key` (хэш входных параметров), `data_json` |

Кэш прогноза считается свежим, если `data_key` совпадает и `date` равен сегодняшнему дню (dayjs). Логика в `PredictionScreen.js` (`init`).

## API-слой

Базовый fetch-клиент в `services/api.js`. Базовый URL — `src/config.js` (`EXPO_PUBLIC_API_URL` или дефолт: Android-эмулятор `http://10.0.2.2:8080`, остальные `http://localhost:8080`).

Эндпоинты:

| Метод | Путь | Клиент |
|---|---|---|
| `GET` | `/api/v1/get-data-planet?birth_date=` | `getPlanetByBirthDate` |
| `GET` | `/api/v1/prediction` | `getPrediction` |
| `POST` | `/api/v1/auth/google` | `postGoogleAuth` |
| `PUT` | `/api/v1/profile` | `updateProfile` |

## Зависимости и их роль

| Зависимость | Роль |
|---|---|
| `expo` | Сборка, dev-сервер, нативные модули |
| `tamagui` / `@tamagui/config` | UI-компоненты, тема |
| `@shopify/react-native-skia` | 2D-графика (звёзды, планеты, Земля, карта аспектов) |
| `react-native-reanimated` / `react-native-worklets` | Анимации |
| `@expo-google-fonts/montserrat` | Шрифт Montserrat |
| `@quidone/react-native-wheel-picker` | Пикер даты/времени |
| `@react-native-google-signin/google-signin` | Вход через Google |
| `expo-sqlite` | Локальная БД (auth, profile, prediction) |
| `expo-font` | Кастомные шрифты |
| `expo-status-bar` | Управление строкой состояния |
| `dayjs` | Работа с датами |
| `react-native-safe-area-context` | Безопасные зоны (notch, home indicator) |
