import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, type ReactNode } from 'react'

import { useAuth } from '@/features/auth/AuthContext'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas'
import { getApiErrorMessage } from '@/shared/api/client'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Reveal } from '@/shared/ui/Reveal'

export function LoginPage() {
  const { login, isAuthenticated, isBootstrapping } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState<string | null>(null)
  const from = (location.state as { from?: string } | null)?.from ?? '/profile'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  if (!isBootstrapping && isAuthenticated) {
    return <Navigate to={from} replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await login(values)
      navigate(from, { replace: true })
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Unable to sign in'))
    }
  })

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
          Account
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-ink-secondary">
          Access your LabaikMobiles profile. Checkout stays contact-based.
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <Card className="mt-8">
          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <Field label="Email" error={errors.email?.message}>
              <input
                type="email"
                autoComplete="email"
                className={inputClass}
                {...register('email')}
              />
            </Field>
            <Field label="Password" error={errors.password?.message}>
              <input
                type="password"
                autoComplete="current-password"
                className={inputClass}
                {...register('password')}
              />
            </Field>
            {formError ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{formError}</p>
            ) : null}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-ink-muted">
            New here?{' '}
            <Link to="/register" className="font-semibold text-brand-blue hover:text-brand-blue-hover">
              Create an account
            </Link>
          </p>
        </Card>
      </Reveal>
    </div>
  )
}

const inputClass =
  'mt-1.5 w-full rounded-xl border border-border bg-surface-elevated px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-blue focus:shadow-focus'

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="block text-sm font-medium text-ink">
      {label}
      {children}
      {error ? <span className="mt-1 block text-xs text-danger">{error}</span> : null}
    </label>
  )
}
