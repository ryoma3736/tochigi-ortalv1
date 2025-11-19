/**
 * Database Type Definitions
 *
 * Re-exports Prisma types for use throughout the application.
 * This provides a centralized location for database types.
 */

export type {
  User,
  Company,
  Service,
  Inquiry,
  Subscription,
  InstagramPost,
  Payment,
  Role,
  PaymentStatus,
} from '@prisma/client';

// Additional utility types
export type UserWithInquiries = import('@prisma/client').Prisma.UserGetPayload<{
  include: { inquiries: true };
}>;

export type CompanyWithDetails = import('@prisma/client').Prisma.CompanyGetPayload<{
  include: {
    subscriptions: true;
    instagramPosts: true;
  };
}>;

export type InquiryWithRelations = import('@prisma/client').Prisma.InquiryGetPayload<{
  include: {
    user: true;
    services: true;
    selectedCompanies: true;
  };
}>;

export type SubscriptionWithCompany = import('@prisma/client').Prisma.SubscriptionGetPayload<{
  include: { company: true };
}>;

// Input types for creating records
export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: Role;
};

export type CreateCompanyInput = {
  name: string;
  email: string;
  phone?: string;
  instagramHandle?: string;
  subscriptionStatus?: string;
  maxSlots?: number;
};

export type CreateServiceInput = {
  name: string;
  description?: string;
  estimatedPrice?: number;
  category: string;
};

export type CreateInquiryInput = {
  userId: string;
  message?: string;
  serviceIds: string[];
  companyIds: string[];
};

export type CreateSubscriptionInput = {
  companyId: string;
  plan: string;
  price?: number;
  endDate?: Date;
};

export type CreateInstagramPostInput = {
  companyId: string;
  postUrl: string;
  imageUrl?: string;
  caption?: string;
  postedAt: Date;
};

// Update types
export type UpdateUserInput = Partial<CreateUserInput>;
export type UpdateCompanyInput = Partial<CreateCompanyInput>;
export type UpdateServiceInput = Partial<CreateServiceInput>;
export type UpdateInquiryInput = {
  message?: string;
  status?: string;
};
export type UpdateSubscriptionInput = Partial<CreateSubscriptionInput>;
