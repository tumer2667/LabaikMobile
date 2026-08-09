import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useState } from 'react'

import { deleteProduct, fetchAdminProducts, updateProduct } from '@/features/catalog/api'
import { formatPkr } from '@/shared/lib/money'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { ProductImage } from '@/shared/ui/ProductImage'
import { Skeleton } from '@/shared/ui/Skeleton'
import { getApiErrorMessage } from '@/shared/api/client'

export function AdminProductsPage() {
  const queryClient = useQueryClient()
  const [actionError, setActionError] = useState<string | null>(null)
  const productsQuery = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => fetchAdminProducts({ page_size: 100 }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      setActionError(null)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      void queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (err) => setActionError(getApiErrorMessage(err)),
  })

  const togglePriceMutation = useMutation({
    mutationFn: ({ id, show_price }: { id: string; show_price: boolean }) =>
      updateProduct(id, { show_price }),
    onSuccess: () => {
      setActionError(null)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      void queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (err) => setActionError(getApiErrorMessage(err)),
  })

  const products = productsQuery.data?.items ?? []

  return (
    <div className="mx-auto max-w-6xl space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink md:text-3xl">Products</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Edit catalog items, pricing, and images.
          </p>
        </div>
        <Link to="/admin/products/new">
          <Button className="w-full sm:w-auto">Add product</Button>
        </Link>
      </div>

      {actionError ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger">{actionError}</p>
      ) : null}

      {productsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {products.map((p) => (
              <Card key={p.id} className="!p-3.5">
                <div className="flex gap-3">
                  <ProductImage
                    src={p.primary_image ?? ''}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-xl"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{p.name}</p>
                    <p className="text-xs text-ink-muted">
                      {p.brand} · {p.category_name}
                    </p>
                    <p className="mt-1 text-sm font-medium text-ink">
                      {formatPkr(p.price_pkr)}
                      {!p.show_price ? (
                        <span className="ml-1 text-xs text-ink-muted">(hidden)</span>
                      ) : null}
                    </p>
                    <p
                      className={
                        p.in_stock
                          ? 'mt-0.5 text-xs text-brand-green-hover'
                          : 'mt-0.5 text-xs text-ink-muted'
                      }
                    >
                      {p.in_stock ? 'In stock' : 'Sold out'}
                    </p>
                  </div>
                </div>
                <label className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-surface px-3 py-2 text-sm">
                  <span className="font-medium text-ink">Show price on website</span>
                  <input
                    type="checkbox"
                    checked={p.show_price}
                    disabled={togglePriceMutation.isPending}
                    onChange={(e) =>
                      togglePriceMutation.mutate({
                        id: p.id,
                        show_price: e.target.checked,
                      })
                    }
                  />
                </label>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <Link to={`/admin/products/${p.id}/edit`}>
                    <Button size="sm" className="w-full">
                      Edit
                    </Button>
                  </Link>
                  <Link to={`/shop/${p.slug}`} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="secondary" className="w-full">
                      View
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full text-danger hover:bg-red-50"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if (
                        confirm(`Delete “${p.name}” permanently? This cannot be undone.`)
                      ) {
                        deleteMutation.mutate(p.id)
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop table */}
          <Card className="hidden overflow-hidden !p-0 md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-border bg-surface text-xs uppercase tracking-wider text-ink-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Price</th>
                    <th className="px-4 py-3 font-semibold">Show price</th>
                    <th className="px-4 py-3 font-semibold">Stock</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-border/70 last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ProductImage
                            src={p.primary_image ?? ''}
                            alt=""
                            className="h-12 w-12 shrink-0 rounded-lg"
                          />
                          <div>
                            <p className="font-medium text-ink">{p.name}</p>
                            <p className="text-xs text-ink-muted">{p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-secondary">{p.category_name}</td>
                      <td className="px-4 py-3 text-ink">
                        {formatPkr(p.price_pkr)}
                        {!p.show_price ? (
                          <span className="ml-2 text-xs text-ink-muted">(hidden on site)</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <label className="inline-flex items-center gap-2 text-xs text-ink-secondary">
                          <input
                            type="checkbox"
                            checked={p.show_price}
                            disabled={togglePriceMutation.isPending}
                            onChange={(e) =>
                              togglePriceMutation.mutate({
                                id: p.id,
                                show_price: e.target.checked,
                              })
                            }
                          />
                          {p.show_price ? 'Shown' : 'Hidden'}
                        </label>
                      </td>
                      <td className="px-4 py-3">
                        <span className={p.in_stock ? 'text-brand-green-hover' : 'text-ink-muted'}>
                          {p.in_stock ? 'In stock' : 'Sold out'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <Link to={`/admin/products/${p.id}/edit`}>
                            <Button size="sm">Edit</Button>
                          </Link>
                          <Link to={`/shop/${p.slug}`} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="secondary">
                              View
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-danger hover:bg-red-50"
                            disabled={deleteMutation.isPending}
                            onClick={() => {
                              if (
                                confirm(
                                  `Delete “${p.name}” permanently? This cannot be undone.`,
                                )
                              ) {
                                deleteMutation.mutate(p.id)
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
