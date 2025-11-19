'use client'

import { useCartStore } from '@/store/cartStore'
import { ShoppingCart, Briefcase } from 'lucide-react'
import Link from 'next/link'

export default function CartSummary() {
  const { services, companies, getTotalEstimate } = useCartStore()
  const estimate = getTotalEstimate()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (services.length === 0 && companies.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4 md:hidden z-40">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
            <span className="font-semibold">{services.length}件</span>
          </div>
          <div className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            <span className="font-semibold">{companies.length}社</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {services.length > 0 && (
            <div className="text-right">
              <div className="text-xs text-gray-500">概算</div>
              <div className="font-semibold text-sm">
                {formatPrice(estimate.min)}〜
              </div>
            </div>
          )}

          <Link
            href="/cart"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            カートへ
          </Link>
        </div>
      </div>
    </div>
  )
}
