'use client'

import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'
import { ShoppingCart, Home, Briefcase, Wrench } from 'lucide-react'

export default function Header() {
  const services = useCartStore((state) => state.services)
  const companies = useCartStore((state) => state.companies)
  const totalItems = services.length + companies.length

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Wrench className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">
              栃木リフォームポータル
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
            >
              <Home className="h-5 w-5" />
              <span>ホーム</span>
            </Link>

            <Link
              href="/services"
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
            >
              <Wrench className="h-5 w-5" />
              <span>サービス</span>
            </Link>

            <Link
              href="/companies"
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
            >
              <Briefcase className="h-5 w-5" />
              <span>業者一覧</span>
            </Link>

            <Link
              href="/cart"
              className="relative flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>カート</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}
