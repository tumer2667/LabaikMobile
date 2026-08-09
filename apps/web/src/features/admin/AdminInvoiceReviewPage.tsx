import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, Navigate } from 'react-router-dom'
import { useState } from 'react'

import { deleteAdminInvoice, fetchAdminInvoices } from '@/features/admin/invoicesApi'
import { useAuth } from '@/features/auth/AuthContext'
import { getApiErrorMessage } from '@/shared/api/client'
import { formatPkr } from '@/shared/lib/money'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Skeleton } from '@/shared/ui/Skeleton'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function AdminInvoiceReviewPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const isSuperAdmin = user?.role === 'super_admin'

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'invoice-review'],
    queryFn: () => fetchAdminInvoices({ status: 'pending_delete' }),
    enabled: isSuperAdmin,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminInvoice(id),
    onSuccess: () => {
      setError(null)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'invoice-review'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'invoices'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'invoice-creators'] })
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  if (!isSuperAdmin) {
    return <Navigate to="/admin/invoices" replace />
  }

  const invoices = data ?? []

  return (
    <div className="mx-auto max-w-6xl space-y-4 md:space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink md:text-3xl">Invoice review</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Invoices admins requested to delete. Permanently remove them here.
        </p>
      </div>

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger">{error}</p>
      ) : null}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      ) : invoices.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-secondary">No invoices waiting for review.</p>
        </Card>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {invoices.map((inv) => (
              <Card key={inv.id} className="!p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{inv.number}</p>
                    <p className="truncate text-sm text-ink-secondary">{inv.customer_name}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {inv.created_by_name ?? '—'} · {formatDate(inv.issued_at)}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold tabular-nums text-ink">
                    {formatPkr(inv.total_pkr)}
                  </p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link to={`/admin/invoices/${inv.id}`}>
                    <Button size="sm" variant="secondary" className="w-full">
                      View
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    className="w-full bg-danger text-white hover:opacity-90"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if (
                        window.confirm(
                          `Permanently delete invoice ${inv.number}? This cannot be undone.`,
                        )
                      ) {
                        deleteMutation.mutate(inv.id)
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Card className="hidden overflow-hidden !p-0 md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-border bg-surface text-xs uppercase tracking-wider text-ink-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Number</th>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Created by</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-border/70 last:border-0">
                      <td className="px-4 py-3 font-medium text-ink">{inv.number}</td>
                      <td className="px-4 py-3 text-ink">{inv.customer_name}</td>
                      <td className="px-4 py-3 text-ink-secondary">
                        {inv.created_by_name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-ink-secondary">{formatDate(inv.issued_at)}</td>
                      <td className="px-4 py-3 text-ink">{formatPkr(inv.total_pkr)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <Link to={`/admin/invoices/${inv.id}`}>
                            <Button size="sm" variant="secondary">
                              View
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            className="bg-danger text-white hover:opacity-90"
                            disabled={deleteMutation.isPending}
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Permanently delete invoice ${inv.number}? This cannot be undone.`,
                                )
                              ) {
                                deleteMutation.mutate(inv.id)
                              }
                            }}
                          >
                            Delete permanently
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
