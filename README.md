# Sprite App

Астрологическое мобильное приложение для построения натальных карт и гороскопов. Проводит пользователя через 5 экранов (загрузка → дата рождения → имя → город → карта предсказаний) и показывает ежедневный прогноз на основе транзитных аспектов. При сохранённом профиле и авторизации сплеш-экран пропускает онбординг и ведёт сразу на карту предсказаний.

## Технологический стек

- **Expo** ^57 (SDK 57, New Architecture)
- **React Native** 0.86.0
- **React** 19.2.3
- **Tamagui** ^2.5.0 — UI-компоненты и тема
- **TypeScript** ~6.0.3 (только конфиги; основной код на JavaScript)

### Зависимости

| Пакет | Назначение |
|---|---|
| `tamagui` / `@tamagui/config` / `@tamagui/babel-plugin` | Компоненты и конфигурация темы |
| `@shopify/react-native-skia` | 2D-графика: звёздный фон, планеты, 3D-Земля, карта аспектов |
| `react-native-reanimated` / `react-native-worklets` | Анимации |
| `@expo-google-fonts/montserrat` | Шрифт Montserrat (400/500/600/700) |
| `@quidone/react-native-wheel-picker` | Вращающийся пикер даты и времени |
| `@react-native-google-signin/google-signin` | Вход через Google |
| `expo-sqlite` | Локальная БД: авторизация, профиль, кэш прогноза |
| `expo-font` | Загрузка кастомных шрифтов |
| `expo-status-bar` | Управление строкой состояния |
| `dayjs` | Работа с датами |
| `react-native-safe-area-context` | Безопасные зоны (notch, home indicator) |

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Настройка окружения (опционально)
cp .env.example .env   # EXPO_PUBLIC_API_URL, EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID

# Запуск dev-сервера
npm start

# Запуск на конкретной платформе
npm run android
npm run ios
npm run web
```

Требования: Node.js, npm. Для нативных платформ — Android SDK или Xcode. Для входа через Google нужен `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` и запуск нативно (`npx expo run:android`), т.к. Google Sign-In не работает в Expo Go.

## Структура проекта

```
sprite-app/
├── index.js                  # Точка входа (registerRootComponent)
├── App.js                    # Корневой компонент: ручная навигация между экранами, состояние авторизации
├── tamagui.config.ts         # Конфигурация Tamagui (defaultConfig v5, тёмная тема)
├── app.json                  # Конфигурация Expo (SDK 57, dark, portrait, Google Sign-In)
├── babel.config.js           # Babel (babel-preset-expo; Tamagui-плагин не подключён)
├── tsconfig.json             # TypeScript (строгий режим)
├── .env.example              # Переменные окружения
├── package.json
├── PLAN.md                   # План реализации (утверждён, не изменять)
├── AGENTS.md                 # Инструкции для AI-агентов
├── SCREENS.md                # Сценарий экранов
├── CODE_REVIEW.md            # Отчёт код-ревью
├── src/
│   ├── config.js             # API_BASE_URL, таймауты, Google Web Client ID
│   ├── screens/              # Экраны (Splash, BirthDate, Name, City, Prediction)
│   ├── components/           # StarryBackground, PlanetImage, Earth3d, CitySearch,
│   │                         # DailyPredictionMap, AspectCardDeck, GoogleAuthOverlay,
│   │                         # BurgerMenu, SunDecoration, shared/StyledComponents
│   ├── services/             # api.js, auth.js, db.js (SQLite), geo.js (поиск городов)
│   ├── utils/                # planets.js, prediction.js, trig.js
│   └── data/                 # cities_en.json (справочник городов)
├── assets/
│   ├── icon.png
│   ├── adaptive-icon.png
│   ├── splash-icon.png
│   ├── favicon.png
│   └── planets/              # PNG-изображения планет
└── docs/
    ├── architecture.md       # Архитектура приложения
    ├── design-tokens.md      # Дизайн-токены из Figma
    └── backend.md            # Архитектура бэкенда nm-astrology
```

## Экраны

Приложение проходит пользователя через 5 экранов (`SCREEN_ORDER` в `App.js`):

0. **Splash** — загрузка шрифтов и БД; при авторизованном пользователе с сохранённым профилем ведёт сразу на экран 4
1. **BirthDate** — дата и время рождения (wheel-picker), кнопка NEXT / Skip
2. **Name** — планета-управитель дня рождения, поле имени
3. **City** — 3D-Земля + поиск города рождения (локальный `cities_en.json`)
4. **Prediction** — карта предсказаний: транзитные аспекты, авторизация через Google, бургер-меню с выходом

Навигация — ручная через `useState` + `BackHandler` в `App.js`, без `expo-router`/`@react-navigation`.

## API бэкенда

См. [docs/backend.md](./docs/backend.md). Ключевые эндпоинты:

| Метод | Путь | Использование |
|---|---|---|
| `GET` | `/api/v1/get-data-planet?birth_date=` | Экран 2: знак Солнца + интерпретация |
| `GET` | `/api/v1/prediction` | Экран 4: ежедневный прогноз |
| `POST` | `/api/v1/auth/google` | Вход через Google |
| `PUT` | `/api/v1/profile` | Синхронизация профиля + прогноза |

## Конфигурация

- **`app.json`** — имя приложения, иконки, сплеш-экран, плагины (`expo-sqlite`, `expo-font`, `expo-status-bar`, `@react-native-google-signin/google-signin`), portrait-ориентация, edge-to-edge и Android package `com.leo546.spriteapp`
- **`tamagui.config.ts`** — тема Tamagui на базе `defaultConfig` v5; дизайн-токены пока заданы в компонентах
- **`babel.config.js`** — `babel-preset-expo` (Tamagui Babel-плагин в зависимостях, но не подключён)
- **`.env`** — `EXPO_PUBLIC_API_URL` (адрес бэкенда), `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` (Google OAuth)

## Дизайн

UI-кит: [Advisor — Astrology App | Mobile UI Kit](https://www.figma.com/design/493l8QKB5vndt5VRYEfEoT/) в Figma.

Тёмная тема с палитрой Deep Space: фон `#0B0C10`, золотой акцент `#f8df61`, шрифт Montserrat. Подробности в [docs/design-tokens.md](./docs/design-tokens.md).

## Запуск эмулятора

```
npx expo run:android
```
