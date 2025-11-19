'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Send } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const {
    selectedServices,
    selectedCompanies,
    message,
    setMessage,
    removeService,
    toggleCompany,
    getTotalPrice,
    clearCart,
  } = useCartStore();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedServices.length === 0) {
      alert('サービスを選択してください');
      return;
    }

    if (selectedCompanies.length === 0) {
      alert('業者を選択してください');
      return;
    }

    setIsSubmitting(true);

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 実際はAPIにPOST
      console.log({
        customer: { name: customerName, email: customerEmail, phone: customerPhone },
        services: selectedServices,
        companies: selectedCompanies,
        message,
      });

      clearCart();
      router.push('/inquiry/success');
    } catch (error) {
      alert('送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (selectedServices.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">カートが空です</h2>
          <Link
            href="/services"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold inline-block"
          >
            サービスを選ぶ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm mb-8">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            栃木リフォームポータル
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">問い合わせ内容の確認</h1>

        {/* Selected Services */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">選択したサービス</h2>
          <div className="space-y-3">
            {selectedServices.map((service) => (
              <div key={service.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-800">{service.name}</h3>
                  <p className="text-sm text-gray-600">{service.category}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-blue-600">¥{service.estimatedPrice.toLocaleString()}</span>
                  <button
                    onClick={() => removeService(service.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-800">合計見積金額</span>
              <span className="text-2xl font-bold text-blue-600">
                ¥{getTotalPrice().toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">※概算金額です。実際の金額は業者の見積もりをご確認ください</p>
          </div>
        </div>

        {/* Selected Companies */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">問い合わせ先業者 ({selectedCompanies.length}社)</h2>
          {selectedCompanies.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">業者が選択されていません</p>
              <Link
                href="/companies"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold inline-block"
              >
                業者を選ぶ
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedCompanies.map((company) => (
                <div key={company.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-800">{company.name}</h3>
                    <p className="text-sm text-gray-600">{company.phone}</p>
                  </div>
                  <button
                    onClick={() => toggleCompany(company)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer Info Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">お客様情報</h2>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                お名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="山田 太郎"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                電話番号 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="090-1234-5678"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                問い合わせ内容・ご要望
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="リフォームの詳細やご要望をご記入ください&#13;&#10;例：&#13;&#10;・築30年の戸建て住宅&#13;&#10;・予算は総額150万円程度を想定&#13;&#10;・来月から工事可能な業者希望"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || selectedCompanies.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-colors"
          >
            {isSubmitting ? (
              '送信中...'
            ) : (
              <>
                <Send size={24} />
                {selectedCompanies.length}社に一括問い合わせ
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 mt-3 text-center">
            送信ボタンを押すと、選択した業者全員にメールで問い合わせが送信されます
          </p>
        </form>
      </div>
    </div>
  );
}
