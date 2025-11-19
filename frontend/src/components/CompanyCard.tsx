'use client'

import { Company } from '@/types'
import { useCartStore } from '@/store/cartStore'
import { Star, MapPin, CheckCircle, Instagram } from 'lucide-react'
import Link from 'next/link'

interface CompanyCardProps {
  company: Company
}

export default function CompanyCard({ company }: CompanyCardProps) {
  const { companies, addCompany, removeCompany } = useCartStore()
  const isSelected = companies.some(c => c.companyId === company.id)

  const handleToggleSelect = () => {
    if (isSelected) {
      removeCompany(company.id)
    } else {
      addCompany({
        companyId: company.id,
        companyName: company.name,
        contactEmail: company.contactEmail,
        rating: company.rating
      })
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 ${
      isSelected ? 'ring-2 ring-blue-500' : ''
    }`}>
      {company.imageUrl && (
        <div className="h-48 overflow-hidden bg-gray-200">
          <img
            src={company.imageUrl}
            alt={company.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">{company.name}</h3>
              {company.verified && (
                <CheckCircle className="h-5 w-5 text-blue-600" title="認証済み" />
              )}
            </div>

            <div className="flex items-center space-x-1 mb-2">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="font-semibold text-gray-900">{company.rating.toFixed(1)}</span>
              <span className="text-gray-500 text-sm">({company.reviewCount}件)</span>
            </div>
          </div>

          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleToggleSelect}
            className="h-6 w-6 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {company.description}
        </p>

        {/* Services */}
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">対応サービス</div>
          <div className="flex flex-wrap gap-1">
            {company.services.slice(0, 3).map((service, idx) => (
              <span
                key={idx}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
              >
                {service}
              </span>
            ))}
            {company.services.length > 3 && (
              <span className="text-xs text-gray-500">
                +{company.services.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Areas */}
        <div className="mb-4">
          <div className="flex items-center space-x-1 text-gray-600 text-sm">
            <MapPin className="h-4 w-4" />
            <span>{company.areas.join(', ')}</span>
          </div>
        </div>

        {/* Instagram */}
        {company.instagramHandle && (
          <div className="mb-4">
            <a
              href={`https://instagram.com/${company.instagramHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-pink-600 hover:text-pink-700 transition"
            >
              <Instagram className="h-5 w-5" />
              <span className="text-sm">@{company.instagramHandle}</span>
            </a>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleToggleSelect}
          className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
            isSelected
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {isSelected ? '選択済み ✓' : 'この業者を選択'}
        </button>

        {company.website && (
          <Link
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-sm text-blue-600 hover:text-blue-700 mt-2"
          >
            ウェブサイトを見る →
          </Link>
        )}
      </div>
    </div>
  )
}
