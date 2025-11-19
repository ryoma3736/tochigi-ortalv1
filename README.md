# Tochigi Portal v1 - Reform Business Platform

リフォーム業者向け総合プラットフォーム - Next.js + Express + TypeScript

## プロジェクト概要

このプロジェクトは、リフォーム業者向けのオールインワンプラットフォームです。顧客管理、プロジェクト管理、決済処理、Instagram連携などの機能を提供します。

## 技術スタック

### フロントエンド
- **Next.js 14** - React フレームワーク
- **TypeScript** - 型安全な開発
- **Tailwind CSS** - ユーティリティファーストCSS
- **React Query** - データフェッチング & キャッシング
- **React Hook Form** - フォーム管理
- **Zod** - バリデーション

### バックエンド
- **Node.js + Express** - REST API サーバー
- **TypeScript** - 型安全な開発
- **Prisma** - ORM（PostgreSQL）
- **JWT** - 認証
- **Stripe** - 決済処理
- **Nodemailer** - メール送信
- **Instagram Graph API** - Instagram連携

### インフラ
- **PostgreSQL** - メインデータベース
- **Docker** - コンテナ化（開発環境）

## プロジェクト構造

```
tochigi-ortalv1/
├── frontend/                 # Next.js フロントエンド
│   ├── src/
│   │   ├── app/             # Next.js App Router
│   │   ├── components/      # Reactコンポーネント
│   │   └── lib/             # ユーティリティ & API
│   ├── public/              # 静的ファイル
│   └── package.json
│
├── backend/                  # Express バックエンド
│   ├── src/
│   │   ├── controllers/     # ルートハンドラ
│   │   ├── middleware/      # カスタムミドルウェア
│   │   ├── models/          # データモデル
│   │   ├── routes/          # APIルート
│   │   ├── types/           # TypeScript型定義
│   │   └── utils/           # ユーティリティ
│   ├── logs/                # ログファイル
│   └── package.json
│
├── prisma/                   # Prismaスキーマ & マイグレーション
│   └── schema.prisma        # データベーススキーマ
│
├── .env.example             # 環境変数テンプレート
└── package.json             # ルートワークスペース
```

## セットアップ

### 前提条件

- Node.js 20.x以上
- PostgreSQL 14以上
- npm または yarn

### インストール手順

1. **リポジトリをクローン**

```bash
git clone <repository-url>
cd tochigi-ortalv1
```

2. **環境変数を設定**

```bash
cp .env.example .env
# .envファイルを編集して必要な値を設定
```

3. **依存関係をインストール**

```bash
npm install
```

4. **データベースをセットアップ**

```bash
# Prismaマイグレーションを実行
npm run prisma:migrate

# Prisma Clientを生成
npm run prisma:generate
```

5. **開発サーバーを起動**

```bash
# フロントエンドとバックエンドを同時に起動
npm run dev

# または個別に起動
npm run dev:frontend  # http://localhost:3000
npm run dev:backend   # http://localhost:3001
```

## 利用可能なスクリプト

### ルートワークスペース

```bash
npm run dev              # 全サービス開発モード起動
npm run build            # 全サービスをビルド
npm run start            # 全サービスを本番モード起動
npm run lint             # 全サービスでリント実行
npm run typecheck        # 全サービスで型チェック
npm run test             # 全サービスでテスト実行
npm run format           # コードフォーマット（Prettier）
```

### Prisma

```bash
npm run prisma:generate  # Prisma Clientを生成
npm run prisma:migrate   # マイグレーション実行
npm run prisma:studio    # Prisma Studio起動
npm run prisma:seed      # シードデータ投入
npm run prisma:reset     # データベースリセット
```

### フロントエンド（frontend/）

```bash
npm run dev              # 開発サーバー起動
npm run build            # 本番ビルド
npm run start            # 本番サーバー起動
npm run lint             # ESLint実行
npm run typecheck        # TypeScript型チェック
```

### バックエンド（backend/）

```bash
npm run dev              # 開発サーバー起動（ホットリロード）
npm run build            # TypeScriptコンパイル
npm run start            # 本番サーバー起動
npm run lint             # ESLint実行
npm run typecheck        # TypeScript型チェック
npm run test             # テスト実行
```

## 環境変数

`.env.example`を参照して、以下の環境変数を設定してください：

### 必須
- `DATABASE_URL` - PostgreSQL接続文字列
- `JWT_SECRET` - JWT署名用シークレット
- `STRIPE_SECRET_KEY` - Stripe APIキー
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe公開キー

### オプション
- `INSTAGRAM_CLIENT_ID` - Instagram API認証
- `INSTAGRAM_CLIENT_SECRET` - Instagram API認証
- `SMTP_*` - メール送信設定

## API エンドポイント

### 認証
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/login` - ログイン
- `POST /api/auth/logout` - ログアウト
- `POST /api/auth/forgot-password` - パスワードリセット

### ビジネス管理
- `GET /api/business` - 事業者一覧取得
- `POST /api/business` - 事業者作成
- `GET /api/business/:id` - 事業者詳細取得
- `PUT /api/business/:id` - 事業者更新
- `DELETE /api/business/:id` - 事業者削除

### プロジェクト管理
- `GET /api/projects` - プロジェクト一覧取得
- `POST /api/projects` - プロジェクト作成
- `GET /api/projects/:id` - プロジェクト詳細取得
- `PUT /api/projects/:id` - プロジェクト更新
- `DELETE /api/projects/:id` - プロジェクト削除

### 決済
- `POST /api/payments/create-intent` - 決済Intent作成
- `POST /api/payments/confirm` - 決済確認
- `GET /api/payments/history` - 決済履歴取得
- `POST /api/payments/webhook` - Stripe Webhook

### Instagram連携
- `GET /api/instagram/auth` - 認証URL取得
- `POST /api/instagram/callback` - 認証コールバック
- `GET /api/instagram/posts` - 投稿一覧取得
- `POST /api/instagram/posts` - 投稿作成

## データベーススキーマ

主要なモデル：

- **User** - ユーザー（顧客）
- **Company** - リフォーム業者
- **Service** - リフォームサービス
- **Inquiry** - 問い合わせ
- **Subscription** - サブスクリプション
- **Payment** - 決済履歴
- **InstagramPost** - Instagram投稿

詳細は `prisma/schema.prisma` を参照してください。

## 開発ガイドライン

### コーディング規約

- **TypeScript Strict Mode**を有効化
- ESLintとPrettierでコード品質を維持
- コミット前に`npm run lint`と`npm run typecheck`を実行

### ブランチ戦略

- `main` - 本番環境
- `develop` - 開発環境
- `feature/*` - 新機能開発
- `fix/*` - バグ修正

### コミットメッセージ

```
<type>: <subject>

<body>
```

Type: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## デプロイ

### Vercel（フロントエンド）

```bash
cd frontend
vercel --prod
```

### Railway/Heroku（バックエンド）

```bash
cd backend
# プラットフォーム固有のデプロイコマンド
```

## トラブルシューティング

### データベース接続エラー

```bash
# PostgreSQLが起動しているか確認
psql -U postgres

# DATABASE_URLが正しいか確認
echo $DATABASE_URL
```

### ポート競合

デフォルトポート:
- フロントエンド: 3000
- バックエンド: 3001

変更する場合は`.env`で設定してください。

## ライセンス

MIT

## サポート

問題が発生した場合は、GitHubのIssuesで報告してください。

---

Built with ❤️ using Next.js, Express, and TypeScript
