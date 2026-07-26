import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

import { cn } from '@/shared/lib/cn'
import { resolveMediaUrl } from '@/shared/lib/mediaUrl'
import { Skeleton } from '@/shared/ui/Skeleton'

type ProductImageProps = {
  src: string
  alt: string
  className?: string
  imgClassName?: string
  priority?: boolean
}

export function ProductImage({
  src,
  alt,
  className,
  imgClassName,
  priority = false,
}: ProductImageProps) {
  const resolved = resolveMediaUrl(src)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setLoaded(false)
    setFailed(!resolved)
  }, [resolved])

  return (
    <div className={cn('relative overflow-hidden bg-brand-blue-soft/40', className)}>
      {!loaded && !failed ? <Skeleton className="absolute inset-0 rounded-none" /> : null}
      {failed ? (
        <div className="flex h-full min-h-40 items-center justify-center bg-gradient-to-br from-brand-blue-soft to-brand-green-soft px-3 text-center text-sm text-ink-muted">
          Image unavailable
        </div>
      ) : (
        <motion.img
          key={resolved}
          src={resolved}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          initial={false}
          animate={{ opacity: loaded ? 1 : 0.15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn('h-full w-full object-cover', imgClassName)}
        />
      )}
    </div>
  )
}
