import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '@/features/auth/AuthContext'
import { RequireAuth } from '@/features/auth/RequireAuth'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Reveal } from '@/shared/ui/Reveal'

export function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  )
}

function ProfileContent() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  const onLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
          Profile
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
          Hello, {user.full_name.split(' ')[0]}
        </h1>
        <p className="mt-2 text-ink-secondary">
          Your account is ready. Orders are still completed via contact.
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <Card className="mt-8 space-y-4">
          <Row label="Name" value={user.full_name} />
          <Row label="Email" value={user.email} />
          <Row label="Phone" value={user.phone ?? '—'} />
          <Row label="Role" value={user.role} />
          <div className="flex flex-wrap gap-3 border-t border-border pt-4">
            <Link to="/shop">
              <Button variant="secondary">Browse shop</Button>
            </Link>
            <Link to="/contact">
              <Button>Contact to order</Button>
            </Link>
            <Button variant="ghost" onClick={onLogout}>
              Sign out
            </Button>
          </div>
        </Card>
      </Reveal>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/70 pb-3 last:border-0">
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="text-sm font-medium capitalize text-ink">{value}</span>
    </div>
  )
}
