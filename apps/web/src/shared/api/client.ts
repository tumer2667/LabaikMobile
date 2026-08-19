import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { appConfig } from '@/shared/config/env'

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let getAccessToken: (() => string | null) | null = null
let onUnauthorized: (() => Promise<boolean>) | null = null
let refreshPromise: Promise<boolean> | null = null

export function setAuthTokenGetter(getter: () => string | null) {
  getAccessToken = getter
}

export function setOnUnauthorized(handler: () => Promise<boolean>) {
  onUnauthorized = handler
}

export const apiClient = axios.create({
  baseURL: appConfig.apiUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 45_000,
})

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken?.()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined
    const status = error.response?.status
    const url = original?.url ?? ''

    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh')

    if (status !== 401 || !original || original._retry || isAuthEndpoint || !onUnauthorized) {
      return Promise.reject(error)
    }

    original._retry = true
    refreshPromise ??= onUnauthorized().finally(() => {
      refreshPromise = null
    })
    const ok = await refreshPromise
    if (!ok) return Promise.reject(error)

    const token = getAccessToken?.()
    if (token) original.headers.Authorization = `Bearer ${token}`
    return apiClient(original)
  },
)

export type ApiErrorBody = {
  error?: { code?: string; message?: string; details?: unknown }
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined
    return data?.error?.message ?? error.message ?? fallback
  }
  if (error instanceof Error) return error.message
  return fallback
}
