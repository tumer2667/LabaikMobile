export const appConfig = {
  name: import.meta.env.VITE_APP_NAME ?? 'LabaikMobiles',
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api/v1',
  currency: import.meta.env.VITE_CURRENCY ?? 'PKR',
  locale: import.meta.env.VITE_LOCALE ?? 'en',
} as const
