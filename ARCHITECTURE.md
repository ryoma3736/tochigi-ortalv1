# リフォーム業者向けプラットフォーム - 技術アーキテクチャ設計書

## 目次

1. [システム概要](#システム概要)
2. [技術スタック](#技術スタック)
3. [システム構成図](#システム構成図)
4. [データベース設計](#データベース設計)
5. [API設計](#api設計)
6. [フロントエンド設計](#フロントエンド設計)
7. [バックエンド設計](#バックエンド設計)
8. [セキュリティ設計](#セキュリティ設計)
9. [スケーラビリティ対策](#スケーラビリティ対策)
10. [インフラストラクチャ](#インフラストラクチャ)
11. [開発・運用フロー](#開発運用フロー)

---

## システム概要

### ビジネス要件

リフォーム業者（最大300社）と顧客を繋ぐマッチングプラットフォーム。

**主要機能:**

- **顧客向けWebサイト**
  - リフォーム概算料金表示
  - カート機能（複数工事の選択）
  - 一括問い合わせ送信
  - 業者のInstagram表示

- **業者向け管理画面**
  - 案件管理
  - 顧客問い合わせ対応
  - Instagram連携設定
  - 売上・統計分析

- **プラットフォーム機能**
  - メール一斉送信（業者へのお知らせ）
  - 月額10万円の決済処理
  - 業者アカウント管理（上限300社）

---

## 技術スタック

### フロントエンド

| 用途 | 技術 | 理由 |
|------|------|------|
| **フレームワーク** | Next.js 14 (App Router) | SEO最適化、SSR/SSG、型安全性 |
| **言語** | TypeScript 5.x | 型安全性、開発者体験 |
| **UIライブラリ** | React 18 | コンポーネント再利用性 |
| **スタイリング** | Tailwind CSS + shadcn/ui | 迅速なUI開発、カスタマイズ性 |
| **状態管理** | Zustand | シンプル、軽量、TypeScript完全対応 |
| **フォーム管理** | React Hook Form + Zod | バリデーション、型安全 |
| **データフェッチング** | TanStack Query (React Query) | キャッシュ、再フェッチ、最適化 |

### バックエンド

| 用途 | 技術 | 理由 |
|------|------|------|
| **APIフレームワーク** | Next.js API Routes + tRPC | End-to-end型安全性、開発効率 |
| **認証** | NextAuth.js (Auth.js) | 多様な認証方式、セッション管理 |
| **ORM** | Prisma | 型安全、マイグレーション、開発者体験 |
| **バリデーション** | Zod | スキーマ駆動、型推論 |
| **メール送信** | SendGrid / Amazon SES | 信頼性、配信率、スケーラビリティ |
| **ファイルストレージ** | AWS S3 | 画像保存、スケーラビリティ |
| **決済処理** | Stripe | 月額課金、セキュリティ |
| **Instagram API** | Instagram Graph API | 公式API、安定性 |

### データベース

| 用途 | 技術 | 理由 |
|------|------|------|
| **メインDB** | PostgreSQL 15 | ACID準拠、リレーショナルデータ |
| **キャッシュ** | Redis | セッション、APIレスポンスキャッシュ |
| **検索エンジン** | Elasticsearch (オプション) | 全文検索、業者検索最適化 |

### インフラストラクチャ

| 用途 | 技術 | 理由 |
|------|------|------|
| **ホスティング** | Vercel | Next.js最適化、自動デプロイ |
| **データベースホスティング** | AWS RDS (PostgreSQL) | マネージド、バックアップ自動化 |
| **キャッシュ** | AWS ElastiCache (Redis) | マネージド、高速 |
| **ストレージ** | AWS S3 + CloudFront | CDN、画像配信最適化 |
| **監視** | Datadog / New Relic | APM、ログ集約、アラート |
| **エラートラッキング** | Sentry | リアルタイムエラー検知 |

### DevOps & CI/CD

| 用途 | 技術 | 理由 |
|------|------|------|
| **CI/CD** | GitHub Actions | 自動テスト、自動デプロイ |
| **コンテナ** | Docker | 環境統一、再現性 |
| **IaC** | Terraform (オプション) | インフラコード管理 |
| **バージョン管理** | Git + GitHub | コラボレーション、レビュー |

---

## システム構成図

```
┌─────────────────────────────────────────────────────────────────┐
│                        ユーザー層                                 │
├─────────────────────────────────────────────────────────────────┤
│  顧客Webブラウザ          業者管理画面          管理者画面        │
└──────────┬──────────────────┬──────────────────┬────────────────┘
           │                  │                  │
           │ HTTPS            │ HTTPS            │ HTTPS
           │                  │                  │
┌──────────▼──────────────────▼──────────────────▼────────────────┐
│                    CDN (CloudFront)                              │
└──────────┬───────────────────────────────────────────────────────┘
           │
┌──────────▼───────────────────────────────────────────────────────┐
│                  Next.js Application (Vercel)                    │
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ 顧客向けPages │  │ 業者向けPages │  │ API Routes   │          │
│  │ (SSR/SSG)    │  │ (認証必須)   │  │ (tRPC)       │          │
│  └──────────────┘  └──────────────┘  └──────┬───────┘          │
└─────────────────────────────────────────────┼───────────────────┘
                                              │
        ┌─────────────────────────────────────┼─────────────────────┐
        │                                     │                     │
┌───────▼────────┐  ┌──────────────────┐  ┌──▼─────────────┐  ┌───▼────────┐
│ PostgreSQL DB  │  │ Redis Cache      │  │ AWS S3         │  │ Stripe API │
│ (AWS RDS)      │  │ (ElastiCache)    │  │ (画像保存)     │  │ (決済)     │
│                │  │                  │  │                │  │            │
│ • 業者情報     │  │ • セッション     │  │ • Instagram画像│  │ • 月額課金 │
│ • 顧客情報     │  │ • APIキャッシュ  │  │ • 業者ロゴ     │  │            │
│ • 問い合わせ   │  │ • レート制限     │  │                │  │            │
│ • 価格設定     │  │                  │  │                │  │            │
└────────────────┘  └──────────────────┘  └────────────────┘  └────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      外部サービス連携                             │
├─────────────────────────────────────────────────────────────────┤
│ • Instagram Graph API (業者Instagram表示)                        │
│ • SendGrid / Amazon SES (メール一斉送信)                         │
│ • Stripe (月額決済処理)                                          │
│ • Sentry (エラートラッキング)                                    │
│ • Datadog (監視・APM)                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## データベース設計

### ER図

```
┌─────────────────┐         ┌─────────────────┐
│   contractors   │         │     users       │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │         │ id (PK)         │
│ email           │         │ email           │
│ company_name    │         │ name            │
│ password_hash   │         │ phone           │
│ plan_type       │         │ created_at      │
│ subscription_id │         └─────────────────┘
│ instagram_token │                 │
│ instagram_user  │                 │ 1
│ status          │                 │
│ created_at      │                 │ N
│ updated_at      │         ┌───────▼─────────┐
└────────┬────────┘         │   inquiries     │
         │                  ├─────────────────┤
         │ 1                │ id (PK)         │
         │                  │ user_id (FK)    │
         │ N                │ name            │
         │                  │ email           │
    ┌────▼────────────┐     │ phone           │
    │ services        │     │ address         │
    ├─────────────────┤     │ service_ids     │
    │ id (PK)         │     │ total_estimate  │
    │ contractor_id   │     │ message         │
    │ category        │     │ status          │
    │ name            │     │ created_at      │
    │ base_price      │     └─────────────────┘
    │ unit            │              │
    │ description     │              │ 1
    │ image_url       │              │
    │ is_active       │              │ N
    └─────────────────┘     ┌────────▼────────────┐
                            │ inquiry_contractors │
                            ├─────────────────────┤
    ┌───────────────┐       │ id (PK)             │
    │ subscriptions │       │ inquiry_id (FK)     │
    ├───────────────┤       │ contractor_id (FK)  │
    │ id (PK)       │       │ sent_at             │
    │ contractor_id │       │ opened_at           │
    │ stripe_sub_id │       │ replied_at          │
    │ status        │       │ status              │
    │ current_period│       └─────────────────────┘
    │ created_at    │
    │ updated_at    │
    └───────────────┘
```

### Prismaスキーマ定義

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 業者テーブル
model Contractor {
  id                String   @id @default(cuid())
  email             String   @unique
  passwordHash      String   @map("password_hash")
  companyName       String   @map("company_name")

  // プロフィール
  description       String?  @db.Text
  logoUrl           String?  @map("logo_url")
  phoneNumber       String?  @map("phone_number")
  address           String?
  website           String?

  // Instagram連携
  instagramToken    String?  @map("instagram_token") @db.Text
  instagramUserId   String?  @map("instagram_user_id")
  instagramUsername String?  @map("instagram_username")

  // サブスクリプション
  planType          PlanType @default(FREE) @map("plan_type")
  subscriptionId    String?  @unique @map("subscription_id")

  // ステータス
  status            ContractorStatus @default(PENDING)
  isActive          Boolean  @default(true) @map("is_active")

  // タイムスタンプ
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  // リレーション
  services          Service[]
  subscriptions     Subscription[]
  inquiryContractors InquiryContractor[]

  @@map("contractors")
}

enum PlanType {
  FREE
  BASIC
  PREMIUM
}

enum ContractorStatus {
  PENDING    // 承認待ち
  ACTIVE     // アクティブ
  SUSPENDED  // 停止中
  DELETED    // 削除済み
}

// サービス（工事項目）
model Service {
  id            String   @id @default(cuid())
  contractorId  String   @map("contractor_id")

  // サービス詳細
  category      ServiceCategory
  name          String
  basePrice     Decimal  @map("base_price") @db.Decimal(10, 2)
  unit          String   // 例: "㎡", "式", "個"
  description   String?  @db.Text
  imageUrl      String?  @map("image_url")

  // 表示設定
  displayOrder  Int      @default(0) @map("display_order")
  isActive      Boolean  @default(true) @map("is_active")

  // タイムスタンプ
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  // リレーション
  contractor    Contractor @relation(fields: [contractorId], references: [id], onDelete: Cascade)

  @@index([contractorId])
  @@index([category])
  @@map("services")
}

enum ServiceCategory {
  EXTERIOR_WALL    // 外壁塗装
  ROOF             // 屋根工事
  BATHROOM         // 浴室
  KITCHEN          // キッチン
  TOILET           // トイレ
  INTERIOR         // 内装
  FLOORING         // 床材
  WINDOW           // 窓・サッシ
  GARDEN           // 庭・外構
  OTHER            // その他
}

// 顧客
model User {
  id          String   @id @default(cuid())
  email       String?  @unique
  name        String
  phoneNumber String   @map("phone_number")
  address     String?

  createdAt   DateTime @default(now()) @map("created_at")

  inquiries   Inquiry[]

  @@map("users")
}

// 問い合わせ
model Inquiry {
  id             String   @id @default(cuid())
  userId         String?  @map("user_id")

  // 顧客情報（ゲストユーザー対応）
  name           String
  email          String
  phoneNumber    String   @map("phone_number")
  address        String

  // カート情報（JSON配列）
  serviceItems   Json     @map("service_items") // { serviceId, quantity, price }[]
  totalEstimate  Decimal  @map("total_estimate") @db.Decimal(12, 2)

  // メッセージ
  message        String?  @db.Text

  // ステータス
  status         InquiryStatus @default(NEW)

  // タイムスタンプ
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  // リレーション
  user           User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  contractors    InquiryContractor[]

  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@map("inquiries")
}

enum InquiryStatus {
  NEW          // 新規
  SENT         // 業者へ送信済み
  IN_PROGRESS  // 対応中
  COMPLETED    // 完了
  CANCELLED    // キャンセル
}

// 問い合わせ-業者の中間テーブル
model InquiryContractor {
  id            String   @id @default(cuid())
  inquiryId     String   @map("inquiry_id")
  contractorId  String   @map("contractor_id")

  // 対応状況
  sentAt        DateTime @default(now()) @map("sent_at")
  openedAt      DateTime? @map("opened_at")
  repliedAt     DateTime? @map("replied_at")
  status        ContractorReplyStatus @default(SENT)

  // メモ
  note          String?  @db.Text

  // リレーション
  inquiry       Inquiry     @relation(fields: [inquiryId], references: [id], onDelete: Cascade)
  contractor    Contractor  @relation(fields: [contractorId], references: [id], onDelete: Cascade)

  @@unique([inquiryId, contractorId])
  @@index([contractorId])
  @@map("inquiry_contractors")
}

enum ContractorReplyStatus {
  SENT       // 送信済み
  OPENED     // 開封済み
  REPLIED    // 返信済み
  DECLINED   // 辞退
}

// サブスクリプション
model Subscription {
  id                String   @id @default(cuid())
  contractorId      String   @map("contractor_id")

  // Stripe連携
  stripeCustomerId  String   @unique @map("stripe_customer_id")
  stripeSubscriptionId String @unique @map("stripe_subscription_id")
  stripePriceId     String   @map("stripe_price_id")

  // プラン
  planType          PlanType
  status            SubscriptionStatus @default(ACTIVE)

  // 期間
  currentPeriodStart DateTime @map("current_period_start")
  currentPeriodEnd   DateTime @map("current_period_end")

  // タイムスタンプ
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")
  canceledAt        DateTime? @map("canceled_at")

  // リレーション
  contractor        Contractor @relation(fields: [contractorId], references: [id], onDelete: Cascade)

  @@index([contractorId])
  @@map("subscriptions")
}

enum SubscriptionStatus {
  ACTIVE       // アクティブ
  PAST_DUE     // 支払い遅延
  CANCELED     // キャンセル済み
  UNPAID       // 未払い
}

// メール送信ログ
model EmailLog {
  id            String   @id @default(cuid())

  // 送信先
  recipientType RecipientType @map("recipient_type")
  recipientIds  String[] @map("recipient_ids") // contractor IDs

  // メール内容
  subject       String
  bodyHtml      String   @map("body_html") @db.Text
  bodyText      String   @map("body_text") @db.Text

  // 送信結果
  status        EmailStatus @default(PENDING)
  sentAt        DateTime? @map("sent_at")
  errorMessage  String?  @map("error_message") @db.Text

  // 開封トラッキング
  openCount     Int      @default(0) @map("open_count")

  createdAt     DateTime @default(now()) @map("created_at")

  @@index([status])
  @@index([createdAt])
  @@map("email_logs")
}

enum RecipientType {
  ALL_CONTRACTORS    // 全業者
  ACTIVE_ONLY        // アクティブ業者のみ
  PREMIUM_ONLY       // プレミアム業者のみ
  SELECTED           // 選択された業者
}

enum EmailStatus {
  PENDING    // 送信待ち
  SENDING    // 送信中
  SENT       // 送信完了
  FAILED     // 失敗
}

// 管理者
model Admin {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String   @map("password_hash")
  name          String
  role          AdminRole @default(EDITOR)

  isActive      Boolean  @default(true) @map("is_active")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  @@map("admins")
}

enum AdminRole {
  SUPER_ADMIN  // 全権限
  ADMIN        // 管理者
  EDITOR       // 編集者
}
```

---

## API設計

### tRPC Router構成

```typescript
// src/server/api/root.ts

import { createTRPCRouter } from './trpc';
import { contractorRouter } from './routers/contractor';
import { serviceRouter } from './routers/service';
import { inquiryRouter } from './routers/inquiry';
import { authRouter } from './routers/auth';
import { subscriptionRouter } from './routers/subscription';
import { instagramRouter } from './routers/instagram';
import { emailRouter } from './routers/email';
import { adminRouter } from './routers/admin';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  contractor: contractorRouter,
  service: serviceRouter,
  inquiry: inquiryRouter,
  subscription: subscriptionRouter,
  instagram: instagramRouter,
  email: emailRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
```

### 主要APIエンドポイント

#### 1. 認証 (authRouter)

```typescript
// src/server/api/routers/auth.ts

export const authRouter = createTRPCRouter({
  // 業者ログイン
  contractorLogin: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8),
    }))
    .mutation(async ({ input, ctx }) => {
      // 認証ロジック
    }),

  // 業者登録
  contractorRegister: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8),
      companyName: z.string().min(1),
      phoneNumber: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // 登録ロジック（管理者承認待ち）
    }),

  // 管理者ログイン
  adminLogin: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8),
    }))
    .mutation(async ({ input, ctx }) => {
      // 管理者認証
    }),
});
```

#### 2. 業者管理 (contractorRouter)

```typescript
// src/server/api/routers/contractor.ts

export const contractorRouter = createTRPCRouter({
  // 業者一覧取得（顧客向け）
  list: publicProcedure
    .input(z.object({
      category: z.nativeEnum(ServiceCategory).optional(),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      // ページネーション対応の業者一覧
    }),

  // 業者詳細
  getById: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      // 業者詳細 + サービス一覧
    }),

  // 業者プロフィール更新
  updateProfile: protectedProcedure
    .input(z.object({
      companyName: z.string().optional(),
      description: z.string().optional(),
      logoUrl: z.string().url().optional(),
      address: z.string().optional(),
      website: z.string().url().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // プロフィール更新
    }),
});
```

#### 3. サービス管理 (serviceRouter)

```typescript
// src/server/api/routers/service.ts

export const serviceRouter = createTRPCRouter({
  // サービス一覧（カテゴリ別）
  listByCategory: publicProcedure
    .input(z.object({
      category: z.nativeEnum(ServiceCategory),
      contractorId: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      // カテゴリ別サービス一覧
    }),

  // サービス作成
  create: protectedProcedure
    .input(z.object({
      category: z.nativeEnum(ServiceCategory),
      name: z.string().min(1),
      basePrice: z.number().positive(),
      unit: z.string(),
      description: z.string().optional(),
      imageUrl: z.string().url().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // サービス作成
    }),

  // サービス更新
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      basePrice: z.number().positive().optional(),
      description: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // サービス更新
    }),

  // サービス削除
  delete: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // 論理削除
    }),
});
```

#### 4. 問い合わせ管理 (inquiryRouter)

```typescript
// src/server/api/routers/inquiry.ts

export const inquiryRouter = createTRPCRouter({
  // 問い合わせ作成（顧客向け）
  create: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phoneNumber: z.string(),
      address: z.string(),
      serviceItems: z.array(z.object({
        serviceId: z.string(),
        quantity: z.number().positive(),
        price: z.number().positive(),
      })),
      totalEstimate: z.number().positive(),
      message: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // 問い合わせ作成 + 業者へメール送信
    }),

  // 業者の問い合わせ一覧
  listForContractor: protectedProcedure
    .input(z.object({
      status: z.nativeEnum(ContractorReplyStatus).optional(),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      // 業者向け問い合わせ一覧
    }),

  // 問い合わせ詳細
  getById: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      // 問い合わせ詳細
    }),

  // 開封ステータス更新
  markAsOpened: protectedProcedure
    .input(z.object({
      inquiryId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // 開封時刻を記録
    }),
});
```

#### 5. サブスクリプション (subscriptionRouter)

```typescript
// src/server/api/routers/subscription.ts

export const subscriptionRouter = createTRPCRouter({
  // サブスクリプション作成
  create: protectedProcedure
    .input(z.object({
      planType: z.enum(['BASIC', 'PREMIUM']),
    }))
    .mutation(async ({ input, ctx }) => {
      // Stripe Checkout Session作成
    }),

  // サブスクリプション状態取得
  getStatus: protectedProcedure
    .query(async ({ ctx }) => {
      // 現在のサブスクリプション状態
    }),

  // サブスクリプションキャンセル
  cancel: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Stripeでキャンセル処理
    }),

  // Stripe Webhook処理
  webhook: publicProcedure
    .input(z.any())
    .mutation(async ({ input, ctx }) => {
      // Stripe Webhookイベント処理
    }),
});
```

#### 6. Instagram連携 (instagramRouter)

```typescript
// src/server/api/routers/instagram.ts

export const instagramRouter = createTRPCRouter({
  // Instagram認証URL取得
  getAuthUrl: protectedProcedure
    .query(async ({ ctx }) => {
      // OAuth認証URL生成
    }),

  // OAuth コールバック処理
  handleCallback: protectedProcedure
    .input(z.object({
      code: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // アクセストークン取得 + DB保存
    }),

  // Instagram投稿取得
  getPosts: publicProcedure
    .input(z.object({
      contractorId: z.string(),
      limit: z.number().min(1).max(25).default(12),
    }))
    .query(async ({ input, ctx }) => {
      // Instagram Graph APIから投稿取得
    }),

  // 連携解除
  disconnect: protectedProcedure
    .mutation(async ({ ctx }) => {
      // トークン削除
    }),
});
```

#### 7. メール送信 (emailRouter)

```typescript
// src/server/api/routers/email.ts

export const emailRouter = createTRPCRouter({
  // 一斉送信
  sendBulk: adminProcedure
    .input(z.object({
      recipientType: z.nativeEnum(RecipientType),
      recipientIds: z.array(z.string()).optional(),
      subject: z.string().min(1),
      bodyHtml: z.string(),
      bodyText: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // SendGrid/SESで一斉送信
    }),

  // 送信履歴
  listLogs: adminProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      // メール送信ログ一覧
    }),
});
```

---

## フロントエンド設計

### ディレクトリ構成

```
src/
├── app/                          # Next.js App Router
│   ├── (public)/                # 顧客向けページ
│   │   ├── page.tsx             # トップページ
│   │   ├── contractors/         # 業者一覧・詳細
│   │   ├── services/            # サービス一覧
│   │   ├── cart/                # カート
│   │   └── inquiry/             # 問い合わせフォーム
│   ├── (contractor)/            # 業者向けダッシュボード
│   │   ├── dashboard/
│   │   ├── inquiries/
│   │   ├── services/
│   │   ├── instagram/
│   │   └── settings/
│   ├── (admin)/                 # 管理者画面
│   │   ├── dashboard/
│   │   ├── contractors/
│   │   ├── inquiries/
│   │   └── emails/
│   └── api/                     # API Routes (tRPC)
│       └── trpc/
├── components/                   # 共通コンポーネント
│   ├── ui/                      # shadcn/ui コンポーネント
│   ├── layout/                  # レイアウト
│   ├── forms/                   # フォーム
│   └── features/                # 機能別コンポーネント
│       ├── cart/
│       ├── inquiry/
│       ├── instagram/
│       └── contractor/
├── lib/                         # ユーティリティ
│   ├── api/                     # API クライアント
│   ├── hooks/                   # カスタムフック
│   ├── utils/                   # ヘルパー関数
│   └── validations/             # Zodスキーマ
├── server/                      # サーバーサイド
│   ├── api/                     # tRPC routers
│   ├── db/                      # Prisma client
│   └── services/                # ビジネスロジック
├── stores/                      # Zustand stores
│   ├── cartStore.ts
│   ├── authStore.ts
│   └── inquiryStore.ts
└── types/                       # TypeScript型定義
```

### 主要画面設計

#### 1. 顧客向けWebサイト

**トップページ (`/`)**
- ヒーローセクション
- カテゴリ別サービス一覧
- おすすめ業者
- 料金シミュレーター

**業者一覧 (`/contractors`)**
- カテゴリフィルター
- エリアフィルター
- 価格順・評価順ソート
- Instagram投稿プレビュー

**業者詳細 (`/contractors/[id]`)**
- 会社情報
- サービス一覧（価格表示）
- Instagram投稿一覧（12件表示）
- カートへ追加ボタン

**カート (`/cart`)**
- 選択サービス一覧
- 概算合計金額表示
- 数量変更
- 問い合わせ確認

**問い合わせフォーム (`/inquiry`)**
- 顧客情報入力
- カート内容確認
- 追加メッセージ
- 一括送信

#### 2. 業者向け管理画面

**ダッシュボード (`/dashboard`)**
- 問い合わせ件数（新規/対応中）
- 売上統計
- 最近の問い合わせ
- サブスクリプション状態

**問い合わせ管理 (`/dashboard/inquiries`)**
- 一覧（ステータスフィルター）
- 詳細表示
- 返信機能
- 辞退機能

**サービス管理 (`/dashboard/services`)**
- サービス一覧
- 新規作成
- 編集・削除
- 価格設定

**Instagram連携 (`/dashboard/instagram`)**
- 連携ステータス
- 連携・解除ボタン
- プレビュー表示

**設定 (`/dashboard/settings`)**
- プロフィール編集
- サブスクリプション管理
- パスワード変更

#### 3. 管理者画面

**業者管理 (`/admin/contractors`)**
- 業者一覧
- 承認・停止・削除
- サブスクリプション状態確認

**メール送信 (`/admin/emails`)**
- 送信先選択（全業者/アクティブのみ等）
- メール作成（WYSIWYG エディタ）
- プレビュー
- 送信履歴

---

## バックエンド設計

### レイヤーアーキテクチャ

```
API Layer (tRPC Routers)
       ↓
Service Layer (Business Logic)
       ↓
Repository Layer (Prisma Client)
       ↓
Database (PostgreSQL)
```

### サービス層の例

```typescript
// src/server/services/inquiryService.ts

import { prisma } from '../db';
import { emailService } from './emailService';
import type { CreateInquiryInput } from '@/lib/validations/inquiry';

export class InquiryService {
  async createInquiry(data: CreateInquiryInput) {
    // トランザクション内で処理
    return await prisma.$transaction(async (tx) => {
      // 1. 問い合わせ作成
      const inquiry = await tx.inquiry.create({
        data: {
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber,
          address: data.address,
          serviceItems: data.serviceItems,
          totalEstimate: data.totalEstimate,
          message: data.message,
          status: 'NEW',
        },
      });

      // 2. 関連業者を特定
      const contractorIds = await this.getRelatedContractors(
        data.serviceItems
      );

      // 3. InquiryContractor レコード作成
      await tx.inquiryContractor.createMany({
        data: contractorIds.map((contractorId) => ({
          inquiryId: inquiry.id,
          contractorId,
          status: 'SENT',
        })),
      });

      // 4. 業者へメール送信（非同期）
      await this.sendInquiryEmails(inquiry.id, contractorIds);

      return inquiry;
    });
  }

  private async getRelatedContractors(
    serviceItems: Array<{ serviceId: string }>
  ): Promise<string[]> {
    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceItems.map((item) => item.serviceId) },
      },
      select: { contractorId: true },
    });

    return [...new Set(services.map((s) => s.contractorId))];
  }

  private async sendInquiryEmails(
    inquiryId: string,
    contractorIds: string[]
  ) {
    const contractors = await prisma.contractor.findMany({
      where: { id: { in: contractorIds } },
      select: { id: true, email: true, companyName: true },
    });

    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
    });

    for (const contractor of contractors) {
      await emailService.sendInquiryNotification({
        to: contractor.email,
        contractorName: contractor.companyName,
        inquiry: inquiry!,
      });
    }
  }
}

export const inquiryService = new InquiryService();
```

### Instagram連携サービス

```typescript
// src/server/services/instagramService.ts

import axios from 'axios';
import { prisma } from '../db';

export class InstagramService {
  private readonly clientId = process.env.INSTAGRAM_CLIENT_ID!;
  private readonly clientSecret = process.env.INSTAGRAM_CLIENT_SECRET!;
  private readonly redirectUri = process.env.INSTAGRAM_REDIRECT_URI!;

  getAuthUrl(contractorId: string): string {
    const state = Buffer.from(contractorId).toString('base64');
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'user_profile,user_media',
      response_type: 'code',
      state,
    });

    return `https://api.instagram.com/oauth/authorize?${params}`;
  }

  async handleCallback(code: string, contractorId: string) {
    // 1. アクセストークン取得
    const tokenResponse = await axios.post(
      'https://api.instagram.com/oauth/access_token',
      {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
        code,
      }
    );

    const { access_token, user_id } = tokenResponse.data;

    // 2. 長期トークンに交換
    const longLivedTokenResponse = await axios.get(
      'https://graph.instagram.com/access_token',
      {
        params: {
          grant_type: 'ig_exchange_token',
          client_secret: this.clientSecret,
          access_token,
        },
      }
    );

    const longLivedToken = longLivedTokenResponse.data.access_token;

    // 3. ユーザー情報取得
    const userResponse = await axios.get(
      `https://graph.instagram.com/${user_id}`,
      {
        params: {
          fields: 'username',
          access_token: longLivedToken,
        },
      }
    );

    // 4. DB保存
    await prisma.contractor.update({
      where: { id: contractorId },
      data: {
        instagramToken: longLivedToken,
        instagramUserId: user_id,
        instagramUsername: userResponse.data.username,
      },
    });
  }

  async getPosts(contractorId: string, limit: number = 12) {
    const contractor = await prisma.contractor.findUnique({
      where: { id: contractorId },
      select: {
        instagramToken: true,
        instagramUserId: true,
      },
    });

    if (!contractor?.instagramToken || !contractor?.instagramUserId) {
      throw new Error('Instagram not connected');
    }

    const response = await axios.get(
      `https://graph.instagram.com/${contractor.instagramUserId}/media`,
      {
        params: {
          fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
          access_token: contractor.instagramToken,
          limit,
        },
      }
    );

    return response.data.data;
  }
}

export const instagramService = new InstagramService();
```

---

## セキュリティ設計

### 1. 認証・認可

**NextAuth.js設定**

```typescript
// src/server/auth.ts

import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './db';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Contractor',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const contractor = await prisma.contractor.findUnique({
          where: { email: credentials.email },
        });

        if (!contractor) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          contractor.passwordHash
        );

        if (!isValid) {
          return null;
        }

        if (contractor.status !== 'ACTIVE') {
          throw new Error('Account not active');
        }

        return {
          id: contractor.id,
          email: contractor.email,
          name: contractor.companyName,
          role: 'contractor',
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
```

**tRPC Middleware**

```typescript
// src/server/api/trpc.ts

import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth';

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const session = await getServerSession(authOptions);

  return {
    session,
    prisma,
  };
};

// 認証済みユーザーのみ
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      session: ctx.session,
    },
  });
});

// 管理者のみ
export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (ctx.session?.user?.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }

  return next({ ctx });
});
```

### 2. データバリデーション

**Zodスキーマ**

```typescript
// src/lib/validations/inquiry.ts

