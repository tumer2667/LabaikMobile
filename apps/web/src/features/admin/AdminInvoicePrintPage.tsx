import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

import logo from '@/assets/logo.png'
import { fetchAdminInvoice } from '@/features/admin/invoicesApi'
import { businessInfo } from '@/shared/config/business'
import { formatPkr } from '@/shared/lib/money'
import { Button } from '@/shared/ui/Button'
import { Skeleton } from '@/shared/ui/Skeleton'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-PK', {
    dateStyle: 'long',
  }).format(new Date(value))
}

export function AdminInvoicePrintPage() {
  const { id } = useParams()
  const invoiceQuery = useQuery({
    queryKey: ['admin', 'invoice', id],
    queryFn: () => fetchAdminInvoice(id!),
    enabled: Boolean(id),
  })

  useEffect(() => {
    document.title = invoiceQuery.data
      ? `Invoice ${invoiceQuery.data.number} · ${businessInfo.name}`
      : `Invoice · ${businessInfo.name}`
  }, [invoiceQuery.data])

  if (invoiceQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 bg-white p-8">
        <Skeleton className="h-16 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const invoice = invoiceQuery.data
  if (!invoice) {
    return (
      <div className="mx-auto max-w-3xl bg-white p-8">
        <p className="text-danger">Invoice not found.</p>
        <Link to="/admin/invoices" className="mt-4 inline-block text-sm text-brand-blue">
          Back to invoices
        </Link>
      </div>
    )
  }

  const onPrint = () => window.print()

  return (
    <div className="min-h-dvh bg-neutral-100 text-ink print:bg-white">
      <div className="print:hidden sticky top-0 z-10 border-b border-border bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
          <Link to={`/admin/invoices/${invoice.id}`} className="text-sm text-ink-secondary hover:text-ink">
            ← Back to invoice
          </Link>
          <div className="flex gap-2">
            <Button onClick={onPrint}>Print</Button>
            <Button variant="secondary" onClick={onPrint}>
              Download PDF
            </Button>
          </div>
        </div>
        <p className="mx-auto mt-1 max-w-3xl text-xs text-ink-muted">
          Download PDF: choose “Save as PDF” in the print dialog.
        </p>
      </div>

      <article className="invoice-sheet mx-auto my-6 max-w-3xl bg-white p-8 shadow-sm print:my-0 print:max-w-none print:p-0 print:shadow-none sm:p-10">
        {invoice.status === 'pending_delete' ? (
          <p className="mb-4 rounded-lg border border-danger/30 bg-red-50 px-3 py-2 text-sm font-semibold text-danger print:border-ink print:bg-transparent">
            IN REVIEW — PENDING DELETION
          </p>
        ) : null}

        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-border pb-6">
          <div className="flex items-start gap-4">
            <img
              src={logo}
              alt={businessInfo.name}
              className="h-16 w-16 rounded-xl object-contain"
            />
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink">{businessInfo.name}</h1>
              <div className="mt-1 space-y-0.5 text-sm text-ink-secondary">
                {businessInfo.addressLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
                {businessInfo.phones.map((phone) => (
                  <p key={phone.tel}>{phone.display}</p>
                ))}
                <p>{businessInfo.email}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-blue">
              Invoice
            </p>
            <p className="mt-1 font-display text-xl font-semibold text-ink">{invoice.number}</p>
            <p className="mt-1 text-sm text-ink-secondary">{formatDate(invoice.issued_at)}</p>
            {invoice.created_by_name ? (
              <p className="mt-1 text-sm text-ink-secondary">Prepared by {invoice.created_by_name}</p>
            ) : null}
          </div>
        </header>

        <section className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Bill to</p>
            <p className="mt-1 font-medium text-ink">{invoice.customer_name}</p>
            {invoice.customer_phone ? (
              <p className="text-sm text-ink-secondary">{invoice.customer_phone}</p>
            ) : null}
            {invoice.customer_email ? (
              <p className="text-sm text-ink-secondary">{invoice.customer_email}</p>
            ) : null}
          </div>
        </section>

        <table className="mt-8 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-ink text-left text-xs uppercase tracking-wider">
              <th className="pb-2 font-semibold">Item</th>
              <th className="pb-2 font-semibold">Qty</th>
              <th className="pb-2 font-semibold">Unit price</th>
              <th className="pb-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((line) => (
              <tr key={line.id} className="border-b border-border">
                <td className="py-3 pr-3 font-medium">{line.description}</td>
                <td className="py-3 pr-3">{line.quantity}</td>
                <td className="py-3 pr-3">{formatPkr(line.unit_price_pkr)}</td>
                <td className="py-3 text-right">{formatPkr(line.line_total_pkr)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <section className="mt-6 flex justify-end">
          <div className="w-full max-w-xs space-y-1 text-sm">
            <div className="flex justify-between text-ink-secondary">
              <span>Subtotal</span>
              <span>{formatPkr(invoice.subtotal_pkr)}</span>
            </div>
            {invoice.discount_pkr > 0 ? (
              <div className="flex justify-between text-ink-secondary">
                <span>Discount</span>
                <span>− {formatPkr(invoice.discount_pkr)}</span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-ink pt-2 text-base font-semibold text-ink">
              <span>Total</span>
              <span>{formatPkr(invoice.total_pkr)}</span>
            </div>
            {invoice.refunded_pkr > 0 ? (
              <>
                <div className="flex justify-between text-ink-secondary">
                  <span>Refunded</span>
                  <span>− {formatPkr(invoice.refunded_pkr)}</span>
                </div>
                <div className="flex justify-between font-semibold text-ink">
                  <span>Remaining</span>
                  <span>{formatPkr(invoice.remaining_pkr)}</span>
                </div>
              </>
            ) : null}
          </div>
        </section>

        {(invoice.refunds ?? []).length > 0 ? (
          <section className="mt-8 border-t border-border pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Refunds
            </p>
            <table className="mt-2 w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider">
                  <th className="pb-1 font-semibold">Refund #</th>
                  <th className="pb-1 font-semibold">Amount</th>
                  <th className="pb-1 font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody>
                {invoice.refunds.map((refund) => (
                  <tr key={refund.id} className="border-b border-border/70">
                    <td className="py-2 pr-3">{refund.number}</td>
                    <td className="py-2 pr-3">{formatPkr(refund.amount_pkr)}</td>
                    <td className="py-2">{refund.reason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}

        {invoice.notes ? (
          <section className="mt-8 border-t border-border pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-ink-secondary">{invoice.notes}</p>
          </section>
        ) : null}

        <footer className="mt-10 border-t border-border pt-4 text-center text-xs text-ink-muted">
          Thank you for shopping at {businessInfo.name}.
        </footer>
      </article>

      <style>{`
        @media print {
          @page { margin: 12mm; }
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  )
}
