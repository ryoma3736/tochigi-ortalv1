/**
 * Database Seed Script
 *
 * This script populates the database with initial data for development and testing.
 */

import { PrismaClient, Role, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clean existing data (in development only)
  if (process.env.NODE_ENV !== 'production') {
    console.log('Cleaning existing data...');
    await prisma.payment.deleteMany();
    await prisma.inquiry.deleteMany();
    await prisma.instagramPost.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.service.deleteMany();
    await prisma.company.deleteMany();
    await prisma.user.deleteMany();
  }

  // Create services
  console.log('Creating services...');
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'キッチンリフォーム',
        description: 'システムキッチンの交換・リフォーム',
        estimatedPrice: 1000000,
        category: 'kitchen',
      },
    }),
    prisma.service.create({
      data: {
        name: 'バスルームリフォーム',
        description: 'ユニットバス交換・浴室リフォーム',
        estimatedPrice: 800000,
        category: 'bathroom',
      },
    }),
    prisma.service.create({
      data: {
        name: 'リビングリフォーム',
        description: 'フローリング張替え・壁紙交換',
        estimatedPrice: 500000,
        category: 'living',
      },
    }),
    prisma.service.create({
      data: {
        name: '外壁塗装',
        description: '外壁の塗装・補修',
        estimatedPrice: 1200000,
        category: 'exterior',
      },
    }),
    prisma.service.create({
      data: {
        name: '屋根リフォーム',
        description: '屋根の葺き替え・塗装',
        estimatedPrice: 900000,
        category: 'exterior',
      },
    }),
  ]);

  console.log(`Created ${services.length} services`);

  // Create companies
  console.log('Creating companies...');
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: '栃木リフォーム株式会社',
        email: 'info@tochigi-reform.jp',
        phone: '028-123-4567',
        instagramHandle: 'tochigi_reform',
        subscriptionStatus: 'active',
        maxSlots: 300,
      },
    }),
    prisma.company.create({
      data: {
        name: '宇都宮建設',
        email: 'contact@utsunomiya-const.jp',
        phone: '028-234-5678',
        instagramHandle: 'utsunomiya_construction',
        subscriptionStatus: 'active',
        maxSlots: 300,
      },
    }),
    prisma.company.create({
      data: {
        name: '小山工務店',
        email: 'info@oyama-koumuten.jp',
        phone: '028-345-6789',
        instagramHandle: 'oyama_koumuten',
        subscriptionStatus: 'trial',
        maxSlots: 300,
      },
    }),
  ]);

  console.log(`Created ${companies.length} companies`);

  // Create subscriptions for companies
  console.log('Creating subscriptions...');
  const subscriptions = await Promise.all([
    prisma.subscription.create({
      data: {
        companyId: companies[0].id,
        plan: 'premium',
        price: 150000,
        status: 'active',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
      },
    }),
    prisma.subscription.create({
      data: {
        companyId: companies[1].id,
        plan: 'basic',
        price: 100000,
        status: 'active',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
      },
    }),
    prisma.subscription.create({
      data: {
        companyId: companies[2].id,
        plan: 'basic',
        price: 100000,
        status: 'active',
        startDate: new Date('2025-11-01'),
        endDate: new Date('2025-11-30'),
      },
    }),
  ]);

  console.log(`Created ${subscriptions.length} subscriptions`);

  // Create Instagram posts
  console.log('Creating Instagram posts...');
  const instagramPosts = await Promise.all([
    prisma.instagramPost.create({
      data: {
        companyId: companies[0].id,
        postUrl: 'https://instagram.com/p/ABC123',
        imageUrl: 'https://example.com/images/post1.jpg',
        caption: '最新のキッチンリフォーム事例をご紹介！',
        postedAt: new Date('2025-11-15'),
      },
    }),
    prisma.instagramPost.create({
      data: {
        companyId: companies[0].id,
        postUrl: 'https://instagram.com/p/DEF456',
        imageUrl: 'https://example.com/images/post2.jpg',
        caption: 'バスルームをおしゃれに変身させました',
        postedAt: new Date('2025-11-10'),
      },
    }),
    prisma.instagramPost.create({
      data: {
        companyId: companies[1].id,
        postUrl: 'https://instagram.com/p/GHI789',
        imageUrl: 'https://example.com/images/post3.jpg',
        caption: '外壁塗装の施工事例',
        postedAt: new Date('2025-11-12'),
      },
    }),
  ]);

  console.log(`Created ${instagramPosts.length} Instagram posts`);

  // Create users
  console.log('Creating users...');
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: '山田太郎',
        email: 'yamada@example.com',
        password: 'hashed_password_123', // In real app, use bcrypt
        phone: '090-1234-5678',
        role: Role.CUSTOMER,
      },
    }),
    prisma.user.create({
      data: {
        name: '佐藤花子',
        email: 'sato@example.com',
        password: 'hashed_password_456',
        phone: '090-2345-6789',
        role: Role.CUSTOMER,
      },
    }),
    prisma.user.create({
      data: {
        name: '管理者',
        email: 'admin@tochigi-ortal.jp',
        password: 'hashed_admin_password',
        phone: '028-000-0000',
        role: Role.ADMIN,
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Create inquiries
  console.log('Creating inquiries...');
  const inquiries = await Promise.all([
    prisma.inquiry.create({
      data: {
        userId: users[0].id,
        message: 'キッチンとバスルームのリフォームを検討しています。見積もりをお願いします。',
        status: 'pending',
        services: {
          connect: [{ id: services[0].id }, { id: services[1].id }],
        },
        selectedCompanies: {
          connect: [{ id: companies[0].id }, { id: companies[1].id }],
        },
      },
    }),
    prisma.inquiry.create({
      data: {
        userId: users[1].id,
        message: '外壁塗装の見積もりをお願いします。',
        status: 'processing',
        services: {
          connect: [{ id: services[3].id }],
        },
        selectedCompanies: {
          connect: [{ id: companies[1].id }],
        },
      },
    }),
  ]);

  console.log(`Created ${inquiries.length} inquiries`);

  // Create payments
  console.log('Creating payments...');
  const payments = await Promise.all([
    prisma.payment.create({
      data: {
        amount: 100000,
        currency: 'jpy',
        status: PaymentStatus.SUCCEEDED,
        stripePaymentId: 'pi_test_123456',
        userId: users[0].id,
        metadata: {
          description: 'Initial consultation fee',
          inquiryId: inquiries[0].id,
        },
      },
    }),
  ]);

  console.log(`Created ${payments.length} payments`);

  console.log('Database seed completed successfully!');
  console.log('\nSummary:');
  console.log(`- Services: ${services.length}`);
  console.log(`- Companies: ${companies.length}`);
  console.log(`- Subscriptions: ${subscriptions.length}`);
  console.log(`- Instagram Posts: ${instagramPosts.length}`);
  console.log(`- Users: ${users.length}`);
  console.log(`- Inquiries: ${inquiries.length}`);
  console.log(`- Payments: ${payments.length}`);
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
