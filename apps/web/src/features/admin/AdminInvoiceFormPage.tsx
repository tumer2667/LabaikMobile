import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createAdminInvoice } from '@/features/admin/invoicesApi'
import { fetchAdminProducts } from '@/features/catalog/api'
import { getApiErrorMessage } from '@/shared/api/client'
import { formatPkr } from '@/shared/lib/money'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Skeleton } from '@/shared/ui/Skeleton'

type DraftLine = {
  key: string
  product_id: string
  quantity: number
  unit_price_pkr: number
}

const inputClass =
  'mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-blue'

export function AdminInvoiceFormPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [discount, setDiscount] = useState('0')
  const [productQuery, setProductQuery] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [lines, setLines] = useState<DraftLine[]>([])
  const [error, setError] = useState<string | null>(null)

  const productsQuery = useQuery({
    queryKey: ['admin', 'products', 'invoice-picker'],
    queryFn: () => fetchAdminProducts({ page_size: 100 }),
  })

  const products = (productsQuery.data?.items ?? []).filter((p) => p.in_stock)
  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category_name.toLowerCase().includes(q),
    )
  }, [products, productQuery])

  const subtotal = lines.reduce((sum, line) => sum + line.unit_price_pkr * line.quantity, 0)
  const discountValue = Math.max(0, Number(discount) || 0)
  const total = Math.max(0, subtotal - Math.min(discountValue, subtotal))

  const addLine = () => {
    if (!selectedProductId) return
    const product = productMap.get(selectedProductId)
    if (!product) return
    setLines((prev) => {
      const existing = prev.find((l) => l.product_id === selectedProductId)
      if (existing) {
        return prev.map((l) =>
          l.product_id === selectedProductId ? { ...l, quantity: l.quantity + 1 } : l,
        )
      }
      return [
        ...prev,
        {
          key: `${selectedProductId}-${Date.now()}`,
          product_id: selectedProductId,
          quantity: 1,
          unit_price_pkr: product.price_pkr,
        },
      ]
    })
    setSelectedProductId('')
    setProductQuery('')
  }

  const createMutation = useMutation({
    mutationFn: () =>
      createAdminInvoice({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim() || null,
        customer_email: customerEmail.trim() || null,
        notes: notes.trim(),
        discount_pkr: Math.min(discountValue, subtotal),
        lines: lines.map((l) => ({
          product_id: l.product_id,
          quantity: l.quantity,
          unit_price_pkr: l.unit_price_pkr,
        })),
      }),
    onSuccess: (invoice) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'invoices'] })
      navigate(`/admin/invoices/${invoice.id}`, { replace: true })
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">New invoice</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Only in-stock products can be added. Unit price defaults from the catalog.
          </p>
        </div>
        <Link to="/admin/invoices">
          <Button variant="secondary">Back to list</Button>
        </Link>
      </div>

      <Card className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-ink">Customer</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-ink sm:col-span-2">
            Name *
            <input
              className={inputClass}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name"
            />
          </label>
          <label className="text-sm font-medium text-ink">
            Phone
            <input
              className={inputClass}
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="03XX XXXXXXX"
            />
          </label>
          <label className="text-sm font-medium text-ink">
            Email
            <input
              type="email"
              className={inputClass}
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="optional"
            />
          </label>
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-ink">Products</h2>
        {productsQuery.isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : products.length === 0 ? (
          <p className="text-sm text-ink-secondary">
            No in-stock products available. Mark products as in stock before creating an invoice.
          </p>
        ) : (
          <div className="flex flex-wrap items-end gap-3">
            <label className="min-w-[220px] flex-1 text-sm font-medium text-ink">
              Search / select product
              <input
                className={inputClass}
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                placeholder="Type to filter…"
                list="invoice-product-options"
              />
              <datalist id="invoice-product-options">
                {filteredProducts.slice(0, 50).map((p) => (
                  <option key={p.id} value={p.name} />
                ))}
              </datalist>
            </label>
            <label className="min-w-[220px] flex-1 text-sm font-medium text-ink">
              Product
              <select
                className={inputClass}
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
              >
                <option value="">Choose…</option>
                {filteredProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {formatPkr(p.price_pkr)}
                  </option>
                ))}
              </select>
            </label>
            <Button disabled={!selectedProductId} onClick={addLine}>
              Add line
            </Button>
          </div>
        )}

        {lines.length === 0 ? (
          <p className="text-sm text-ink-secondary">No products added yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2">Unit price</th>
                  <th className="px-3 py-2">Line total</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => {
                  const product = productMap.get(line.product_id)
                  return (
                    <tr key={line.key} className="border-t border-border/70">
                      <td className="px-3 py-2 font-medium text-ink">
                        {product?.name ?? 'Product'}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min={1}
                          className="w-20 rounded-lg border border-border px-2 py-1.5"
                          value={line.quantity}
                          onChange={(e) => {
                            const qty = Math.max(1, Number(e.target.value) || 1)
                            setLines((prev) =>
                              prev.map((l) => (l.key === line.key ? { ...l, quantity: qty } : l)),
                            )
                          }}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min={0}
                          className="w-28 rounded-lg border border-border px-2 py-1.5"
                          value={line.unit_price_pkr}
                          onChange={(e) => {
                            const price = Math.max(0, Number(e.target.value) || 0)
                            setLines((prev) =>
                              prev.map((l) =>
                                l.key === line.key ? { ...l, unit_price_pkr: price } : l,
                              ),
                            )
                          }}
                        />
                      </td>
                      <td className="px-3 py-2 text-ink">
                        {formatPkr(line.unit_price_pkr * line.quantity)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          className="text-sm text-danger"
                          onClick={() => setLines((prev) => prev.filter((l) => l.key !== line.key))}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-ink">
            Discount (PKR)
            <input
              type="number"
              min={0}
              className={inputClass}
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </label>
          <label className="text-sm font-medium text-ink sm:col-span-2">
            Notes
            <textarea
              rows={3}
              className={inputClass}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional note for the invoice"
            />
          </label>
        </div>

        <div className="rounded-xl bg-surface px-4 py-3 text-sm">
          <div className="flex justify-between text-ink-secondary">
            <span>Subtotal</span>
            <span>{formatPkr(subtotal)}</span>
          </div>
          <div className="mt-1 flex justify-between text-ink-secondary">
            <span>Discount</span>
            <span>− {formatPkr(Math.min(discountValue, subtotal))}</span>
          </div>
          <div className="mt-2 flex justify-between text-base font-semibold text-ink">
            <span>Total</span>
            <span>{formatPkr(total)}</span>
          </div>
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <div className="flex flex-wrap gap-3">
          <Button
            disabled={
              createMutation.isPending ||
              !customerName.trim() ||
              lines.length === 0
            }
            onClick={() => {
              setError(null)
              createMutation.mutate()
            }}
          >
            {createMutation.isPending ? 'Creating…' : 'Create invoice'}
          </Button>
          <Link to="/admin/invoices">
            <Button variant="secondary">Cancel</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
