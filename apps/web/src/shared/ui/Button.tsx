import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'

import { cn } from '@/shared/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'gradient'
type Size = 'sm' | 'md' | 'lg'

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> &
  Omit<HTMLMotionProps<'button'>, 'children'> & {
    variant?: Variant
    size?: Size
    children: ReactNode
  }

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-blue text-white hover:bg-brand-blue-hover shadow-glow-blue focus-visible:shadow-focus',
  secondary:
    'bg-white/90 text-ink border border-border hover:border-brand-blue/40 hover:bg-white shadow-soft',
  ghost: 'bg-transparent text-ink-secondary hover:bg-brand-blue-soft hover:text-ink',
  accent:
    'bg-brand-green text-white hover:bg-brand-green-hover shadow-glow-green focus-visible:shadow-focus',
  gradient:
    'bg-brand-gradient animate-gradient text-white shadow-glow-blue hover:brightness-105 focus-visible:shadow-focus',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-7 text-base',
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
        whileHover={disabled ? undefined : { scale: 1.03, y: -1 }}
        whileTap={disabled ? undefined : { scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 420, damping: 24 }}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-[colors,box-shadow,filter] duration-200',
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
