'use client'

import { Service } from '@/types'
import { useCartStore } from '@/store/cartStore'
import { ShoppingCart, Check } from 'lucide-react'
import { useState } from 'react'

interface ServiceCardProps {
  service: Service
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const { services, addService, removeService } = useCartStore()
  const isInCart = services.some(s => s.serviceId === service.id)
  const [justAdded, setJustAdded] = useState(false)

  const handleToggleCart = () => {
    if (isInCart) {
      removeService(service.id)
    } else {
      addService({
        serviceId: service.id,
        serviceName: service.name,
        category: service.category,
        estimatedPrice: service.estimatedPrice
      })
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 2000)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {service.imageUrl && (
        <div className="h-48 overflow-hidden bg-gray-200">
          <img
            src={service.imageUrl}
            alt={service.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {service.category}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {service.description}
        </p>

        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-1">概算料金</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatPrice(service.estimatedPrice.min)} 〜 {formatPrice(service.estimatedPrice.max)}
          </div>
        </div>

        {service.duration && (
          <div className="text-sm text-gray-500 mb-4">
            工期目安: {service.duration}
          </div>
        )}

        <button
          onClick={handleToggleCart}
          className={`w-full py-2 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors ${
            isInCart
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : justAdded
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {justAdded ? (
            <>
              <Check className="h-5 w-5" />
              <span>追加しました</span>
            </>
          ) : isInCart ? (
            <>
              <span>カートから削除</span>
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5" />
              <span>カートに追加</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
