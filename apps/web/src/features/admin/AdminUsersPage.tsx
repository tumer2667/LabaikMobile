import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Navigate } from 'react-router-dom'
import { useState } from 'react'

import {
  createAdminUser,
  deleteAdminUser,
  fetchAdminUsers,
} from '@/features/admin/api'
import { useAuth } from '@/features/auth/AuthContext'
import { getApiErrorMessage } from '@/shared/api/client'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Skeleton } from '@/shared/ui/Skeleton'

const inputClass =
  'mt-1.5 w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-brand-blue'

function roleLabel(role: string) {
  if (role === 'super_admin') return 'Super admin'
  if (role === 'admin') return 'Admin'
  return role
}

export function AdminUsersPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isSuperAdmin = user?.role === 'super_admin'

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: fetchAdminUsers,
    enabled: isSuperAdmin,
  })

  const createMutation = useMutation({
    mutationFn: () =>
      createAdminUser({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
      }),
    onSuccess: () => {
      setFullName('')
      setEmail('')
      setPassword('')
      setError(null)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminUser(id),
    onSuccess: () => {
      setError(null)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  if (!isSuperAdmin) {
    return <Navigate to="/admin" replace />
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Users</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Create admin accounts. Admins can manage the catalog; only you can create users.
        </p>
      </div>

      <Card className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-ink">Add admin</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-ink sm:col-span-2">
            Name
            <input
              className={inputClass}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              autoComplete="name"
            />
          </label>
          <label className="text-sm font-medium text-ink">
            Email
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="off"
            />
          </label>
          <label className="text-sm font-medium text-ink">
            Password
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              autoComplete="new-password"
            />
          </label>
        </div>
        <Button
          disabled={
            !fullName.trim() ||
            !email.trim() ||
            password.length < 8 ||
            createMutation.isPending
          }
          onClick={() => createMutation.mutate()}
        >
          {createMutation.isPending ? 'Creating…' : 'Create admin'}
        </Button>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (
        <div className="space-y-3">
          {(data ?? []).map((u) => {
            const isSelf = u.id === user?.id
            const canDelete = u.role === 'admin' && !isSelf
            return (
              <Card key={u.id} className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{u.full_name}</p>
                  <p className="truncate text-sm text-ink-secondary">{u.email}</p>
                  <p className="mt-1 text-xs text-ink-muted">{roleLabel(u.role)}</p>
                </div>
                {canDelete ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-danger"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if (window.confirm(`Delete admin ${u.full_name}?`)) {
                        deleteMutation.mutate(u.id)
                      }
                    }}
                  >
                    Delete
                  </Button>
                ) : (
                  <span className="text-xs text-ink-muted">
                    {isSelf ? 'You' : 'Protected'}
                  </span>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
