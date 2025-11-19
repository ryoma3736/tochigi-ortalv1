'use client';

import { useState, useEffect } from 'react';
import CompanyCard from '@/components/shared/CompanyCard';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  instagramHandle: string | null;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const { selectedCompanies, selectedServices } = useCartStore();

  useEffect(() => {
    // Mock data - 実際はAPIから取得
    const mockCompanies: Company[] = [
      {
        id: '1',
        name: '栃木リフォーム株式会社',
        email: 'info@tochigi-reform.co.jp',
        phone: '028-123-4567',
        instagramHandle: 'tochigi_reform',
      },
      {
        id: '2',
        name: '宇都宮建設',
        email: 'contact@utsunomiya-kensetsu.jp',
        phone: '028-234-5678',
        instagramHandle: 'utsunomiya_build',
      },
      {
        id: '3',
        name: '小山工務店',
        email: 'info@oyama-koumuten.com',
        phone: '0285-345-6789',
        instagramHandle: 'oyama_koumuten',
      },
      {
        id: '4',
        name: '日光リノベーション',
        email: 'info@nikko-reno.jp',
        phone: '0288-456-7890',
        instagramHandle: null,
      },
      {
        id: '5',
        name: '那須高原住宅',
        email: 'contact@nasu-jutaku.co.jp',
        phone: '0287-567-8901',
        instagramHandle: 'nasu_house',
      },
      {
        id: '6',
        name: '足利建築工房',
        email: 'info@ashikaga-kobo.com',
        phone: '0284-678-9012',
        instagramHandle: 'ashikaga_kobo',
      },
    ];
    setCompanies(mockCompanies);
  }, []);

  if (selectedServices.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            先にサービスを選択してください
          </h2>
          <Link
            href="/services"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold inline-block"
          >
            サービス一覧へ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              栃木リフォームポータル
            </Link>
            <div className="flex gap-4">
              <Link href="/services" className="text-gray-600 hover:text-blue-600">
                サービス一覧
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
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">業者を選択</h1>
        <p className="text-gray-600 mb-8">
          最大10社まで選択できます。選択した業者全員に一括で問い合わせが送信されます。
          <br />
          <span className="text-blue-600 font-semibold">
            現在 {selectedCompanies.length}/10 社選択中
          </span>
        </p>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>

        {/* CTA */}
        {selectedCompanies.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t-2 border-blue-600 p-4">
            <div className="container mx-auto flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">選択中の業者</p>
                <p className="text-2xl font-bold text-blue-600">{selectedCompanies.length}社</p>
              </div>
              <Link
                href="/cart"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors"
              >
                問い合わせ内容を入力 →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
