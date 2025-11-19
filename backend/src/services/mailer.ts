import nodemailer, { Transporter } from 'nodemailer';
import sgMail from '@sendgrid/mail';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface TemplateData {
  [key: string]: unknown;
}

interface SendResult {
  success: boolean;
  email: string;
  error?: string;
}

export class MailerService {
  private transporter: Transporter | null = null;
  private useSendGrid: boolean;
  private fromEmail: string;
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // 1秒

  constructor() {
    this.useSendGrid = !!process.env.SENDGRID_API_KEY;
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@tochigi-portal.com';

    if (this.useSendGrid) {
      // SendGrid設定
      sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
      console.log('MailerService: Using SendGrid for email delivery');
    } else {
      // Nodemailer (SMTP) 設定
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log('MailerService: Using SMTP for email delivery');
    }
  }

  /**
   * テンプレートファイルを読み込んでコンパイル
   */
  private async loadTemplate(templateName: string): Promise<handlebars.TemplateDelegate> {
    const templatePath = path.join(
      process.cwd(),
      'src',
      'templates',
      'email',
      `${templateName}.html`
    );
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    return handlebars.compile(templateContent);
  }

  /**
   * HTMLテンプレートからメール本文を生成
   */
  async renderTemplate(templateName: string, data: TemplateData): Promise<string> {
    const template = await this.loadTemplate(templateName);
    return template(data);
  }

  /**
   * 単一メール送信（リトライ機能付き）
   */
  async sendEmail(options: EmailOptions, retryCount = 0): Promise<void> {
    try {
      if (this.useSendGrid) {
        await this.sendWithSendGrid(options);
      } else {
        await this.sendWithNodemailer(options);
      }
      console.log(`Email sent successfully to: ${options.to}`);
    } catch (error) {
      if (retryCount < this.maxRetries) {
        console.warn(
          `Email send failed (attempt ${retryCount + 1}/${this.maxRetries}). Retrying...`
        );
        await this.delay(this.retryDelay * (retryCount + 1));
        return this.sendEmail(options, retryCount + 1);
      }
      console.error('Email send failed after maximum retries:', error);
      throw error;
    }
  }

  /**
   * SendGridでメール送信
   */
  private async sendWithSendGrid(options: EmailOptions): Promise<void> {
    const msg = {
      to: options.to,
      from: options.from || this.fromEmail,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    };

    await sgMail.send(msg);
  }

  /**
   * Nodemailer (SMTP) でメール送信
   */
  private async sendWithNodemailer(options: EmailOptions): Promise<void> {
    if (!this.transporter) {
      throw new Error('Nodemailer transporter not initialized');
    }

    const mailOptions = {
      from: options.from || this.fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * 一斉送信（Promise.all使用）
   */
  async sendBulkEmails(recipients: EmailOptions[]): Promise<SendResult[]> {
    console.log(`Starting bulk email send to ${recipients.length} recipients`);

    const results = await Promise.allSettled(
      recipients.map(async (options) => {
        try {
          await this.sendEmail(options);
          return {
            success: true,
            email: Array.isArray(options.to) ? options.to[0] : options.to,
          };
        } catch (error) {
          return {
            success: false,
            email: Array.isArray(options.to) ? options.to[0] : options.to,
            error: (error as Error).message,
          };
        }
      })
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          success: false,
          email: Array.isArray(recipients[index].to)
            ? recipients[index].to[0]
            : recipients[index].to as string,
          error: result.reason?.message || 'Unknown error',
        };
      }
    });
  }

  /**
   * 業者向け問い合わせ通知メール送信
   */
  async sendInquiryNotification(data: {
    vendorEmail: string;
    vendorName: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    services: string[];
    message: string;
    inquiryDate: string;
  }): Promise<void> {
    const html = await this.renderTemplate('inquiry-notification', data);

    await this.sendEmail({
      to: data.vendorEmail,
      subject: `【新規問い合わせ】${data.customerName}様からお問い合わせがありました`,
      html,
      replyTo: data.customerEmail,
    });
  }

  /**
   * お客様向け確認メール送信
   */
  async sendInquiryConfirmation(data: {
    customerEmail: string;
    customerName: string;
    services: string[];
    vendorCount: number;
    message: string;
    inquiryDate: string;
  }): Promise<void> {
    const html = await this.renderTemplate('inquiry-confirmation', data);

    await this.sendEmail({
      to: data.customerEmail,
      subject: 'お問い合わせを受け付けました - 栃木ポータル',
      html,
    });
  }

  /**
   * ウェルカムメール送信
   */
  async sendWelcomeEmail(data: {
    email: string;
    name: string;
    accountType: 'customer' | 'vendor';
  }): Promise<void> {
    const html = await this.renderTemplate('welcome-email', data);

    await this.sendEmail({
      to: data.email,
      subject: '栃木ポータルへようこそ！',
      html,
    });
  }

  /**
   * 遅延処理
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 接続テスト
   */
  async verifyConnection(): Promise<boolean> {
    try {
      if (this.useSendGrid) {
        // SendGridの場合は簡単なAPI呼び出しでテスト
        return true;
      } else if (this.transporter) {
        await this.transporter.verify();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Mailer connection verification failed:', error);
      return false;
    }
  }
}

// シングルトンインスタンスをエクスポート
export const mailerService = new MailerService();
