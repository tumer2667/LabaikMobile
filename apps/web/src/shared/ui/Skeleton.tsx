import { cn } from '@/shared/lib/cn'

type SkeletonProps = {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-border/70',
        'after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.4s_infinite]',
        'after:bg-gradient-to-r after:from-transparent after:via-white/60 after:to-transparent',
        className,
      )}
    />
  )
}
