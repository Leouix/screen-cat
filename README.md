# Sprite App

Астрологическое мобильное приложение для построения натальных карт и гороскопов.

## Технологический стек

- **Expo** ~54.0.34 (managed workflow, New Architecture)
- **React Native** 0.81.5
- **React** 19.1.0
- **Tamagui** ^2.5.0 — UI-компоненты и тема
- **TypeScript** ~5.9.2 (конфигурация; основной код на JavaScript)

### Зависимости

| Пакет | Назначение |
|---|---|
| `tamagui` / `@tamagui/config` | Компоненты и конфигурация темы |
| `@react-native-community/datetimepicker` | Нативный выбор даты |
| `expo-sqlite` | Локальная БД (планируется) |
| `expo-font` | Кастомные шрифты |
| `expo-status-bar` | Управление строкой состояния |

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера
npm start

# Запуск на конкретной платформе
npm run android
npm run ios
npm run web
```

Требования: Node.js, npm. Для нативных платформ — Android SDK или Xcode.

## Структура проекта

```
sprite-app/
├── App.js                  # Корневой компонент (экран ввода даты рождения)
├── index.js                # Точка входа (registerRootComponent)
├── tamagui.config.ts       # Конфигурация Tamagui (тема по умолчанию)
├── app.json                # Конфигурация Expo
├── babel.config.js         # Babel (babel-preset-expo)
├── tsconfig.json           # TypeScript (строгий режим)
├── package.json
├── PLAN.md                 # План реализации
├── AGENTS.md               # Инструкции для AI-агентов
├── assets/
│   ├── icon.png
│   ├── adaptive-icon.png
│   ├── splash-icon.png
│   └── favicon.png
└── docs/
    ├── architecture.md     # Архитектура приложения
    └── design-tokens.md    # Дизайн-токены из Figma
```

## Текущий статус

Реализован экран ввода даты рождения — точка входа в приложение. Используется нативный `DateTimePicker` с тёмной темой и кнопка «Далее» с золотой рамкой.

### План реализации

Полный план см. в [PLAN.md](./PLAN.md). Кратко:

1. Настройка темы и дизайн-токенов в Tamagui
2. Атомарные компоненты карточек и аккордеон
3. Главный экран (Dashboard) — гороскоп, шкалы, события дня
4. Натальная карта — круг через `react-native-skia`
5. Интеграция с API бэкенда

## Конфигурация

Основные файлы конфигурации:

- **`app.json`** — имя приложения, иконки, сплеш-экран, плагины (`expo-sqlite`, `datetimepicker`, `expo-font`), portrait-ориентация, edge-to-edge на Android
- **`tamagui.config.ts`** — тема Tamagui (пока конфигурация по умолчанию)
- **`babel.config.js`** — `babel-preset-expo` (Tamagui Babel-плагин пока не подключён)

## Дизайн

UI-кит: [Advisor — Astrology App | Mobile UI Kit](https://www.figma.com/design/493l8QKB5vndt5VRYEfEoT/) в Figma.

Тёмная тема с палитрой Deep Space: фон `#0B0C10`, золотые и фиолетовые акценты. Подробности в [docs/design-tokens.md](./docs/design-tokens.md).
