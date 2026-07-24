import type { Product } from '@/entities/catalog/types'
import { formatPkr } from '@/shared/lib/money'
import { cn } from '@/shared/lib/cn'

type ProductPriceProps = {
  product: Pick<Product, 'price_pkr' | 'compare_at_pkr' | 'show_price'>
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

export function ProductPrice({ product, size = 'md', className }: ProductPriceProps) {
  const styles = sizeClasses[size]

  if (!product.show_price) {
    return (
      <span className={cn(styles.hidden, 'inline-flex min-h-[1.5rem] items-center text-brand-blue', className)}>
        Contact for price
      </span>
    )
  }

  return (
    <div className={cn('flex min-h-[1.5rem] flex-wrap items-baseline gap-2', className)}>
      <span className={cn(styles.price, 'text-ink')}>{formatPkr(product.price_pkr)}</span>
      {product.compare_at_pkr != null && product.compare_at_pkr > product.price_pkr ? (
        <span className={cn(styles.compare, 'text-ink-muted line-through')}>
          {formatPkr(product.compare_at_pkr)}
        </span>
      ) : null}
    </div>
  )
}

export function productDiscountPercent(
  product: Pick<Product, 'price_pkr' | 'compare_at_pkr' | 'show_price'>,
): number | null {
  if (!product.show_price) return null
  if (!product.compare_at_pkr || product.compare_at_pkr <= product.price_pkr) return null
  return Math.round((1 - product.price_pkr / product.compare_at_pkr) * 100)
}
