'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Users, Star, Wrench } from 'lucide-react'
import ServiceCard from '@/components/ServiceCard'
import CompanyCard from '@/components/CompanyCard'
import CartSummary from '@/components/CartSummary'
import { api } from '@/lib/api'
import type { Service, Company } from '@/types'

export default function Home() {
  const [featuredServices, setFeaturedServices] = useState<Service[]>([])
  const [topCompanies, setTopCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, companiesRes] = await Promise.all([
          api.get('/services?limit=6'),
          api.get('/companies?sort=rating&limit=4')
        ])

        setFeaturedServices(servicesRes.data.services || [])
        setTopCompanies(companiesRes.data.companies || [])
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <>
      <main className="min-h-screen pb-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                栃木県の信頼できる
                <br />
                リフォーム業者を一括比較
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                最大10社に一括で見積もり依頼。あなたにぴったりの業者が見つかります。
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/services"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition flex items-center justify-center space-x-2"
                >
                  <Wrench className="h-6 w-6" />
                  <span>サービスを探す</span>
                </Link>
                <Link
                  href="/companies"
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition flex items-center justify-center space-x-2"
                >
                  <Users className="h-6 w-6" />
                  <span>業者一覧を見る</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">選ばれる3つの理由</h2>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">厳選された業者のみ</h3>
                <p className="text-gray-600">
                  実績と評価をもとに厳選された優良業者のみを掲載。安心してご利用いただけます。
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">最大10社に一括依頼</h3>
                <p className="text-gray-600">
                  一度の入力で最大10社に見積もり依頼。複数の提案を比較して最適な業者を選べます。
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">実績が見える</h3>
                <p className="text-gray-600">
                  Instagram連携で実際の施工事例を確認。業者の実力を目で見て判断できます。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Services */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">人気のサービス</h2>
              <Link
                href="/services"
                className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1"
              >
                <span>すべて見る</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-200 h-96 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Top Companies */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">評価の高い業者</h2>
              <Link
                href="/companies"
                className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1"
              >
                <span>すべて見る</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-200 h-96 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {topCompanies.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              今すぐ無料で見積もり依頼
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              希望のサービスと業者を選んで、一括で問い合わせできます
            </p>
            <Link
              href="/services"
              className="inline-flex items-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition"
            >
              <span>まずはサービスを選ぶ</span>
              <ArrowRight className="h-6 w-6" />
            </Link>
          </div>
        </section>
      </main>

      <CartSummary />
    </>
  )
}
