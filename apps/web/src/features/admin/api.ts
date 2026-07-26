import { apiClient } from '@/shared/api/client'
import type { AuthResponse, AuthUser, LoginPayload } from '@/features/auth/types'

export async function adminLogin(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/admin/login', payload)
  return data
}

export async function fetchAdminDashboard(): Promise<{
  stats: {
    products: number
    categories: number
    brands?: number
    invoices?: number
    invoice_review?: number
    users?: number
    orders: number
    customers: number
  }
  notes: string[]
}> {
  const { data } = await apiClient.get('/admin/dashboard')
  return data
}

export async function fetchAdminSession(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>('/admin/session')
  return data
}

export async function fetchAdminUsers(): Promise<AuthUser[]> {
  const { data } = await apiClient.get<AuthUser[]>('/admin/users')
  return data
}

export async function createAdminUser(payload: {
  full_name: string
  email: string
  password: string
}): Promise<AuthUser> {
  const { data } = await apiClient.post<AuthUser>('/admin/users', payload)
  return data
}

export async function deleteAdminUser(id: string): Promise<void> {
  await apiClient.delete(`/admin/users/${id}`)
}