import { z } from 'zod';

export const createInquirySchema = z.object({
  name: z.string().min(1, '名前を入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  phoneNumber: z.string().regex(/^[0-9-]+$/, '有効な電話番号を入力してください'),
  address: z.string().min(1, '住所を入力してください'),
  serviceItems: z
    .array(
      z.object({
        serviceId: z.string(),
        quantity: z.number().positive(),
        price: z.number().positive(),
      })
    )
    .min(1, 'サービスを選択してください'),
  totalEstimate: z.number().positive(),
  message: z.string().optional(),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
```

### 3. レート制限

**Redis + Upstash Ratelimit**

```typescript
// src/lib/ratelimit.ts

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});

// API Routeでの使用例
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response('Too Many Requests', { status: 429 });
  }

  // 処理続行
}
```

### 4. CSRF対策

Next.jsのAPI Routesは自動的にCSRF保護を提供します。
追加で`next-csrf`を使用することも可能。

### 5. XSS対策

- React/Next.jsのデフォルトエスケープ
- DOMPurifyでユーザー入力のサニタイズ
- Content Security Policy (CSP) ヘッダー設定

```typescript
// next.config.js

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### 6. 環境変数管理

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/reform_platform"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://yourdomain.com"

# Stripe
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"
STRIPE_PUBLISHABLE_KEY="pk_test_xxx"

