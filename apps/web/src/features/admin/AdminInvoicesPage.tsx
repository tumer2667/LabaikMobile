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
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Invoices</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Track invoices by number (INV-…). Process refunds from the invoice detail page.
          </p>
        </div>
        <Link to="/admin/invoices/new">
          <Button>New invoice</Button>
        </Link>
      </div>

      <Card className="flex flex-wrap items-end gap-3">
        <label className="min-w-[220px] flex-1 text-sm font-medium text-ink">
          Find by invoice number
          <input
            className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-blue"
            value={lookupNumber}
            onChange={(e) => setLookupNumber(e.target.value)}
            placeholder="e.g. INV-2026-0001"
            onKeyDown={(e) => {
              if (e.key === 'Enter') void onLookup()
            }}
          />
        </label>
        <Button disabled={!lookupNumber.trim() || lookupPending} onClick={() => void onLookup()}>
          {lookupPending ? 'Searching…' : 'Open'}
        </Button>
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
        )}
      </Card>
    </div>
  )
}
