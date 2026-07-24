import type { Transition, Variants } from 'framer-motion'

export const premiumEase: Transition = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1],
}

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: premiumEase },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25 } },
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: premiumEase },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

export const cardHover = {
  rest: { y: 0, boxShadow: '0 1px 2px rgb(11 18 32 / 0.04), 0 8px 24px rgb(11 18 32 / 0.06)' },
  hover: {
    y: -4,
    boxShadow: '0 4px 12px rgb(11 18 32 / 0.08), 0 16px 40px rgb(24 166 229 / 0.12)',
    transition: premiumEase,
  },
}
