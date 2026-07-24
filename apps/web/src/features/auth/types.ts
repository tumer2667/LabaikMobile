export type UserRole = 'customer' | 'admin' | 'sub_admin'
export type UserStatus = 'active' | 'disabled'

export type AuthUser = {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: UserRole
  status: UserStatus
  created_at: string
}

export type TokenPair = {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export type AuthResponse = {
  user: AuthUser
  tokens: TokenPair
}

export type RegisterPayload = {
  email: string
  password: string
  full_name: string
  phone?: string
}

export type LoginPayload = {
  email: string
  password: string
}
