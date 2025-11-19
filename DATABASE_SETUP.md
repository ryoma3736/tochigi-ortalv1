# Database Setup Guide

## Overview

This guide walks you through setting up the PostgreSQL database for the Tochigi Ortal reform business platform.

## Prerequisites

1. **PostgreSQL 12+** installed and running
   - macOS: `brew install postgresql@16 && brew services start postgresql@16`
   - Linux: `sudo apt install postgresql postgresql-contrib`
   - Windows: Download from https://www.postgresql.org/download/

2. **Node.js 18+** and npm installed

## Step-by-Step Setup

### 1. Create Database

Open PostgreSQL command line:

```bash
psql postgres
```

Create a new database and user:

```sql
-- Create database
CREATE DATABASE tochigi_ortalv1;

-- Create user (if not exists)
CREATE USER tochigi_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE tochigi_ortalv1 TO tochigi_user;

-- Grant schema privileges (PostgreSQL 15+)
\c tochigi_ortalv1
GRANT ALL ON SCHEMA public TO tochigi_user;

-- Exit
\q
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Update the `DATABASE_URL` in `.env`:

```env
DATABASE_URL=postgresql://tochigi_user:your_secure_password@localhost:5432/tochigi_ortalv1?schema=public
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Generate Prisma Client

Generate the Prisma Client based on your schema:

```bash
npm run prisma:generate
```

### 5. Create Migration

Create the initial migration to set up your database schema:

```bash
npm run prisma:migrate
```

When prompted, enter a migration name (e.g., "init" or "initial_setup").

This will:
- Create a new migration file in `prisma/migrations/`
- Apply the migration to your database
- Create all tables, indexes, and relationships

### 6. Seed the Database (Optional)

Populate the database with sample data for development:

```bash
npm run prisma:seed
```

This will create:
- 5 reform services (kitchen, bathroom, living, exterior)
- 3 companies with subscriptions
- 3 Instagram posts
- 3 users (2 customers + 1 admin)
- 2 sample inquiries
- 1 payment record

### 7. Verify Setup

Open Prisma Studio to browse your data:

```bash
npm run prisma:studio
```

This opens a web interface at `http://localhost:5555` where you can view and edit database records.

## Database Schema

The database includes the following models:

### User
- Customer and admin accounts
- Stores authentication credentials
- Tracks inquiries and payments

### Company
- Reform business profiles
- Instagram integration
- Subscription management
- Slot allocation (max 300)

### Service
- Available reform services
- Categorized by type
- Price estimates

### Inquiry
- Customer requests
- Many-to-many with services
- Many-to-many with companies
- Status tracking

### Subscription
- Company subscription plans
- Monthly billing
- Active/cancelled/expired status

### InstagramPost
- Cached Instagram content
- Linked to companies
- Images and captions

### Payment
- Stripe integration
- Transaction tracking
- Metadata storage

## Common Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create and apply migration
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio

# Seed database
npm run prisma:seed

# Reset database (WARNING: deletes all data)
npm run prisma:reset

# Apply migrations in production
npx prisma migrate deploy

# Create migration without applying
npx prisma migrate dev --create-only

# View migration status
npx prisma migrate status
```

## Troubleshooting

### Connection Issues

If you can't connect to the database:

1. Verify PostgreSQL is running:
   ```bash
   # macOS
   brew services list | grep postgresql

   # Linux
   systemctl status postgresql
   ```

2. Test connection manually:
   ```bash
   psql -h localhost -U tochigi_user -d tochigi_ortalv1
   ```

3. Check your `.env` file for correct credentials

### Migration Issues

If migrations fail:

1. Check migration history:
   ```bash
   npx prisma migrate status
   ```

2. If needed, reset and start fresh (development only):
   ```bash
   npm run prisma:reset
   ```

3. Manually resolve conflicts:
   ```bash
   npx prisma migrate resolve --applied <migration_name>
   ```

### Permission Issues

If you encounter permission errors:

```sql
-- Connect as superuser
psql postgres

-- Grant all privileges
\c tochigi_ortalv1
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tochigi_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO tochigi_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO tochigi_user;
```

## Production Deployment

### Preparation

1. **Never use `prisma migrate dev` in production**
2. Always use `prisma migrate deploy` instead
3. Backup your database before migrations
4. Test migrations on staging first

### Deployment Steps

```bash
# 1. Generate Prisma Client (if not in build step)
npx prisma generate

# 2. Apply migrations
npx prisma migrate deploy

# 3. Verify migration status
npx prisma migrate status
```

### Environment Variables

Ensure these are set in production:

```env
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public&sslmode=require
NODE_ENV=production
```

For cloud databases (AWS RDS, Google Cloud SQL, etc.), add SSL configuration:

```env
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public&sslmode=require&sslcert=/path/to/cert.pem
```

## Backup and Restore

### Backup

```bash
# Full database backup
pg_dump -h localhost -U tochigi_user tochigi_ortalv1 > backup.sql

# Compressed backup
pg_dump -h localhost -U tochigi_user tochigi_ortalv1 | gzip > backup.sql.gz

# Schema only
pg_dump -h localhost -U tochigi_user --schema-only tochigi_ortalv1 > schema.sql

# Data only
pg_dump -h localhost -U tochigi_user --data-only tochigi_ortalv1 > data.sql
```

### Restore

```bash
# Restore from backup
psql -h localhost -U tochigi_user tochigi_ortalv1 < backup.sql

# Restore from compressed backup
gunzip -c backup.sql.gz | psql -h localhost -U tochigi_user tochigi_ortalv1
```

## Performance Optimization

### Indexes

The schema includes strategic indexes for common queries:

- User: `email`
- Company: `email`, `instagramHandle`, `subscriptionStatus`
- Service: `category`
- Inquiry: `userId`, `status`, `createdAt`
- Subscription: `companyId`, `status`, `endDate`
- InstagramPost: `companyId`, `postedAt`

### Connection Pooling

For production, consider using PgBouncer or similar:

```env
DATABASE_URL=postgresql://user:password@pgbouncer:6432/database?schema=public&pgbouncer=true
```

### Monitoring

Use Prisma's built-in metrics:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
  ],
});

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Duration: ' + e.duration + 'ms');
});
```

## Security Best Practices

1. **Never commit `.env` files** to version control
2. Use strong passwords for database users
3. Restrict database access to necessary IPs only
4. Enable SSL for database connections in production
5. Regularly update dependencies: `npm update`
6. Use prepared statements (Prisma does this automatically)
7. Implement rate limiting for API endpoints
8. Validate and sanitize all user inputs

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)

## Support

For issues or questions:

1. Check Prisma documentation
2. Search existing issues on GitHub
3. Ask in project Slack/Discord channel
4. Create a new GitHub issue with details
