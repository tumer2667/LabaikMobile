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
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn('group', className)}
    >
      <Link
        to={`/shop/${product.slug}`}
        className="relative block overflow-hidden rounded-2xl border border-border/80 bg-surface-elevated shadow-soft transition-[box-shadow,border-color] duration-300 hover:border-brand-blue/35 hover:shadow-lift"
      >
        <div className="pointer-events-none absolute inset-0 z-10 opacity-0 transition duration-500 group-hover:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/10 via-transparent to-brand-green/5" />
        </div>

        <div className="relative aspect-[4/5] overflow-hidden bg-brand-blue-soft/40">
          <ProductImage
            src={image}
            alt={product.name}
            className="h-full w-full"
            imgClassName="transition duration-700 ease-out group-hover:scale-110"
          />
          <div className="pointer-events-none absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/35 to-transparent transition duration-700 group-hover:translate-x-[120%]" />
          <div className="absolute left-3 top-3 z-20 flex flex-wrap gap-1.5">
            {product.is_new && (
              <span className="rounded-full bg-ink/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                New
              </span>
            )}
            {discount != null && (
              <span className="rounded-full bg-brand-green px-2.5 py-1 text-[11px] font-semibold text-white shadow-glow-green">
                -{discount}%
              </span>
            )}
            {!product.in_stock && (
              <span className="rounded-full bg-ink-secondary/90 px-2.5 py-1 text-[11px] font-semibold text-white">
                Sold out
              </span>
            )}
          </div>
        </div>

        <div className="relative space-y-2 p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-blue">
            {product.brand}
          </p>
          <h3 className="font-display text-base font-semibold tracking-tight text-ink transition group-hover:text-brand-blue-deep line-clamp-1 sm:text-lg">
            {product.name}
          </h3>
          <p className="line-clamp-2 text-sm text-ink-muted">{product.short_description}</p>
          <div className="flex items-end justify-between gap-3 pt-2">
            <ProductPrice product={product} size="md" />
            <p className="shrink-0 text-xs font-medium text-ink-muted">
              ★ {product.rating.toFixed(1)}
            </p>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
