import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useState } from 'react'

import {
  fetchAdminInvoices,
  fetchInvoiceCreators,
  requestDeleteAdminInvoice,
} from '@/features/admin/invoicesApi'
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

export function AdminInvoicesPage() {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [creatorId, setCreatorId] = useState('')

  const creatorsQuery = useQuery({
    queryKey: ['admin', 'invoice-creators'],
    queryFn: fetchInvoiceCreators,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'invoices', creatorId || 'all'],
    queryFn: () =>
      fetchAdminInvoices({
        status: 'issued',
        ...(creatorId ? { created_by: creatorId } : {}),
      }),
  })

  const requestDeleteMutation = useMutation({
    mutationFn: (id: string) => requestDeleteAdminInvoice(id),
    onSuccess: () => {
      setError(null)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'invoices'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'invoice-review'] })
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  const invoices = data ?? []

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Invoices</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Create invoices from in-stock products. Deleting sends them to review for super admin.
          </p>
        </div>
        <Link to="/admin/invoices/new">
          <Button>New invoice</Button>
        </Link>
      </div>

      <Card className="flex flex-wrap items-end gap-3">
        <label className="min-w-[220px] text-sm font-medium text-ink">
          Filter by creator
          <select
            className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-blue"
            value={creatorId}
            onChange={(e) => setCreatorId(e.target.value)}
          >
            <option value="">All creators</option>
            {(creatorsQuery.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name}
              </option>
            ))}
          </select>
        </label>
      </Card>

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger">{error}</p>
      ) : null}

      <Card className="overflow-hidden !p-0">
        {isLoading ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : invoices.length === 0 ? (
          <p className="p-6 text-sm text-ink-secondary">No invoices yet. Create your first one.</p>
        ) : (
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
                    <td className="px-4 py-3">
                      <p className="text-ink">{inv.customer_name}</p>
                      {inv.customer_phone ? (
                        <p className="text-xs text-ink-muted">{inv.customer_phone}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-ink-secondary">
                      {inv.created_by_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-ink-secondary">{formatDate(inv.issued_at)}</td>
                    <td className="px-4 py-3 text-ink">{formatPkr(inv.total_pkr)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Link to={`/admin/invoices/${inv.id}`}>
                          <Button size="sm">View</Button>
                        </Link>
                        <Link to={`/admin/invoices/${inv.id}/print`} target="_blank">
                          <Button size="sm" variant="secondary">
                            Print
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-danger"
                          disabled={requestDeleteMutation.isPending}
                          onClick={() => {
                            if (
                              window.confirm(
                                `Send invoice ${inv.number} for deletion review? A super admin must approve the final delete.`,
                              )
                            ) {
                              requestDeleteMutation.mutate(inv.id)
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
