import { apiClient } from '@/shared/api/client'

export type HealthResponse = {
  status: string
  service: string
  version: string
  environment: string
  currency: string
  locale: string
  timestamp: string
}

export async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>('/health')
  return data
}
