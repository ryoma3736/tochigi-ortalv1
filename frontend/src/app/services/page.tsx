'use client';

import { useState, useEffect } from 'react';
import ServiceCard from '@/components/shared/ServiceCard';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  estimatedPrice: number;
  category: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { selectedServices } = useCartStore();

  useEffect(() => {
    // Mock data - 実際はAPIから取得
    const mockServices: Service[] = [
      {
        id: '1',
        name: 'キッチンリフォーム',
        description: 'システムキッチン交換、配管工事、内装工事を含む',
        estimatedPrice: 800000,
        category: 'キッチン',
      },
      {
        id: '2',
        name: 'バスルームリフォーム',
        description: 'ユニットバス交換、給排水工事、防水工事',
        estimatedPrice: 1200000,
        category: 'バスルーム',
      },
      {
        id: '3',
        name: 'リビング壁紙張替え',
        description: '約30㎡のリビングの壁紙張替え',
        estimatedPrice: 150000,
        category: 'リビング',
      },
      {
        id: '4',
        name: '外壁塗装',
        description: '住宅全体の外壁塗装（約100㎡）',
        estimatedPrice: 900000,
        category: '外壁',
      },
      {
        id: '5',
        name: '屋根塗装',
        description: 'スレート屋根の塗装工事',
        estimatedPrice: 600000,
        category: '屋根',
      },
      {
        id: '6',
        name: 'トイレリフォーム',
        description: '便器交換、内装工事、配管工事',
        estimatedPrice: 300000,
        category: 'トイレ',
      },
    ];
    setServices(mockServices);
  }, []);

  const categories = ['all', ...Array.from(new Set(services.map((s) => s.category)))];
  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter((s) => s.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              栃木リフォームポータル
            </Link>
            <Link
              href="/cart"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ShoppingCart size={20} />
              カート ({selectedServices.length})
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">リフォームサービス一覧</h1>
        <p className="text-gray-600 mb-8">
          お好きなサービスを選択して、複数の業者に一括で問い合わせできます
        </p>

        {/* Category Filter */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {cat === 'all' ? 'すべて' : cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        {/* CTA */}
        {selectedServices.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t-2 border-blue-600 p-4">
            <div className="container mx-auto flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">選択中のサービス</p>
                <p className="text-2xl font-bold text-blue-600">{selectedServices.length}件</p>
              </div>
              <Link
                href="/companies"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors"
              >
                業者を選ぶ →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
