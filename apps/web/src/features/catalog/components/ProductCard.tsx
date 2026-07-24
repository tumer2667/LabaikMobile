import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import type { Product } from '@/entities/catalog/types'
import {
  ProductPrice,
  productDiscountPercent,
} from '@/features/catalog/components/ProductPrice'
import { orderWhatsAppHref } from '@/shared/lib/orderWhatsApp'
import { cn } from '@/shared/lib/cn'
import { ProductImage } from '@/shared/ui/ProductImage'

type ProductCardProps = {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const discount = productDiscountPercent(product)
  const image = product.primary_image ?? product.images[0] ?? ''
  const productPath = `/shop/${product.slug}`
  const whatsappHref = orderWhatsAppHref({
    productName: product.name,
    brand: product.brand,
    category: product.category_name,
    pricePkr: product.price_pkr,
    showPrice: product.show_price,
    askForPrice: !product.show_price,
    productUrl:
      typeof window !== 'undefined' ? `${window.location.origin}${productPath}` : productPath,
  })

  return (
    <motion.article
      layout
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-surface-elevated shadow-soft transition-[box-shadow,border-color] duration-300 hover:border-brand-blue/35 hover:shadow-lift',
        className,
      )}
    >
      <Link to={productPath} className="relative flex min-h-0 flex-1 flex-col">
        <div className="pointer-events-none absolute inset-0 z-10 opacity-0 transition duration-500 group-hover:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/10 via-transparent to-brand-green/5" />
        </div>

        <div className="relative aspect-[4/5] shrink-0 overflow-hidden bg-brand-blue-soft/40">
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
                Out of stock
              </span>
            )}
          </div>
        </div>

        <div className="relative flex flex-1 flex-col p-4 pb-2 sm:p-5 sm:pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-blue">
            {product.brand}
          </p>
          <h3 className="mt-2 font-display text-base font-semibold tracking-tight text-ink transition group-hover:text-brand-blue-deep line-clamp-1 sm:text-lg">
            {product.name}
          </h3>
          <p className="mt-2 min-h-[2.5rem] line-clamp-2 text-sm leading-5 text-ink-muted">
            {product.short_description}
          </p>
          <div className="mt-auto flex items-end justify-between gap-3 pt-4">
            <ProductPrice product={product} size="md" />
            <p className="shrink-0 pb-0.5 text-xs font-medium text-ink-muted">
              ★ {product.rating.toFixed(1)}
            </p>
          </div>
        </div>
      </Link>

      <div className="relative z-20 border-t border-border/70 px-4 py-3 sm:px-5">
        {product.in_stock ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center rounded-full bg-brand-gradient px-3 py-2 text-sm font-semibold text-white shadow-glow-blue transition hover:brightness-105"
          >
            Order on WhatsApp
          </a>
        ) : (
          <span className="flex w-full items-center justify-center rounded-full bg-border px-3 py-2 text-sm font-semibold text-ink-muted">
            Out of stock
          </span>
        )}
      </div>
    </motion.article>
  )
}
