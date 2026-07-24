import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'
import { cardHover } from '@/shared/lib/motion'

type CardProps = {
  children: ReactNode
  className?: string
  interactive?: boolean
}

export function Card({ children, className, interactive = false }: CardProps) {
  if (!interactive) {
    return (
      <div
        className={cn(
          'rounded-xl border border-border bg-surface-elevated p-6 shadow-soft',
          className,
        )}
      >
        {children}
      </div>
    )
  }

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={cardHover}
      className={cn(
        'rounded-xl border border-border bg-surface-elevated p-6',
        className,
      )}
    >
      {children}
    </motion.div>
  )
}
