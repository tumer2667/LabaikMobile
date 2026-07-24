import { apiClient } from '@/shared/api/client'
import type { AuthResponse, AuthUser, LoginPayload } from '@/features/auth/types'

export async function adminLogin(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/admin/login', payload)
  return data
}

export async function fetchAdminDashboard(): Promise<{
  stats: { products: number; categories: number; orders: number; customers: number }
  notes: string[]
}> {
  const { data } = await apiClient.get('/admin/dashboard')
  return data
}

export async function fetchAdminSession(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>('/admin/session')
  return data
}