# Instagram
INSTAGRAM_CLIENT_ID="xxx"
INSTAGRAM_CLIENT_SECRET="xxx"
INSTAGRAM_REDIRECT_URI="https://yourdomain.com/api/instagram/callback"

# SendGrid
SENDGRID_API_KEY="SG.xxx"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"

# AWS S3
AWS_REGION="ap-northeast-1"
AWS_ACCESS_KEY_ID="xxx"
AWS_SECRET_ACCESS_KEY="xxx"
AWS_S3_BUCKET="reform-platform-images"

# Redis
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxx"
```

---

## スケーラビリティ対策

### 1. データベース最適化

**インデックス戦略**

```sql
-- 頻繁に検索されるカラムにインデックス
CREATE INDEX idx_contractors_status ON contractors(status, is_active);
CREATE INDEX idx_services_category ON services(category, is_active);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);
CREATE INDEX idx_inquiry_contractors_status ON inquiry_contractors(contractor_id, status);

-- 複合インデックス
CREATE INDEX idx_services_contractor_category ON services(contractor_id, category, is_active);
```

**接続プーリング**

```typescript
// src/server/db.ts

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**読み取り専用レプリカ（将来対応）**

```typescript
// Prismaで読み取り専用レプリカを使用
const prismaRead = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_REPLICA_URL,
    },
  },
});
```

