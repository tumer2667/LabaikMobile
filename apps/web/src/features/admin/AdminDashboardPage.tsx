import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import {
  fetchAdminDashboard,
  fetchFinanceReport,
  type DashboardActivity,
  type DashboardInvoice,
  type DashboardLogin,
} from '@/features/admin/api'
import { useAuth } from '@/features/auth/AuthContext'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Skeleton } from '@/shared/ui/Skeleton'
import { formatPkr } from '@/shared/lib/money'
import { cn } from '@/shared/lib/cn'

export function AdminDashboardPage() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'super_admin'

  const dashQuery = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: fetchAdminDashboard,
  })
  const financeQuery = useQuery({
    queryKey: ['admin', 'finance', { period: 'month' }],
    queryFn: () => fetchFinanceReport({ period: 'month' }),
    enabled: isSuperAdmin,
  })

  const stats = dashQuery.data?.stats ?? {
    products: 0,
    categories: 0,
    invoices: 0,
    orders: 0,
    customers: 0,
  }
  const activity = dashQuery.data?.recent_activity ?? []
  const lastLogin = dashQuery.data?.last_login ?? null
  const lastLogins = dashQuery.data?.last_logins ?? []
  const recentInvoices = dashQuery.data?.recent_invoices ?? []

  const roleLabel = isSuperAdmin ? 'Super admin' : 'Admin'
  const kpis = financeQuery.data?.kpis
  const changes = financeQuery.data?.changes

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
            Home
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
            Hello, {user?.full_name || 'Admin'}
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            {roleLabel} · Quick look at shop activity
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isSuperAdmin ? (
            <Link to="/admin/finance">
              <Button>Money report</Button>
            </Link>
          ) : null}
          <Link to="/admin/invoices/new">
            <Button variant={isSuperAdmin ? 'secondary' : 'primary'}>New invoice</Button>
          </Link>
        </div>
      </div>

      {isSuperAdmin ? (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-border bg-[#0b1220] p-6 text-white shadow-lift"
        >
          <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-brand-blue/35 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-20 h-40 w-40 rounded-full bg-brand-green/25 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-blue">
                This month money
              </p>
              <p className="mt-1 text-sm text-white/60">
                {financeQuery.data
                  ? `${financeQuery.data.from_date} → ${financeQuery.data.to_date}`
                  : 'Loading this month numbers…'}
              </p>
            </div>
            <Link
              to="/admin/finance"
              className="text-sm font-semibold text-brand-blue hover:underline"
            >
              Full report →
            </Link>
          </div>
          {financeQuery.isLoading ? (
            <div className="relative mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl bg-white/10" />
              ))}
            </div>
          ) : kpis ? (
            <div className="relative mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MiniFinance
                label="Revenue"
                value={formatPkr(kpis.total_revenue_pkr)}
                change={changes?.revenue_pct}
              />
              <MiniFinance
                label="Profit"
                value={formatPkr(kpis.total_profit_pkr)}
                change={changes?.profit_pct}
                hint={`${kpis.margin_pct.toFixed(1)}% margin`}
              />
              <MiniFinance
                label="Orders"
                value={String(kpis.total_orders)}
                change={changes?.orders_pct}
              />
              <MiniFinance
                label="Refunds"
                value={formatPkr(kpis.total_refunds_pkr)}
                change={changes?.refunds_pct}
                invert
                hint={`${kpis.refund_rate_pct.toFixed(1)}% rate`}
              />
            </div>
          ) : null}
        </motion.section>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Products" value={stats.products} loading={dashQuery.isLoading} />
        <StatCard label="Categories" value={stats.categories} loading={dashQuery.isLoading} />
        <StatCard
          label="Invoices"
          value={stats.invoices ?? stats.orders}
          loading={dashQuery.isLoading}
        />
        <StatCard
          label={isSuperAdmin ? 'Staff users' : 'Brands'}
          value={isSuperAdmin ? (stats.users ?? 0) : (stats.brands ?? 0)}
          loading={dashQuery.isLoading}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h2 className="font-display text-lg font-semibold text-ink">Last login</h2>
          <p className="mt-0.5 text-sm text-ink-muted">Who signed in last</p>
          {dashQuery.isLoading ? (
            <Skeleton className="mt-4 h-24 w-full" />
          ) : lastLogin ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-xl bg-brand-blue-soft/60 px-4 py-3">
                <p className="font-display text-lg font-semibold text-ink">{lastLogin.full_name}</p>
                <p className="text-sm text-ink-secondary">{lastLogin.role_label}</p>
                <p className="mt-1 text-xs text-ink-muted">{formatWhen(lastLogin.logged_in_at)}</p>
              </div>
              {lastLogins.length > 1 ? (
                <ul className="space-y-2">
                  {lastLogins.slice(1, 4).map((login) => (
                    <LoginRow key={login.user_id} login={login} />
                  ))}
                </ul>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink-secondary">No login yet.</p>
          )}
        </Card>

        <Card className="lg:col-span-1">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">Last activity</h2>
              <p className="mt-0.5 text-sm text-ink-muted">What happened recently</p>
            </div>
          </div>
          {dashQuery.isLoading ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : activity.length === 0 ? (
            <p className="mt-4 text-sm text-ink-secondary">No activity yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {activity.slice(0, 6).map((item, index) => (
                <ActivityRow key={`${item.type}-${item.at}-${index}`} item={item} />
              ))}
            </ul>
          )}
        </Card>

        <Card className="lg:col-span-1">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">Last 3 invoices</h2>
              <p className="mt-0.5 text-sm text-ink-muted">Newest bills</p>
            </div>
            <Link to="/admin/invoices" className="text-xs font-semibold text-brand-blue hover:underline">
              All →
            </Link>
          </div>
          {dashQuery.isLoading ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : recentInvoices.length === 0 ? (
            <div className="mt-4">
              <p className="text-sm text-ink-secondary">No invoices yet.</p>
              <Link to="/admin/invoices/new" className="mt-3 inline-block">
                <Button size="sm">Create invoice</Button>
              </Link>
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {recentInvoices.map((inv) => (
                <InvoiceRow key={inv.id} invoice={inv} />
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}

function LoginRow({ login }: { login: DashboardLogin }) {
  return (
    <li className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm">
      <div className="min-w-0">
        <p className="truncate font-medium text-ink">{login.full_name}</p>
        <p className="text-xs text-ink-muted">{login.role_label}</p>
      </div>
      <span className="shrink-0 text-[11px] text-ink-muted">{formatWhen(login.logged_in_at)}</span>
    </li>
  )
}

function ActivityRow({ item }: { item: DashboardActivity }) {
  const inner = (
    <div className="flex items-start gap-3 rounded-lg border border-border px-3 py-2.5 text-sm transition hover:bg-surface">
      <span
        className={cn(
          'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold uppercase',
          activityTone(item.type),
        )}
      >
        {activityShort(item.type)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-ink">{item.title}</p>
        <p className="truncate text-xs text-ink-secondary">{item.detail}</p>
        <p className="mt-0.5 text-[11px] text-ink-muted">{formatWhen(item.at)}</p>
      </div>
    </div>
  )
  if (item.href) {
    return (
      <li>
        <Link to={item.href}>{inner}</Link>
      </li>
    )
  }
  return <li>{inner}</li>
}

function InvoiceRow({ invoice }: { invoice: DashboardInvoice }) {
  return (
    <li>
      <Link
        to={`/admin/invoices/${invoice.id}`}
        className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 text-sm transition hover:bg-surface"
      >
        <div className="min-w-0">
          <p className="font-semibold text-ink">{invoice.number}</p>
          <p className="truncate text-xs text-ink-secondary">
            {invoice.customer_name}
            {invoice.created_by_name ? ` · ${invoice.created_by_name}` : ''}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-medium tabular-nums text-ink">{formatPkr(invoice.total_pkr)}</p>
          <p className="text-[11px] text-ink-muted">{formatWhen(invoice.created_at)}</p>
        </div>
      </Link>
    </li>
  )
}

function activityShort(type: string) {
  if (type === 'invoice') return 'INV'
  if (type === 'refund') return 'REF'
  if (type === 'product') return 'PRD'
  if (type === 'login') return 'IN'
  return '•'
}

function activityTone(type: string) {
  if (type === 'invoice') return 'bg-brand-blue-soft text-brand-blue-deep'
  if (type === 'refund') return 'bg-red-100 text-danger'
  if (type === 'product') return 'bg-brand-green-soft text-brand-green-hover'
  if (type === 'login') return 'bg-amber-100 text-amber-700'
  return 'bg-surface text-ink-muted'
}

function formatWhen(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const now = Date.now()
  const diffMs = now - date.getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function MiniFinance({
  label,
  value,
  change,
  hint,
  invert = false,
}: {
  label: string
  value: string
  change?: number | null
  hint?: string
  invert?: boolean
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold tabular-nums text-white">{value}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <ChangePill value={change} invert={invert} />
        {hint ? <span className="text-[11px] text-white/45">{hint}</span> : null}
      </div>
    </div>
  )
}

function ChangePill({ value, invert = false }: { value?: number | null; invert?: boolean }) {
  if (value == null) {
    return <span className="text-[11px] text-white/40">vs prior</span>
  }
  const up = value > 0
  const good = invert ? !up : up
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-[11px] font-semibold',
        value === 0
          ? 'bg-white/10 text-white/50'
          : good
            ? 'bg-brand-green/25 text-brand-green'
            : 'bg-red-500/25 text-red-300',
      )}
    >
      {value === 0 ? '0%' : `${up ? '+' : ''}${value.toFixed(1)}%`}
    </span>
  )
}

function StatCard({
  label,
  value,
  loading,
}: {
  label: string
  value: number
  loading?: boolean
}) {
  return (
    <Card className="!p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{label}</p>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-16" />
      ) : (
        <p className="mt-1 font-display text-3xl font-semibold text-ink">{value}</p>
      )}
    </Card>
  )
}
