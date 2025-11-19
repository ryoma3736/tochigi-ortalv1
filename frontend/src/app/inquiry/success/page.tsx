'use client';

import Link from 'next/link';
import { CheckCircle, Mail, Phone } from 'lucide-react';

export default function InquirySuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-6">
              <CheckCircle size={64} className="text-green-600" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            問い合わせを送信しました！
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            選択された業者全員にメールで問い合わせが送信されました。
            <br />
            業者から直接ご連絡がありますので、しばらくお待ちください。
          </p>

          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="font-bold text-gray-800 mb-4 text-xl">次のステップ</h2>
            <div className="space-y-4 text-left">
              <div className="flex gap-4">
                <div className="flex-shrink-0 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Mail size={18} />
                    メール確認
                  </h3>
                  <p className="text-sm text-gray-600">
                    ご登録のメールアドレスに確認メールをお送りしています
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Phone size={18} />
                    業者からの連絡を待つ
                  </h3>
                  <p className="text-sm text-gray-600">
                    通常1〜3営業日以内に業者から電話またはメールでご連絡があります
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">現地調査・見積もり</h3>
                  <p className="text-sm text-gray-600">
                    業者と日程を調整して、現地調査と正式な見積もりを依頼してください
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="/"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors"
            >
              トップページに戻る
            </Link>

            <Link
              href="/services"
              className="block w-full bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg font-bold text-lg transition-colors"
            >
              他のサービスも見る
            </Link>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            お問い合わせありがとうございました。
            <br />
            ご不明点がございましたら、カスタマーサポート（0120-XXX-XXXX）までご連絡ください。
          </p>
        </div>
      </div>
    </div>
  );
}