### 2. キャッシュ戦略

**Redis キャッシュレイヤー**

```typescript
// src/lib/cache.ts

import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  // キャッシュチェック
  const cached = await redis.get<T>(key);
  if (cached) {
    return cached;
  }

  // キャッシュミス時はデータ取得
  const data = await fetcher();

  // キャッシュに保存
  await redis.set(key, JSON.stringify(data), { ex: ttl });

  return data;
}

// 使用例
const contractors = await getCached(
  'contractors:active',
  async () => {
    return await prisma.contractor.findMany({
      where: { status: 'ACTIVE' },
    });
  },
  600 // 10分間キャッシュ
);
```

**Next.js ISR (Incremental Static Regeneration)**

```typescript
// app/(public)/contractors/page.tsx

export const revalidate = 600; // 10分ごとに再生成

export default async function ContractorsPage() {
  const contractors = await prisma.contractor.findMany({
    where: { status: 'ACTIVE' },
  });

  return <ContractorsList contractors={contractors} />;
}
```

### 3. CDN活用

**静的アセット配信**

- CloudFront経由でS3の画像配信
- Next.js静的ファイルもCDN配信
- 画像最適化（next/image自動最適化）

**画像最適化設定**

```typescript
// next.config.js

module.exports = {
  images: {
    domains: ['reform-platform-images.s3.ap-northeast-1.amazonaws.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
};
```

