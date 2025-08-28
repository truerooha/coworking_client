// Чтение переменных окружения Vite. На Vercel задавайте VITE_* переменные.
// Локально используйте .env/.env.local в папке client.
export const API_BASE_URL: string | undefined = (import.meta as any)?.env?.VITE_API_BASE_URL;


