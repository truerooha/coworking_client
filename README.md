# Coworking Client

Клиентское приложение для бронирования переговорных комнат.

## 🚀 Запуск

```bash
npm install
npm run dev
```

## 🔧 Конфигурация API

### Основной модуль: `src/config/api.ts`

```typescript
import { api, API_BASE_URL } from './config/api';

// Использование готовых URL
const usersUrl = api.auth.users;        // /api/auth/users
const roomsUrl = api.rooms;             // /api/rooms
const authCheckUrl = api.auth.check;    // /api/auth/check

// Создание кастомных URL
import { createApiUrl } from './config/api';
const customUrl = createApiUrl('/api/custom/endpoint');
```

### Доступные эндпоинты:

- **Аутентификация:**
  - `api.auth.check` - проверка доступа пользователя
  - `api.auth.users` - управление пользователями

- **Комнаты:**
  - `api.rooms` - получение списка комнат

- **Бронирования:**
  - `api.bookings` - управление бронированиями (готово к использованию)

### Переменные окружения:

Для изменения базового URL отредактируйте `src/config/api.ts`:

```typescript
export const API_BASE_URL = 'https://your-server.com';
```

## 📱 Компоненты

- `AdminPanel` - панель администратора с управлением пользователями
- `RoomProfile` - профиль комнаты с бронированием
- `HomeScreen` - главный экран со списком комнат
- `BookingsScreen` - экран бронирований пользователя

## 🔐 Аутентификация

Приложение использует Telegram WebApp API для аутентификации. Пользователи должны быть предварительно добавлены в систему через админ панель.
  