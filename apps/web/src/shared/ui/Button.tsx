import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'

import { cn } from '@/shared/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'accent'
type Size = 'sm' | 'md' | 'lg'

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> &
  Omit<HTMLMotionProps<'button'>, 'children'> & {
    variant?: Variant
    size?: Size
    children: ReactNode
  }

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-blue text-white hover:bg-brand-blue-hover shadow-soft focus-visible:shadow-focus',
  secondary:
    'bg-surface-elevated text-ink border border-border hover:border-border-strong hover:bg-white shadow-soft',
  ghost: 'bg-transparent text-ink-secondary hover:bg-brand-blue-soft hover:text-ink',
  accent:
    'bg-brand-green text-white hover:bg-brand-green-hover shadow-soft focus-visible:shadow-focus',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      type = 'button',
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled}
        whileHover={disabled ? undefined : { scale: 1.015 }}
        whileTap={disabled ? undefined : { scale: 0.98 }}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-200',
          'disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {children}
      </motion.button>
    )
  },
)

Button.displayName = 'Button'
