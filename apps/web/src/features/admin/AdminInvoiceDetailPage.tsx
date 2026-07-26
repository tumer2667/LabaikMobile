import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import {
  createAdminRefund,
  deleteAdminInvoice,
  fetchAdminInvoice,
  requestDeleteAdminInvoice,
} from '@/features/admin/invoicesApi'
import { useAuth } from '@/features/auth/AuthContext'
import { getApiErrorMessage } from '@/shared/api/client'
import { formatPkr } from '@/shared/lib/money'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Skeleton } from '@/shared/ui/Skeleton'

const inputClass =
  'mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-blue'

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

export function AdminInvoiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const isSuperAdmin = user?.role === 'super_admin'

  const invoiceQuery = useQuery({
    queryKey: ['admin', 'invoice', id],
    queryFn: () => fetchAdminInvoice(id!),
    enabled: Boolean(id),
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'invoice', id] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'invoices'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'invoice-review'] })
    void queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
  }

  const requestDeleteMutation = useMutation({
    mutationFn: () => requestDeleteAdminInvoice(id!),
    onSuccess: () => {
      setError(null)
      invalidate()
      navigate('/admin/invoices')
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  const hardDeleteMutation = useMutation({
    mutationFn: () => deleteAdminInvoice(id!),
    onSuccess: () => {
      setError(null)
      invalidate()
      navigate('/admin/invoice-review')
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  const refundMutation = useMutation({
    mutationFn: () =>
      createAdminRefund(id!, {
        amount_pkr: Number(refundAmount),
        reason: refundReason.trim(),
      }),
    onSuccess: () => {
      setError(null)
      setRefundAmount('')
      setRefundReason('')
      invalidate()
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  if (invoiceQuery.isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const invoice = invoiceQuery.data
  if (!invoice) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <p className="text-danger">Invoice not found.</p>
        <Link to="/admin/invoices">
          <Button variant="secondary">Back</Button>
        </Link>
      </div>
    )
  }

  const inReview = invoice.status === 'pending_delete'
  const canRefund =
    !inReview && invoice.status !== 'refunded' && invoice.remaining_pkr > 0
  const canRequestDelete = !inReview

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-blue">
            Invoice
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink">{invoice.number}</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            {formatDate(invoice.issued_at)} ·{' '}
            <span
              className={
                inReview || invoice.status === 'refunded'
                  ? 'text-danger'
                  : invoice.status === 'partially_refunded'
                    ? 'text-amber-700'
                    : 'text-brand-green-hover'
              }
            >
              {statusLabel(invoice.status)}
            </span>
          </p>
          <p className="mt-1 text-sm text-ink-secondary">
            Created by {invoice.created_by_name ?? 'Unknown'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!inReview ? (
            <Link to={`/admin/invoices/${invoice.id}/print`} target="_blank">
              <Button>Print / Download PDF</Button>
            </Link>
          ) : null}
          <Link to={inReview && isSuperAdmin ? '/admin/invoice-review' : '/admin/invoices'}>
            <Button variant="secondary">Back</Button>
          </Link>
          {canRequestDelete ? (
            <Button
              variant="ghost"
              className="text-danger"
              disabled={requestDeleteMutation.isPending}
              onClick={() => {
                if (
                  window.confirm(
                    `Send invoice ${invoice.number} for deletion review? A super admin must approve the final delete.`,
                  )
                ) {
                  requestDeleteMutation.mutate()
                }
              }}
            >
              Delete
            </Button>
          ) : null}
          {inReview && isSuperAdmin ? (
            <Button
              variant="ghost"
              className="text-danger"
              disabled={hardDeleteMutation.isPending}
              onClick={() => {
                if (
                  window.confirm(
                    `Permanently delete invoice ${invoice.number}? This cannot be undone.`,
                  )
                ) {
                  hardDeleteMutation.mutate()
                }
              }}
            >
              Delete permanently
            </Button>
          ) : null}
        </div>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {inReview ? (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-ink">
          This invoice is in review and waiting for a super admin to permanently delete it.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-ink">Bill to</h2>
          <p className="mt-2 font-medium text-ink">{invoice.customer_name}</p>
          {invoice.customer_phone ? (
            <p className="text-sm text-ink-secondary">{invoice.customer_phone}</p>
          ) : null}
          {invoice.customer_email ? (
            <p className="text-sm text-ink-secondary">{invoice.customer_email}</p>
          ) : null}
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-ink">Totals</h2>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between text-ink-secondary">
              <span>Subtotal</span>
              <span>{formatPkr(invoice.subtotal_pkr)}</span>
            </div>
            <div className="flex justify-between text-ink-secondary">
              <span>Discount</span>
              <span>− {formatPkr(invoice.discount_pkr)}</span>
            </div>
            <div className="flex justify-between font-semibold text-ink">
              <span>Total</span>
              <span>{formatPkr(invoice.total_pkr)}</span>
            </div>
            <div className="flex justify-between text-ink-secondary">
              <span>Payment</span>
              <span className="capitalize">
                {(invoice.payment_method ?? 'cash').replaceAll('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between text-ink-secondary">
              <span>Refunded</span>
              <span>− {formatPkr(invoice.refunded_pkr)}</span>
            </div>
            <div className="flex justify-between font-semibold text-ink">
              <span>Remaining</span>
              <span>{formatPkr(invoice.remaining_pkr)}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden !p-0">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-surface text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((line) => (
              <tr key={line.id} className="border-b border-border/70 last:border-0">
                <td className="px-4 py-3 font-medium text-ink">{line.description}</td>
                <td className="px-4 py-3 text-ink-secondary">{line.quantity}</td>
                <td className="px-4 py-3 text-ink-secondary">{formatPkr(line.unit_price_pkr)}</td>
                <td className="px-4 py-3 text-right text-ink">{formatPkr(line.line_total_pkr)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {canRefund ? (
        <Card className="space-y-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">Record refund</h2>
            <p className="mt-1 text-sm text-ink-secondary">
              Remaining balance: {formatPkr(invoice.remaining_pkr)}. Each refund gets a tracking
              number (REF-…).
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-ink">
              Amount (PKR)
              <input
                type="number"
                min={1}
                max={invoice.remaining_pkr}
                className={inputClass}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder={`Max ${invoice.remaining_pkr}`}
              />
            </label>
            <label className="text-sm font-medium text-ink sm:col-span-2">
              Reason
              <input
                className={inputClass}
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Optional note"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={
                refundMutation.isPending ||
                !refundAmount ||
                Number(refundAmount) < 1 ||
                Number(refundAmount) > invoice.remaining_pkr
              }
              onClick={() => refundMutation.mutate()}
            >
              {refundMutation.isPending ? 'Saving…' : 'Create refund'}
            </Button>
            <Button
              variant="secondary"
              disabled={refundMutation.isPending}
              onClick={() => setRefundAmount(String(invoice.remaining_pkr))}
            >
              Full remaining
            </Button>
          </div>
        </Card>
      ) : null}

      <Card className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-ink">Refund history</h2>
        {(invoice.refunds ?? []).length === 0 ? (
          <p className="text-sm text-ink-secondary">No refunds recorded for this invoice.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="px-3 py-2">Refund #</th>
                  <th className="px-3 py-2">Invoice #</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">By</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Reason</th>
                </tr>
              </thead>
              <tbody>
                {invoice.refunds.map((refund) => (
                  <tr key={refund.id} className="border-t border-border/70">
                    <td className="px-3 py-2 font-medium text-ink">{refund.number}</td>
                    <td className="px-3 py-2 text-ink-secondary">{refund.invoice_number}</td>
                    <td className="px-3 py-2 text-ink">{formatPkr(refund.amount_pkr)}</td>
                    <td className="px-3 py-2 text-ink-secondary">
                      {refund.created_by_name ?? '—'}
                    </td>
                    <td className="px-3 py-2 text-ink-secondary">
                      {formatDate(refund.created_at)}
                    </td>
                    <td className="px-3 py-2 text-ink-secondary">{refund.reason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {invoice.notes ? (
        <Card>
          <h2 className="text-sm font-semibold text-ink">Notes</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink-secondary">{invoice.notes}</p>
        </Card>
      ) : null}
    </div>
  )
}
