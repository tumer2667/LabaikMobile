import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { fetchAdminDashboard } from '@/features/admin/api'
import { fetchAdminCategories, fetchAdminProducts } from '@/features/catalog/api'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Skeleton } from '@/shared/ui/Skeleton'
import { formatPkr } from '@/shared/lib/money'

export function AdminDashboardPage() {
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

  const stats = dashQuery.data?.stats ?? {
    products: 0,
    categories: 0,
    orders: 0,
    customers: 0,
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
            Dashboard
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Overview</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Live catalog metrics from the API.
          </p>
        </div>
        <Link to="/admin/products">
          <Button>Manage products</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Products" value={stats.products} loading={dashQuery.isLoading} />
        <StatCard label="Categories" value={stats.categories} loading={dashQuery.isLoading} />
        <StatCard label="Orders" value={stats.orders} loading={dashQuery.isLoading} />
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
