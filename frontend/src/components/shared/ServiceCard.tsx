'use client';

import { ShoppingCart, Check } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

interface Service {
  id: string;
  name: string;
  description: string;
  estimatedPrice: number;
  category: string;
}

export default function ServiceCard({ service }: { service: Service }) {
  const { selectedServices, addService, removeService } = useCartStore();
  const isSelected = selectedServices.some((s) => s.id === service.id);

  const handleToggle = () => {
    if (isSelected) {
      removeService(service.id);
    } else {
      addService(service);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase">{service.category}</span>
          <h3 className="text-xl font-bold text-gray-800 mt-1">{service.name}</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">¥{service.estimatedPrice.toLocaleString()}</p>
          <p className="text-xs text-gray-500">概算料金</p>
        </div>
      </div>

      <p className="text-gray-600 mb-4 min-h-[60px]">{service.description}</p>

      <button
        onClick={handleToggle}
        className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
          isSelected
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isSelected ? (
          <>
            <Check size={20} />
            カートに追加済み
          </>
        ) : (
          <>
            <ShoppingCart size={20} />
            カートに追加
          </>
        )}
      </button>
    </div>
  );
}
