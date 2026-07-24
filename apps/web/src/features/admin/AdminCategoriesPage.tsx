import { demoCategories } from '@/entities/catalog/demo-data'
import { Card } from '@/shared/ui/Card'
import { ProductImage } from '@/shared/ui/ProductImage'
import { Button } from '@/shared/ui/Button'

export function AdminCategoriesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Categories</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Toggle <strong>Show price</strong> per category (demo UI). Persisted API toggle in Phase 4.
          </p>
        </div>
        <Button disabled>Add category</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {demoCategories.map((c) => (
          <Card key={c.id} className="overflow-hidden !p-0">
            <ProductImage src={c.image} alt={c.name} className="aspect-[16/9]" />
            <div className="space-y-3 p-4">
              <div>
                <h2 className="font-display text-lg font-semibold text-ink">{c.name}</h2>
                <p className="text-sm text-ink-muted">{c.productCount} products</p>
              </div>
              <label className="flex items-center justify-between gap-3 rounded-xl bg-surface px-3 py-2.5 text-sm">
                <span className="font-medium text-ink">Show price on website</span>
                <input
                  type="checkbox"
                  checked={c.showPrice}
                  readOnly
                  className="size-4 accent-brand-blue"
                  title="Wired to API in Phase 4"
                />
              </label>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