### 4. 非同期処理

**バックグラウンドジョブ（BullMQ + Redis）**

```typescript
// src/lib/queues/emailQueue.ts

import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';

const connection = new Redis(process.env.REDIS_URL!);

export const emailQueue = new Queue('email', { connection });

// ワーカー
const emailWorker = new Worker(
  'email',
  async (job) => {
    const { to, subject, html } = job.data;
    await sendEmail({ to, subject, html });
  },
  { connection }
);

// ジョブ追加
await emailQueue.add('send-inquiry-notification', {
  to: 'contractor@example.com',
  subject: '新しい問い合わせがあります',
  html: '<p>...</p>',
});
```

### 5. 水平スケーリング

**ステートレス設計**

- セッションはJWT/Redis管理
- ファイルアップロードはS3直接
- アプリケーションサーバーは複数台構成可能

**ロードバランサー**

```
                    ┌─────────────┐
                    │ CloudFlare  │
                    │ (WAF/DDoS)  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   ALB/ELB   │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │  Vercel     │ │  Vercel     │ │  Vercel     │
    │  Instance 1 │ │  Instance 2 │ │  Instance 3 │
    └─────────────┘ └─────────────┘ └─────────────┘
```

### 6. モニタリング・アラート

**DatadogでAPM**

```typescript
// src/lib/monitoring.ts

import { tracer } from 'dd-trace';

tracer.init({
  service: 'reform-platform',
  env: process.env.NODE_ENV,
  version: process.env.APP_VERSION,
});

// カスタムメトリクス
export function trackInquiry(totalEstimate: number) {
  tracer.dogstatsd.increment('inquiry.created');
  tracer.dogstatsd.histogram('inquiry.estimate', totalEstimate);
}
```

