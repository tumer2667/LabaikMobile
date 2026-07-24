import type { DemoProduct } from '@/entities/catalog/demo-data'
import { productShowsPrice } from '@/entities/catalog/demo-data'
import { formatPkr } from '@/shared/lib/money'
import { cn } from '@/shared/lib/cn'

type ProductPriceProps = {
  product: Pick<DemoProduct, 'pricePkr' | 'compareAtPkr' | 'categorySlug'>
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: { price: 'text-sm font-semibold', compare: 'text-xs', hidden: 'text-sm font-semibold' },
  md: { price: 'text-base font-semibold', compare: 'text-sm', hidden: 'text-sm font-semibold' },
  lg: {
    price: 'font-display text-3xl font-semibold',
    compare: 'text-lg',
    hidden: 'font-display text-2xl font-semibold',
  },
} as const

/**
 * Renders PKR when the product's category has `showPrice: true`.
 * Otherwise shows “Contact for price” (admin category toggle).
 */
export function ProductPrice({ product, size = 'md', className }: ProductPriceProps) {
  const showPrice = productShowsPrice(product as DemoProduct)
  const styles = sizeClasses[size]

  if (!showPrice) {
    return (
      <span className={cn(styles.hidden, 'text-brand-blue', className)}>Contact for price</span>
    )
  }

  return (
    <div className={cn('flex flex-wrap items-baseline gap-2', className)}>
      <span className={cn(styles.price, 'text-ink')}>{formatPkr(product.pricePkr)}</span>
      {product.compareAtPkr != null && product.compareAtPkr > product.pricePkr ? (
        <span className={cn(styles.compare, 'text-ink-muted line-through')}>
          {formatPkr(product.compareAtPkr)}
        </span>
      ) : null}
    </div>
  )
}

export function productDiscountPercent(
  product: Pick<DemoProduct, 'pricePkr' | 'compareAtPkr' | 'categorySlug'>,
): number | null {
  if (!productShowsPrice(product as DemoProduct)) return null
  if (!product.compareAtPkr || product.compareAtPkr <= product.pricePkr) return null
  return Math.round((1 - product.pricePkr / product.compareAtPkr) * 100)
}
