import { createBrowserRouter } from 'react-router-dom'

import { StorefrontLayout } from '@/app/layouts/StorefrontLayout'
import { HomePage } from '@/features/home/HomePage'
import { ShopPage } from '@/features/catalog/ShopPage'
import { ProductDetailPage } from '@/features/catalog/ProductDetailPage'
import { ContactPage } from '@/features/contact/ContactPage'
import { AboutPage } from '@/features/about/AboutPage'
import { FaqPage } from '@/features/content/FaqPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <StorefrontLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'shop', element: <ShopPage /> },
      { path: 'shop/:slug', element: <ProductDetailPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'faq', element: <FaqPage /> },
    ],
  },
])
