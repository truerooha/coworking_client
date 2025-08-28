// Чтение переменных окружения Vite. На Vercel задавайте VITE_* переменные.
// Локально используйте .env/.env.local в папке client.
export const API_BASE_URL: string | undefined = (import.meta as any)?.env?.VITE_API_BASE_URL;
export const IS_PROD = (import.meta as any)?.env?.PROD as boolean;
export const MODE = (import.meta as any)?.env?.MODE as string;

if (IS_PROD) {
  // Диагностика: видно в консоли прода, поможет понять, схватилась ли переменная
  // Не логируем весь import.meta.env, чтобы не засорять консоль
  // eslint-disable-next-line no-console
  console.log('[env] MODE=%s, API_BASE_URL=%s', MODE, API_BASE_URL || '(undefined)');
}


