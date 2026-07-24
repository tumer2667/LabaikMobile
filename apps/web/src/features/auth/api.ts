import { apiClient } from '@/shared/api/client'
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  TokenPair,
} from '@/features/auth/types'

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', payload)
  return data
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', payload)
  return data
}

export async function refreshTokens(refreshToken: string): Promise<TokenPair> {
  const { data } = await apiClient.post<TokenPair>('/auth/refresh', {
    refresh_token: refreshToken,
  })
  return data
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post('/auth/logout', { refresh_token: refreshToken })
}

export async function fetchMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>('/auth/me')
  return data
}
