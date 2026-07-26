import { createBrowserRouter, Navigate } from 'react-router-dom'

import { StorefrontLayout } from '@/app/layouts/StorefrontLayout'
import { HomePage } from '@/features/home/HomePage'
import { ShopPage } from '@/features/catalog/ShopPage'
import { ProductDetailPage } from '@/features/catalog/ProductDetailPage'
import { ContactPage } from '@/features/contact/ContactPage'
import { AboutPage } from '@/features/about/AboutPage'
import { FaqPage } from '@/features/content/FaqPage'
import { AdminLayout } from '@/features/admin/AdminLayout'
import { AdminLoginPage } from '@/features/admin/AdminLoginPage'
import { AdminDashboardPage } from '@/features/admin/AdminDashboardPage'
import { AdminProductsPage } from '@/features/admin/AdminProductsPage'
import { AdminProductFormPage } from '@/features/admin/AdminProductFormPage'
import { AdminCategoriesPage } from '@/features/admin/AdminCategoriesPage'
import { AdminBrandsPage } from '@/features/admin/AdminBrandsPage'
import { AdminSettingsPage } from '@/features/admin/AdminPlaceholderPages'
import { AdminUsersPage } from '@/features/admin/AdminUsersPage'
import { AdminInvoicesPage } from '@/features/admin/AdminInvoicesPage'
import { AdminInvoiceFormPage } from '@/features/admin/AdminInvoiceFormPage'
import { AdminInvoiceDetailPage } from '@/features/admin/AdminInvoiceDetailPage'
import { AdminInvoicePrintPage } from '@/features/admin/AdminInvoicePrintPage'
import { AdminInvoiceReviewPage } from '@/features/admin/AdminInvoiceReviewPage'
import { AdminFinancePage } from '@/features/admin/AdminFinancePage'
import { RequireAdmin } from '@/features/admin/RequireAdmin'

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
      { path: 'login', element: <Navigate to="/admin/login" replace /> },
      { path: 'register', element: <Navigate to="/" replace /> },
      { path: 'profile', element: <Navigate to="/admin" replace /> },
    ],
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/admin/invoices/:id/print',
    element: (
      <RequireAdmin>
        <AdminInvoicePrintPage />
      </RequireAdmin>
    ),
  },
  {
    path: '/admin',
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'products', element: <AdminProductsPage /> },
      { path: 'products/new', element: <AdminProductFormPage /> },
      { path: 'products/:id/edit', element: <AdminProductFormPage /> },
      { path: 'categories', element: <AdminCategoriesPage /> },
      { path: 'brands', element: <AdminBrandsPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'invoices', element: <AdminInvoicesPage /> },
      { path: 'invoices/new', element: <AdminInvoiceFormPage /> },
      { path: 'invoices/:id', element: <AdminInvoiceDetailPage /> },
      { path: 'invoice-review', element: <AdminInvoiceReviewPage /> },
      { path: 'finance', element: <AdminFinancePage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
    ],
  },
])
