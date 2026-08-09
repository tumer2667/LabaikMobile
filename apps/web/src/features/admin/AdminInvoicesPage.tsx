import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

import {
  fetchAdminInvoiceByNumber,
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

function statusLabel(status: string) {
  if (status === 'partially_refunded') return 'Partial refund'
  if (status === 'refunded') return 'Refunded'
  if (status === 'pending_delete') return 'In review'
  return 'Issued'
}

function statusClass(status: string) {
  if (status === 'refunded') return 'text-danger'
  if (status === 'partially_refunded') return 'text-amber-700'
  if (status === 'pending_delete') return 'text-danger'
  return 'text-brand-green-hover'
}

export function AdminInvoicesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [creatorId, setCreatorId] = useState('')
  const [lookupNumber, setLookupNumber] = useState('')
  const [lookupPending, setLookupPending] = useState(false)

  const creatorsQuery = useQuery({
    queryKey: ['admin', 'invoice-creators'],
    queryFn: fetchInvoiceCreators,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'invoices', creatorId || 'all'],
    queryFn: () =>
      fetchAdminInvoices({
        ...(creatorId ? { created_by: creatorId } : {}),
      }),
  })

  const requestDeleteMutation = useMutation({
    mutationFn: (id: string) => requestDeleteAdminInvoice(id),
    onSuccess: () => {
      setError(null)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'invoices'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'invoice-review'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  const onLookup = async () => {
    const number = lookupNumber.trim()
    if (!number) return
    setLookupPending(true)
    setError(null)
    try {
      const invoice = await fetchAdminInvoiceByNumber(number)
      navigate(`/admin/invoices/${invoice.id}`)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invoice number not found'))
    } finally {
      setLookupPending(false)
    }
  }

  const invoices = data ?? []

  return (
    <div className="mx-auto max-w-6xl space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink md:text-3xl">Invoices</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Find by number (INV-…). Refunds are on the invoice page.
          </p>
        </div>
        <Link to="/admin/invoices/new">
          <Button className="w-full sm:w-auto">New invoice</Button>
        </Link>
      </div>

      <Card className="space-y-3 !p-4">
        <label className="block text-sm font-medium text-ink">
          Find by invoice number
          <div className="mt-1.5 flex gap-2">
            <input
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-blue"
              value={lookupNumber}
              onChange={(e) => setLookupNumber(e.target.value)}
              placeholder="e.g. INV-2026-0001"
              onKeyDown={(e) => {
                if (e.key === 'Enter') void onLookup()
              }}
            />
            <Button
              className="shrink-0"
              disabled={!lookupNumber.trim() || lookupPending}
              onClick={() => void onLookup()}
            >
              {lookupPending ? '…' : 'Open'}
            </Button>
          </div>
        </label>
        <label className="block text-sm font-medium text-ink">
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

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      ) : invoices.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-secondary">No invoices yet. Create your first one.</p>
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
                  <div className="shrink-0 text-right">
                    <p className="font-semibold tabular-nums text-ink">{formatPkr(inv.total_pkr)}</p>
                    <p className={`mt-0.5 text-xs font-medium ${statusClass(inv.status)}`}>
                      {statusLabel(inv.status)}
                    </p>
                  </div>
                </div>
                {inv.refunded_pkr > 0 ? (
                  <p className="mt-2 text-xs text-ink-muted">
                    Refunded {formatPkr(inv.refunded_pkr)}
                  </p>
                ) : null}
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <Link to={`/admin/invoices/${inv.id}`}>
                    <Button size="sm" className="w-full">
                      View
                    </Button>
                  </Link>
                  <Link to={`/admin/invoices/${inv.id}/print`} target="_blank">
                    <Button size="sm" variant="secondary" className="w-full">
                      Print
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full text-danger"
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
                    <th className="px-4 py-3 font-semibold">Status</th>
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
                      <td className="px-4 py-3 text-ink">
                        <p>{formatPkr(inv.total_pkr)}</p>
                        {inv.refunded_pkr > 0 ? (
                          <p className="text-xs text-ink-muted">
                            Refunded {formatPkr(inv.refunded_pkr)}
                          </p>
                        ) : null}
                      </td>
                      <td className={`px-4 py-3 ${statusClass(inv.status)}`}>
                        {statusLabel(inv.status)}
                      </td>
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
          </Card>
        </>
      )}
    </div>
  )
}
