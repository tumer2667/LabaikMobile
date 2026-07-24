import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

import { Footer } from '@/app/layouts/Footer'
import { Header } from '@/app/layouts/Header'
import { pageTransition } from '@/shared/lib/motion'

export function StorefrontLayout() {
  const location = useLocation()

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          variants={pageTransition}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex-1"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  )
}
