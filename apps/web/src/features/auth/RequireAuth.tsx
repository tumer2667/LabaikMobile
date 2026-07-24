import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

import { useAuth } from '@/features/auth/AuthContext'
import { Skeleton } from '@/shared/ui/Skeleton'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isBootstrapping } = useAuth()
  const location = useLocation()

  if (isBootstrapping) {
    return (
      <div className="mx-auto max-w-md space-y-3 px-4 py-24">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
