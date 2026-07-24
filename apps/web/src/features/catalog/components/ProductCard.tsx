import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import type { Product } from '@/entities/catalog/types'
import {
  ProductPrice,
  productDiscountPercent,
} from '@/features/catalog/components/ProductPrice'
import { cn } from '@/shared/lib/cn'
import { ProductImage } from '@/shared/ui/ProductImage'

type ProductCardProps = {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const discount = productDiscountPercent(product)
  const image = product.primary_image ?? product.images[0] ?? ''

  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn('group', className)}
    >
      <Link
        to={`/shop/${product.slug}`}
        className="block overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-soft transition-shadow hover:shadow-lift"
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          <ProductImage
            src={image}
            alt={product.name}
            className="h-full w-full"
            imgClassName="transition duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {product.is_new && (
              <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                New
              </span>
            )}
            {discount != null && (
              <span className="rounded-full bg-brand-green px-2.5 py-1 text-[11px] font-semibold text-white">
                -{discount}%
              </span>
            )}
            {!product.in_stock && (
              <span className="rounded-full bg-ink-secondary px-2.5 py-1 text-[11px] font-semibold text-white">
                Sold out
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">
            {product.brand}
          </p>
          <h3 className="font-display text-base font-semibold tracking-tight text-ink line-clamp-1">
            {product.name}
          </h3>
          <p className="line-clamp-2 text-sm text-ink-muted">{product.short_description}</p>
          <div className="pt-1">
            <ProductPrice product={product} size="md" />
          </div>
          <p className="text-xs text-ink-muted">
            ★ {product.rating.toFixed(1)} · {product.review_count} reviews
          </p>
        </div>
      </Link>
    </motion.article>
  )
}
