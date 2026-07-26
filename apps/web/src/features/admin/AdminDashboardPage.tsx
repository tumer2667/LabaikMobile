import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import { fetchAdminDashboard, fetchFinanceReport } from '@/features/admin/api'
import { fetchAdminCategories, fetchAdminProducts } from '@/features/catalog/api'
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
  const categoriesQuery = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: fetchAdminCategories,
  })
  const productsQuery = useQuery({
    queryKey: ['admin', 'products', 'recent'],
    queryFn: () => fetchAdminProducts({ page_size: 6 }),
  })
  const financeQuery = useQuery({
    queryKey: ['admin', 'finance', { period: 'month' }],
    queryFn: () => fetchFinanceReport({ period: 'month' }),
    enabled: isSuperAdmin,
  })

  const stats = dashQuery.data?.stats ?? {
    products: 0,
    categories: 0,
    orders: 0,
    customers: 0,
  }

  const roleLabel = isSuperAdmin ? 'Super admin' : 'Admin'
  const kpis = financeQuery.data?.kpis
  const changes = financeQuery.data?.changes

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
            Dashboard
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
            Welcome, {user?.full_name || 'Admin'}
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            {roleLabel} · {isSuperAdmin ? 'Operations and finance overview.' : 'Live catalog metrics.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isSuperAdmin ? (
            <Link to="/admin/finance">
              <Button>Open finance</Button>
            </Link>
          ) : null}
          <Link to="/admin/products">
            <Button variant={isSuperAdmin ? 'secondary' : 'primary'}>Manage products</Button>
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
                Last month money
              </p>
              <p className="mt-1 text-sm text-white/60">
                {financeQuery.data
                  ? `${financeQuery.data.from_date} → ${financeQuery.data.to_date}`
                  : 'Loading last month numbers…'}
              </p>
            </div>
            <Link to="/admin/finance" className="text-sm font-semibold text-brand-blue hover:underline">
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
        <StatCard label="Customers" value={stats.customers} loading={dashQuery.isLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-lg font-semibold text-ink">Category price visibility</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Managed in Categories — toggles sync to the storefront.
          </p>
          <ul className="mt-4 divide-y divide-border">
            {(categoriesQuery.data ?? []).map((c) => (
              <li key={c.id} className="flex items-center justify-between py-3 text-sm">
                <span className="font-medium text-ink">{c.name}</span>
                <span
                  className={
                    c.show_price
                      ? 'rounded-full bg-brand-green-soft px-2.5 py-1 text-xs font-semibold text-brand-green-hover'
                      : 'rounded-full bg-brand-blue-soft px-2.5 py-1 text-xs font-semibold text-brand-blue'
                  }
                >
                  {c.show_price ? 'Prices visible' : 'Contact for price'}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="font-display text-lg font-semibold text-ink">Recent products</h2>
          {productsQuery.isLoading ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {(productsQuery.data?.items ?? []).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{p.name}</p>
                    <p className="text-xs text-ink-muted">{p.brand}</p>
                  </div>
                  <span className="shrink-0 text-ink-secondary">
                    {p.show_price ? formatPkr(p.price_pkr) : 'Hidden'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
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
