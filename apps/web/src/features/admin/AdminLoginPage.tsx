import { Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'

import { useAuth } from '@/features/auth/AuthContext'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas'
import { adminLogin } from '@/features/admin/api'
import { getApiErrorMessage } from '@/shared/api/client'
import { appConfig } from '@/shared/config/env'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import logo from '@/assets/logo.png'

export function AdminLoginPage() {
  const { isAuthenticated, user, isBootstrapping, acceptSession, logout } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'admin@labaikmobiles.com', password: '' },
  })

  if (!isBootstrapping && isAuthenticated && (user?.role === 'admin' || user?.role === 'sub_admin')) {
    return <Navigate to="/admin" replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      if (isAuthenticated) await logout()
      const res = await adminLogin(values)
      acceptSession(res.user, res.tokens.access_token, res.tokens.refresh_token)
      navigate('/admin', { replace: true })
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Admin sign-in failed'))
    }
  })

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#0b1220] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center text-white">
          <img
            src={logo}
            alt=""
            className="h-14 w-14 rounded-xl bg-white object-contain p-0.5 ring-1 ring-white/10"
          />
          <h1 className="mt-4 font-display text-2xl font-semibold">{appConfig.name}</h1>
          <p className="mt-1 text-sm text-white/55">Admin portal</p>
        </div>

        <Card className="border-border/60 shadow-lift">
          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <label className="block text-sm font-medium text-ink">
              Email
              <input
                type="email"
                className={inputClass}
                autoComplete="username"
                {...register('email')}
              />
              {errors.email ? (
                <span className="mt-1 block text-xs text-danger">{errors.email.message}</span>
              ) : null}
            </label>
            <label className="block text-sm font-medium text-ink">
              Password
              <input
                type="password"
                className={inputClass}
                autoComplete="current-password"
                {...register('password')}
              />
              {errors.password ? (
                <span className="mt-1 block text-xs text-danger">{errors.password.message}</span>
              ) : null}
            </label>
            {formError ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{formError}</p>
            ) : null}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in to admin'}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-ink-muted">
            Storefront stays public — no customer login.
          </p>
        </Card>
      </div>
    </div>
  )
}

const inputClass =
  'mt-1.5 w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-blue focus:shadow-focus'