**Sentryでエラー追跡**

```typescript
// src/lib/sentry.ts

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

---

## インフラストラクチャ

### AWS構成図

```
┌─────────────────────────────────────────────────────────────┐
│                        AWS Cloud                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ CloudFront (CDN)                                     │  │
│  │ - 画像配信                                           │  │
│  │ - 静的ファイル配信                                   │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      │                                      │
│  ┌───────────────────▼──────────────────────────────────┐  │
│  │ S3 Bucket                                            │  │
│  │ - 業者ロゴ                                           │  │
│  │ - Instagram画像キャッシュ                            │  │
│  │ - サービス画像                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ RDS PostgreSQL (Multi-AZ)                            │  │
│  │ - メインDB                                           │  │
│  │ - 自動バックアップ (7日間)                           │  │
│  │ - リードレプリカ (オプション)                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ElastiCache (Redis)                                  │  │
│  │ - セッション管理                                     │  │
│  │ - APIレスポンスキャッシュ                            │  │
│  │ - レート制限                                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ SES (Simple Email Service)                           │  │
│  │ - メール一斉送信                                     │  │
│  │ - 問い合わせ通知                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      Vercel Platform                         │
├─────────────────────────────────────────────────────────────┤
│  - Next.js Hosting                                           │
│  - 自動デプロイ (GitHub連携)                                 │
│  - Serverless Functions                                      │
│  - Edge Network                                              │
└─────────────────────────────────────────────────────────────┘
```

### 環境構成

| 環境 | 用途 | ホスティング |
|------|------|--------------|
| **Production** | 本番環境 | Vercel (Production) + AWS |
| **Staging** | ステージング | Vercel (Preview) + AWS |
| **Development** | 開発環境 | ローカル + Docker |

### Docker開発環境

```yaml
# docker-compose.yml

