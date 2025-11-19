'use client';

import { useState } from 'react';
import { Instagram, Phone, Mail, Check } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import Image from 'next/image';

interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  instagramHandle: string | null;
}

export default function CompanyCard({ company }: { company: Company }) {
  const { selectedCompanies, toggleCompany } = useCartStore();
  const isSelected = selectedCompanies.some((c) => c.id === company.id);
  const [showInstagram, setShowInstagram] = useState(false);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all ${
      isSelected ? 'ring-2 ring-blue-500' : ''
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800">{company.name}</h3>
          {company.instagramHandle && (
            <a
              href={`https://instagram.com/${company.instagramHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 hover:text-pink-700 flex items-center gap-1 mt-2"
            >
              <Instagram size={16} />
              @{company.instagramHandle}
            </a>
          )}
        </div>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleCompany(company)}
          className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Phone size={16} />
          <span className="text-sm">{company.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Mail size={16} />
          <span className="text-sm">{company.email}</span>
        </div>
      </div>

      {company.instagramHandle && (
        <button
          onClick={() => setShowInstagram(!showInstagram)}
          className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-colors"
        >
          Instagram投稿を見る
        </button>
      )}

      {showInstagram && company.instagramHandle && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            Instagram連携機能（実装中）
          </p>
        </div>
      )}

      {isSelected && (
        <div className="mt-3 flex items-center gap-2 text-green-600 font-semibold">
          <Check size={20} />
          問い合わせ対象に追加済み
        </div>
      )}
    </div>
  );
}
