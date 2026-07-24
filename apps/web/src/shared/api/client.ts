import axios from 'axios'

import { appConfig } from '@/shared/config/env'

export const apiClient = axios.create({
  baseURL: appConfig.apiUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // Auth refresh + normalized error mapping land in Phase 3
    return Promise.reject(error)
  },
)