version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: reform
      POSTGRES_PASSWORD: password
      POSTGRES_DB: reform_platform
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

  mailhog:
    image: mailhog/mailhog
    ports:
      - '1025:1025'
      - '8025:8025'

volumes:
  postgres_data:
```

### CI/CD パイプライン

```yaml
# .github/workflows/ci.yml

name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run typecheck

      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Build
        run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 開発・運用フロー

### 開発フロー

```
1. Issue作成 (GitHub Issues)
   ↓
2. Feature Branchで開発
   ↓
3. Pull Request作成
   ↓
4. CI実行 (Lint/Test/Build)
   ↓
5. コードレビュー
   ↓
6. mainへマージ
   ↓
7. 自動デプロイ (Vercel)
```

### デプロイ戦略

**Preview環境**
- 全PRに対してPreview URLを自動生成
- 機能確認・QA実施

**Production環境**
- mainブランチへのマージで自動デプロイ
- Vercel Rollback機能で即座にロールバック可能

### データベースマイグレーション

```bash
# 開発環境
npx prisma migrate dev --name add_instagram_fields

# 本番環境
npx prisma migrate deploy
```

### 監視・アラート設定

**Datadog アラート例**

- エラー率が5%超過時
- レスポンスタイムが500ms超過時
- データベース接続エラー発生時
- Stripe決済失敗時

