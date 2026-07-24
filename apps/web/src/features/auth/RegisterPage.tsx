import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, type ReactNode } from 'react'

import { useAuth } from '@/features/auth/AuthContext'
import { registerSchema, type RegisterFormValues } from '@/features/auth/schemas'
import { getApiErrorMessage } from '@/shared/api/client'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Reveal } from '@/shared/ui/Reveal'

export function RegisterPage() {
  const { register: registerUser, isAuthenticated, isBootstrapping } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      password: '',
      confirm_password: '',
    },
  })

  if (!isBootstrapping && isAuthenticated) {
    return <Navigate to="/profile" replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await registerUser({
        full_name: values.full_name,
        email: values.email,
        phone: values.phone || undefined,
        password: values.password,
      })
      navigate('/profile', { replace: true })
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Unable to create account'))
    }
  })

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
          Account
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
          Create account
        </h1>
        <p className="mt-2 text-sm text-ink-secondary">
          Save your details for faster order enquiries.
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <Card className="mt-8">
          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <Field label="Full name" error={errors.full_name?.message}>
              <input className={inputClass} autoComplete="name" {...register('full_name')} />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <input
                type="email"
                className={inputClass}
                autoComplete="email"
                {...register('email')}
              />
            </Field>
            <Field label="Phone (optional)" error={errors.phone?.message}>
              <input
                type="tel"
                className={inputClass}
                autoComplete="tel"
                placeholder="+92…"
                {...register('phone')}
              />
            </Field>
            <Field label="Password" error={errors.password?.message}>
              <input
                type="password"
                className={inputClass}
                autoComplete="new-password"
                {...register('password')}
              />
            </Field>
            <Field label="Confirm password" error={errors.confirm_password?.message}>
              <input
                type="password"
                className={inputClass}
                autoComplete="new-password"
                {...register('confirm_password')}
              />
            </Field>
            {formError ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{formError}</p>
            ) : null}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create account'}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-ink-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-blue hover:text-brand-blue-hover">
              Sign in
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
