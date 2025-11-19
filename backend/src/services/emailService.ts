import nodemailer from 'nodemailer'
import { logger } from '../utils/logger.js'

interface InquiryEmailData {
  to: string
  companyName: string
  customerName: string
  customerEmail: string
  customerPhone: string
  services: string[]
  message: string
}

// Create reusable transporter
const createTransporter = () => {
  const emailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  }

  return nodemailer.createTransporter(emailConfig)
}

/**
 * Send inquiry notification email to company
 */
export const sendInquiryEmail = async (data: InquiryEmailData): Promise<void> => {
  try {
    const transporter = createTransporter()

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .section {
            background: white;
            padding: 20px;
            margin: 15px 0;
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .label {
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
          }
          .value {
            margin-bottom: 15px;
          }
          .services {
            list-style: none;
            padding: 0;
          }
          .services li {
            background: #667eea;
            color: white;
            padding: 8px 15px;
            margin: 5px 0;
            border-radius: 20px;
            display: inline-block;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>新しいお問い合わせ</h1>
          <p>栃木オルタル経由でお問い合わせがありました</p>
        </div>

        <div class="content">
          <div class="section">
            <div class="label">業者名:</div>
            <div class="value">${data.companyName}</div>
          </div>

          <div class="section">
            <div class="label">お客様情報:</div>
            <div class="value">
              <strong>お名前:</strong> ${data.customerName}<br>
              <strong>メールアドレス:</strong> ${data.customerEmail}<br>
              ${data.customerPhone ? `<strong>電話番号:</strong> ${data.customerPhone}<br>` : ''}
            </div>
          </div>

          ${data.services.length > 0 ? `
          <div class="section">
            <div class="label">希望サービス:</div>
            <ul class="services">
              ${data.services.map(service => `<li>${service}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          ${data.message ? `
          <div class="section">
            <div class="label">メッセージ:</div>
            <div class="value">${data.message.replace(/\n/g, '<br>')}</div>
          </div>
          ` : ''}

          <div class="section">
            <p><strong>次のステップ:</strong></p>
            <ol>
              <li>お客様に直接ご連絡ください</li>
              <li>詳細なヒアリングを行ってください</li>
              <li>見積もりを作成してください</li>
            </ol>
          </div>
        </div>

        <div class="footer">
          <p>このメールは栃木オルタルシステムから自動送信されています。</p>
          <p>お問い合わせに関するご質問は、お客様に直接ご連絡ください。</p>
        </div>
      </body>
      </html>
    `

    const mailOptions = {
      from: `"栃木オルタル" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: data.to,
      subject: `【栃木オルタル】新しいお問い合わせ - ${data.customerName}様より`,
      html: htmlContent,
      text: `
新しいお問い合わせがありました

業者名: ${data.companyName}

お客様情報:
お名前: ${data.customerName}
メールアドレス: ${data.customerEmail}
${data.customerPhone ? `電話番号: ${data.customerPhone}` : ''}

${data.services.length > 0 ? `希望サービス:\n${data.services.map(s => `- ${s}`).join('\n')}` : ''}

${data.message ? `メッセージ:\n${data.message}` : ''}

お客様に直接ご連絡の上、詳細なヒアリングと見積もり作成をお願いいたします。
      `.trim(),
    }

    await transporter.sendMail(mailOptions)
    logger.info(`Inquiry email sent to ${data.to}`)
  } catch (error) {
    logger.error(`Error sending inquiry email to ${data.to}:`, error)
    throw error
  }
}

/**
 * Send welcome email to new user
 */
export const sendWelcomeEmail = async (to: string, name: string): Promise<void> => {
  try {
    const transporter = createTransporter()

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
            border-radius: 8px;
          }
          .content {
            padding: 30px 0;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 25px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>栃木オルタルへようこそ!</h1>
        </div>

        <div class="content">
          <p>${name}様</p>

          <p>栃木オルタルへのご登録ありがとうございます。</p>

          <p>当サービスでは、栃木県内の優良なリフォーム業者を簡単に見つけることができます。</p>

          <p><strong>できること:</strong></p>
          <ul>
            <li>希望するリフォームサービスを選択</li>
            <li>複数の業者に一括でお問い合わせ</li>
            <li>業者のInstagram投稿で施工事例を確認</li>
            <li>見積もりを比較して最適な業者を選択</li>
          </ul>

          <p style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">
              サービスを始める
            </a>
          </p>
        </div>

        <div class="footer">
          <p>栃木オルタル - あなたの理想のリフォームをサポートします</p>
        </div>
      </body>
      </html>
    `

    await transporter.sendMail({
      from: `"栃木オルタル" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: '栃木オルタルへようこそ',
      html: htmlContent,
    })

    logger.info(`Welcome email sent to ${to}`)
  } catch (error) {
    logger.error(`Error sending welcome email to ${to}:`, error)
    throw error
  }
}

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  to: string,
  name: string,
  resetToken: string
): Promise<void> => {
  try {
    const transporter = createTransporter()
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: #f44336;
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .button {
            display: inline-block;
            background: #f44336;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 25px;
            margin: 20px 0;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>パスワードリセット</h1>
        </div>

        <div class="content">
          <p>${name}様</p>

          <p>パスワードリセットのリクエストを受け付けました。</p>

          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">
              パスワードをリセット
            </a>
          </p>

          <div class="warning">
            <strong>重要:</strong>
            <ul>
              <li>このリンクは24時間有効です</li>
              <li>心当たりがない場合は、このメールを無視してください</li>
              <li>パスワードは第三者に教えないでください</li>
            </ul>
          </div>

          <p>リンクをクリックできない場合は、以下のURLをブラウザにコピー&ペーストしてください:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        </div>
      </body>
      </html>
    `

    await transporter.sendMail({
      from: `"栃木オルタル" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: 'パスワードリセットのお願い',
      html: htmlContent,
    })

    logger.info(`Password reset email sent to ${to}`)
  } catch (error) {
    logger.error(`Error sending password reset email to ${to}:`, error)
    throw error
  }
}

export default {
  sendInquiryEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
}