**Sentry アラート**

- 重大なエラー発生時（FATAL/ERROR）
- 新しいエラータイプ検出時

### バックアップ戦略

**データベース**
- AWS RDS自動バックアップ（毎日）
- 7日間保持
- スナップショット（週次）

**ファイル**
- S3バケットのバージョニング有効化
- ライフサイクルポリシーで古いバージョン削除

---

## コスト試算

### 月額コスト見積もり（300社フル稼働時）

| サービス | 用途 | 月額費用 |
|---------|------|----------|
| Vercel Pro | Next.js Hosting | $20 |
| AWS RDS (db.t3.medium) | PostgreSQL | $60 |
| AWS ElastiCache (cache.t3.micro) | Redis | $15 |
| AWS S3 + CloudFront | 画像ストレージ・配信 | $30 |
| AWS SES | メール送信 (10,000通/月) | $1 |
| Stripe | 決済手数料 (300社×¥100,000) | ¥900,000 × 3.6% = ¥32,400 |
| Datadog | APM・監視 | $15 |
| Sentry | エラートラッキング | $26 |
| **合計（USD）** | | **$167** |
| **合計（円換算 150円/USD）** | | **約25,000円** |

**売上試算**
- 月額課金: 300社 × ¥100,000 = ¥30,000,000
- Stripe手数料: ¥30,000,000 × 3.6% = ¥1,080,000
- **純売上: ¥28,920,000**
- **インフラコスト: ¥25,000**
- **粗利: ¥28,895,000 (99.9%)**

---

## まとめ

本アーキテクチャ設計は、以下の特徴を持ちます:

### 技術的優位性

1. **型安全性**: TypeScript + tRPC + Prismaでend-to-endの型安全性
2. **開発速度**: Next.js + shadcn/ui + Prismaで迅速な開発
3. **スケーラビリティ**: Redis キャッシュ + CDN + 水平スケーリング
4. **セキュリティ**: NextAuth.js + Zod + レート制限 + CSP
5. **運用性**: Vercel自動デプロイ + Datadog監視 + Sentry

### ビジネス的優位性

1. **低コスト**: 月額2.5万円で300社対応可能
2. **高可用性**: AWS Multi-AZ + Vercel Edge Network
3. **拡張性**: 業者数増加に柔軟対応
4. **保守性**: モダンな技術スタックで長期運用可能

### 次のステップ

1. **MVP開発**: 顧客向けWebサイト + 業者管理画面の基本機能
2. **Instagram連携**: OAuth認証 + Graph API統合
3. **決済システム**: Stripe Checkout + Webhook処理
4. **管理者画面**: 業者管理 + メール一斉送信
5. **本番デプロイ**: AWS環境構築 + Vercel連携

このアーキテクチャを基に、段階的に開発を進めることで、スケーラブルで保守性の高いプラットフォームを構築できます。
