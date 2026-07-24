import { Link } from 'react-router-dom'

import { demoProducts } from '@/entities/catalog/demo-data'
import { categoryShowsPrice } from '@/entities/catalog/demo-data'
import { formatPkr } from '@/shared/lib/money'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { ProductImage } from '@/shared/ui/ProductImage'

export function AdminProductsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Products</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Demo catalog preview. Create / edit / image upload arrives in Phase 4.
          </p>
        </div>
        <Button disabled title="Coming in Phase 4">
          Add product
        </Button>
      </div>

      <Card className="overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {demoProducts.map((p) => (
                <tr key={p.id} className="border-b border-border/70 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ProductImage
                        src={p.images[0] ?? ''}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded-lg"
                      />
                      <div>
                        <p className="font-medium text-ink">{p.name}</p>
                        <p className="text-xs text-ink-muted">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-ink-secondary">
                    {p.categorySlug.replace(/-/g, ' ')}
                  </td>
                  <td className="px-4 py-3 text-ink">
                    {categoryShowsPrice(p.categorySlug) ? formatPkr(p.pricePkr) : 'Hidden on site'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        p.inStock
                          ? 'text-brand-green-hover'
                          : 'text-ink-muted'
                      }
                    >
                      {p.inStock ? 'In stock' : 'Sold out'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/shop/${p.slug}`}
                      className="text-sm font-medium text-brand-blue hover:text-brand-blue-hover"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
