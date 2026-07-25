import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, type ReactNode } from 'react'

import { useAuth } from '@/features/auth/AuthContext'
import { isStaffRole } from '@/features/auth/types'
import { Skeleton } from '@/shared/ui/Skeleton'

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isBootstrapping, logout } = useAuth()
  const location = useLocation()
  const isAdmin = isStaffRole(user?.role)

  useEffect(() => {
    if (!isBootstrapping && isAuthenticated && user && !isAdmin) {
      void logout()
    }
  }, [isBootstrapping, isAuthenticated, user, isAdmin, logout])

  if (isBootstrapping) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0b1220] p-8">
        <div className="w-full max-w-sm space-y-3">
          <Skeleton className="h-8 w-40 bg-white/10" />
          <Skeleton className="h-24 w-full bg-white/10" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user || !isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return children
}
