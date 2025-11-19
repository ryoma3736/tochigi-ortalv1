# Database Schema Documentation

## Overview

This document describes the database schema for the Tochigi Ortal reform business platform.

## Models

### User (お客様)

Represents customers who inquire about reform services.

| Field     | Type     | Description                |
|-----------|----------|----------------------------|
| id        | String   | Unique identifier (CUID)   |
| name      | String   | Customer name              |
| email     | String   | Email address (unique)     |
| phone     | String?  | Phone number (optional)    |
| createdAt | DateTime | Record creation timestamp  |
| updatedAt | DateTime | Record update timestamp    |

**Relations:**
- `inquiries`: One-to-many relationship with Inquiry model

### Company (業者)

Represents reform companies/contractors on the platform.

| Field              | Type     | Description                          |
|--------------------|----------|--------------------------------------|
| id                 | String   | Unique identifier (CUID)             |
| name               | String   | Company name                         |
| email              | String   | Email address (unique)               |
| phone              | String?  | Phone number (optional)              |
| instagramHandle    | String?  | Instagram handle (unique, optional)  |
| subscriptionStatus | String   | Status: active/inactive/trial        |
| maxSlots           | Int      | Maximum inquiry slots (default: 300) |
| createdAt          | DateTime | Record creation timestamp            |
| updatedAt          | DateTime | Record update timestamp              |

**Relations:**
- `subscriptions`: One-to-many relationship with Subscription model
- `instagramPosts`: One-to-many relationship with InstagramPost model
- `selectedInquiries`: Many-to-many relationship with Inquiry model

### Service (リフォームサービス)

Represents different types of reform services offered.

| Field          | Type     | Description                  |
|----------------|----------|------------------------------|
| id             | String   | Unique identifier (CUID)     |
| name           | String   | Service name                 |
| description    | String?  | Service description          |
| estimatedPrice | Int?     | Estimated price (optional)   |
| category       | String   | Category (kitchen, bathroom, etc.) |
| createdAt      | DateTime | Record creation timestamp    |
| updatedAt      | DateTime | Record update timestamp      |

**Categories:**
- kitchen (キッチン)
- bathroom (バスルーム)
- living (リビング)
- exterior (外装)
- etc.

**Relations:**
- `inquiries`: Many-to-many relationship with Inquiry model

### Inquiry (問い合わせ)

Represents customer inquiries for reform services.

| Field             | Type       | Description                         |
|-------------------|------------|-------------------------------------|
| id                | String     | Unique identifier (CUID)            |
| userId            | String     | Foreign key to User                 |
| message           | String?    | Inquiry message (optional)          |
| status            | String     | Status: pending/processing/completed/cancelled |
| createdAt         | DateTime   | Record creation timestamp           |
| updatedAt         | DateTime   | Record update timestamp             |

**Relations:**
- `user`: Many-to-one relationship with User model
- `services`: Many-to-many relationship with Service model
- `selectedCompanies`: Many-to-many relationship with Company model

### Subscription (サブスクリプション)

Represents company subscription plans.

| Field     | Type      | Description                       |
|-----------|-----------|-----------------------------------|
| id        | String    | Unique identifier (CUID)          |
| companyId | String    | Foreign key to Company            |
| plan      | String    | Plan: basic/premium/enterprise    |
| price     | Int       | Monthly price in JPY (¥100,000)   |
| status    | String    | Status: active/cancelled/expired  |
| startDate | DateTime  | Subscription start date           |
| endDate   | DateTime? | Subscription end date (optional)  |
| createdAt | DateTime  | Record creation timestamp         |
| updatedAt | DateTime  | Record update timestamp           |

**Plans:**
- basic: ¥100,000/month
- premium: Custom pricing
- enterprise: Custom pricing

**Relations:**
- `company`: Many-to-one relationship with Company model

### InstagramPost (Instagram投稿キャッシュ)

Caches Instagram posts from companies for display.

| Field     | Type     | Description                    |
|-----------|----------|--------------------------------|
| id        | String   | Unique identifier (CUID)       |
| companyId | String   | Foreign key to Company         |
| postUrl   | String   | Instagram post URL (unique)    |
| imageUrl  | String?  | Image URL (optional)           |
| caption   | String?  | Post caption (optional)        |
| postedAt  | DateTime | Original post date             |
| createdAt | DateTime | Cache creation timestamp       |
| updatedAt | DateTime | Cache update timestamp         |

**Relations:**
- `company`: Many-to-one relationship with Company model

## Database Setup

### Prerequisites

- PostgreSQL 12+ installed and running
- Node.js 18+ and npm installed

### Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/tochigi_ortalv1?schema=public
   ```

### Migration Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create and apply a new migration
npm run prisma:migrate

# Open Prisma Studio (GUI for database)
npm run prisma:studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Apply migrations in production
npx prisma migrate deploy
```

## Usage Example

```typescript
import { prisma } from './src/lib/prisma';

// Create a new user
const user = await prisma.user.create({
  data: {
    name: 'Taro Yamada',
    email: 'taro@example.com',
    phone: '090-1234-5678',
  },
});

// Create an inquiry with services
const inquiry = await prisma.inquiry.create({
  data: {
    userId: user.id,
    message: 'キッチンのリフォームをお願いしたいです',
    status: 'pending',
    services: {
      connect: [{ id: 'kitchen-service-id' }],
    },
    selectedCompanies: {
      connect: [{ id: 'company-id-1' }, { id: 'company-id-2' }],
    },
  },
  include: {
    services: true,
    selectedCompanies: true,
  },
});

// Query with relations
const companies = await prisma.company.findMany({
  where: {
    subscriptionStatus: 'active',
  },
  include: {
    subscriptions: true,
    instagramPosts: {
      orderBy: { postedAt: 'desc' },
      take: 10,
    },
  },
});
```

## Index Strategy

The schema includes strategic indexes for common query patterns:

- User: `email`
- Company: `email`, `instagramHandle`, `subscriptionStatus`
- Service: `category`
- Inquiry: `userId`, `status`, `createdAt`
- Subscription: `companyId`, `status`, `endDate`
- InstagramPost: `companyId`, `postedAt`

## Security Considerations

1. **Cascade Deletes**:
   - Deleting a User will cascade delete all their Inquiries
   - Deleting a Company will cascade delete Subscriptions and InstagramPosts

2. **Unique Constraints**:
   - User email must be unique
   - Company email must be unique
   - Company Instagram handle must be unique
   - Instagram post URL must be unique

3. **Data Validation**:
   - Implement application-level validation for:
     - Email format
     - Phone number format
     - Price ranges
     - Status values

## Future Enhancements

- Add `Review` model for customer reviews
- Add `Payment` model for transaction tracking
- Add `Message` model for in-app messaging
- Add `Notification` model for user notifications
- Add audit logging for sensitive operations
