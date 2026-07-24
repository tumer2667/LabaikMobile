import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import * as authApi from '@/features/auth/api'
import { tokenStorage } from '@/features/auth/tokenStorage'
import type { AuthUser, LoginPayload, RegisterPayload } from '@/features/auth/types'
import { setAuthTokenGetter, setOnUnauthorized } from '@/shared/api/client'

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  acceptSession: (user: AuthUser, access: string, refresh: string) => void
  logout: () => Promise<void>
  refreshSession: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  const applyTokens = useCallback((access: string, refresh: string) => {
    tokenStorage.setAccess(access)
    tokenStorage.setRefresh(refresh)
  }, [])

  const clearSession = useCallback(() => {
    tokenStorage.clear()
    setUser(null)
  }, [])

  const refreshSession = useCallback(async () => {
    const refresh = tokenStorage.getRefresh()
    if (!refresh) {
      clearSession()
      return false
    }
    try {
      const tokens = await authApi.refreshTokens(refresh)
      applyTokens(tokens.access_token, tokens.refresh_token)
      const me = await authApi.fetchMe()
      setUser(me)
      return true
    } catch {
      clearSession()
      return false
    }
  }, [applyTokens, clearSession])

  useEffect(() => {
    setAuthTokenGetter(() => tokenStorage.getAccess())
    setOnUnauthorized(async () => refreshSession())
  }, [refreshSession])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const access = tokenStorage.getAccess()
      const refresh = tokenStorage.getRefresh()
      if (!access && !refresh) {
        if (!cancelled) setIsBootstrapping(false)
        return
      }
      try {
        if (access) {
          const me = await authApi.fetchMe()
          if (!cancelled) setUser(me)
        } else {
          await refreshSession()
        }
      } catch {
        await refreshSession()
      } finally {
        if (!cancelled) setIsBootstrapping(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [refreshSession])

  const acceptSession = useCallback(
    (nextUser: AuthUser, access: string, refresh: string) => {
      applyTokens(access, refresh)
      setUser(nextUser)
    },
    [applyTokens],
  )

  const login = useCallback(
    async (payload: LoginPayload) => {
      const res = await authApi.login(payload)
      applyTokens(res.tokens.access_token, res.tokens.refresh_token)
      setUser(res.user)
    },
    [applyTokens],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const res = await authApi.register(payload)
      applyTokens(res.tokens.access_token, res.tokens.refresh_token)
      setUser(res.user)
    },
    [applyTokens],
  )

  const logout = useCallback(async () => {
    const refresh = tokenStorage.getRefresh()
    try {
      if (refresh) await authApi.logout(refresh)
    } finally {
      clearSession()
    }
  }, [clearSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user != null,
      isBootstrapping,
      login,
      register,
      acceptSession,
      logout,
      refreshSession,
    }),
    [user, isBootstrapping, login, register, acceptSession, logout, refreshSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
