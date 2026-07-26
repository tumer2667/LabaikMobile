import { apiClient } from '@/shared/api/client'
import type { AuthResponse, AuthUser, LoginPayload } from '@/features/auth/types'
import type { FinanceReport, FinanceReportParams } from '@/features/admin/financeTypes'

export type DashboardActivity = {
  type: string
  title: string
  detail: string
  at: string | null
  href?: string | null
}

export type DashboardLogin = {
  user_id: string
  full_name: string
  email: string
  role: string
  role_label: string
  logged_in_at: string | null
}

export type DashboardInvoice = {
  id: string
  number: string
  status: string
  customer_name: string
  total_pkr: number
  refunded_pkr: number
  issued_at: string | null
  created_at: string | null
  created_by_name: string | null
  line_count: number
}

export type AdminDashboardData = {
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
  recent_invoices: DashboardInvoice[]
  last_logins: DashboardLogin[]
  last_login: DashboardLogin | null
  recent_activity: DashboardActivity[]
  notes: string[]
}

export async function adminLogin(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/admin/login', payload)
  return data
}

export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const { data } = await apiClient.get<AdminDashboardData>('/admin/dashboard')
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

export async function fetchFinanceReport(
  params: FinanceReportParams = {},
): Promise<FinanceReport> {
  const { data } = await apiClient.get<FinanceReport>('/admin/finance/report', { params })
  return data
}
