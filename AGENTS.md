# Инструкции для AI-агентов

## Контекст проекта

**Sprite App** — астрологическое мобильное приложение (натальные карты, гороскопы). Строится на **Expo SDK 57** + React Native 0.86 + Tamagui. UI на **английском языке** (русский постепенно убирается из приложения). Бэкенд — Go (проект `../nm-astrology`).

## Документация

Перед написанием кода **обязательно** прочитать актуальную документацию:

- **Expo SDK 57**: https://docs.expo.dev/versions/v57.0.0/
- **Tamagui**: https://tamagui.dev
- **React Native**: https://reactnative.dev

## Конвенции кода

- Основной язык — **JavaScript**. TypeScript используется только для конфигов (`tamagui.config.ts`, `tsconfig.json`).
- UI-компоненты — из **Tamagui** (`YStack`, `XStack`, `Text`, `Button`, `Input` и т.д.).
- Тема — **тёмная** (`defaultTheme="dark"` в `TamaguiProvider`).
- Точка входа — `index.js` → `App.js`.
- Навигация — ручная, через `useState` + `BackHandler` в `App.js` (`SCREEN_ORDER`). **Не добавлять** `expo-router` или `@react-navigation` без явного запроса.
- Код и UI-строки — **на английском**.
- Код в `src/`: `screens/`, `components/`, `services/`, `utils/`, `data/`, конфиг в `src/config.js`.

## Ограничения

- **Не устанавливать** пакеты без явного указания в задаче.
- **Не изменять** `PLAN.md` — это утверждённый план реализации.
- Следовать порядку этапов из `PLAN.md`: тема → компоненты → дашборд → натальная карта → API. Уточнение: фактические экраны (см. `SCREENS.md`) уже реализованы и отличаются от исходного плана.
- Не подключать Tamagui Babel-плагин в `babel.config.js` без указания (плагин есть в зависимостях, но не настроен).
- **Не занимать** процесс бэкенда (`../nm-astrology`, запускается командой `air`). Если запускаешь его для проверки — остановить после проверки.

## Порядок работы

Реализовывать изменения **поэтапно**, согласно `PLAN.md`:

1. Настройка темы и дизайн-токенов в Tamagui
2. Атомарные компоненты (карточки, аккордеон)
3. Dashboard — гороскоп, шкалы, события дня
4. Натальная карта — круг через `react-native-skia`
5. Интеграция с API

Каждый этап — отдельная задача. Не объединять несколько этапов в одну итерацию.

## Статус реализации

- Экраны: `BirthDate` → `Name` → `City` → `Prediction` — реализованы (см. `SCREENS.md`).
- Skia: `StarryBackground`, `SunDecoration`, `PlanetImage`, `Earth3d`, `DailyPredictionMap`.
- API: `get-data-planet`, `prediction`, `auth/google`, `PUT profile`.
- Локальная БД (expo-sqlite): `auth`, `profile`, кэш `prediction`.

## Полезные ссылки

- План реализации: [PLAN.md](./PLAN.md)
- Сценарий экранов: [SCREENS.md](./SCREENS.md)
- Архитектура: [docs/architecture.md](./docs/architecture.md)
- Дизайн-токены: [docs/design-tokens.md](./docs/design-tokens.md)
- Бэкенд: [docs/backend.md](./docs/backend.md)


Пиши ответ мне на русском языке.
