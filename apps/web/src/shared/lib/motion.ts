import type { Transition, Variants } from 'framer-motion'

export const premiumEase: Transition = {
  duration: 0.55,
  ease: [0.22, 1, 0.36, 1],
}

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 16, filter: 'blur(4px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: premiumEase,
  },
  exit: { opacity: 0, y: -10, filter: 'blur(2px)', transition: { duration: 0.22 } },
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: premiumEase },
}

export const fadeScale: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: premiumEase },
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: premiumEase },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.08 },
  },
}

export const staggerFast: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
}

export const cardHover = {
  rest: {
    y: 0,
    boxShadow: '0 1px 2px rgb(7 13 24 / 0.04), 0 10px 28px rgb(7 13 24 / 0.06)',
  },
  hover: {
    y: -8,
    boxShadow: '0 8px 24px rgb(7 13 24 / 0.1), 0 20px 48px rgb(24 166 229 / 0.18)',
    transition: premiumEase,
  },
}
