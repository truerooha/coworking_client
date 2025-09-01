// Конфигурация API для приложения
export const API_BASE_URL = 'https://coworkingserver-production.up.railway.app';

// Функции для работы с API
export const api = {
  // Аутентификация
  auth: {
    check: `${API_BASE_URL}/api/auth/check`,
    users: `${API_BASE_URL}/api/auth/users`,
  },
  
  // Комнаты
  rooms: `${API_BASE_URL}/api/rooms`,
  
  // Бронирования (если понадобятся в будущем)
  bookings: `${API_BASE_URL}/api/bookings`,
};

// Вспомогательная функция для создания полного URL
export function createApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

// Вспомогательная функция для проверки, что URL относительный
export function isRelativeUrl(url: string): boolean {
  return !url.startsWith('http://') && !url.startsWith('https://');
}
