import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { archiveProduct, fetchAdminProducts } from '@/features/catalog/api'
import { formatPkr } from '@/shared/lib/money'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { ProductImage } from '@/shared/ui/ProductImage'
import { Skeleton } from '@/shared/ui/Skeleton'

export function AdminProductsPage() {
  const queryClient = useQueryClient()
  const productsQuery = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => fetchAdminProducts({ page_size: 100 }),
  })

  const archiveMutation = useMutation({
    mutationFn: (id: string) => archiveProduct(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      void queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const products = productsQuery.data?.items ?? []

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Products</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Edit catalog items, pricing, and image URLs.
          </p>
        </div>
        <Link to="/admin/products/new">
          <Button>Add product</Button>
        </Link>
      </div>

      <Card className="overflow-hidden !p-0">
        {productsQuery.isLoading ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-surface text-xs uppercase tracking-wider text-ink-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
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
                      {p.show_price ? formatPkr(p.price_pkr) : 'Hidden on site'}
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
                          className="text-danger"
                          onClick={() => {
                            if (confirm(`Archive ${p.name}?`)) archiveMutation.mutate(p.id)
                          }}
                        >
                          Archive
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
