import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia'
});

/**
 * Register a new company
 * POST /api/companies/register
 */
export const registerCompany = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      phone,
      instagramHandle,
      plan = 'basic'
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        error: '名前、メールアドレス、パスワードは必須です'
      });
      return;
    }

    // Check if company already exists
    const existingCompany = await prisma.company.findUnique({
      where: { email }
    });

    if (existingCompany) {
      res.status(409).json({
        success: false,
        error: 'このメールアドレスは既に登録されています'
      });
      return;
    }

    // Hash password for User account
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create company and user in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create company
      const company = await tx.company.create({
        data: {
          name,
          email,
          phone,
          instagramHandle,
          subscriptionStatus: 'trial' // Start with trial
        }
      });

      // Create user account for company owner
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          role: 'COMPANY_OWNER'
        }
      });

      // Create trial subscription (14 days)
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14);

      const subscription = await tx.subscription.create({
        data: {
          companyId: company.id,
          plan,
          price: 0, // Trial is free
          status: 'active',
          endDate: trialEndDate
        }
      });

      return { company, user, subscription };
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: result.user.id,
        companyId: result.company.id,
        role: 'COMPANY_OWNER'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: '登録が完了しました。14日間の無料トライアルを開始します。',
      data: {
        company: {
          id: result.company.id,
          name: result.company.name,
          email: result.company.email,
          subscriptionStatus: result.company.subscriptionStatus
        },
        token,
        trialEndsAt: result.subscription.endDate
      }
    });
  } catch (error) {
    console.error('Error registering company:', error);
    res.status(500).json({
      success: false,
      error: 'システムエラーが発生しました'
    });
  }
};

/**
 * Get all companies (Admin only)
 * GET /api/admin/companies
 */
export const getAllCompanies = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {};

    if (status) {
      where.subscriptionStatus = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        include: {
          subscriptions: {
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          _count: {
            select: {
              selectedInquiries: true,
              instagramPosts: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.company.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        companies,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error getting companies:', error);
    res.status(500).json({
      success: false,
      error: 'システムエラーが発生しました'
    });
  }
};

/**
 * Get single company by ID
 * GET /api/companies/:id
 */
export const getCompanyById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        subscriptions: {
          orderBy: { createdAt: 'desc' }
        },
        instagramPosts: {
          orderBy: { postedAt: 'desc' },
          take: 10
        },
        selectedInquiries: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            services: true
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!company) {
      res.status(404).json({
        success: false,
        error: '業者が見つかりません'
      });
      return;
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Error getting company:', error);
    res.status(500).json({
      success: false,
      error: 'システムエラーが発生しました'
    });
  }
};

/**
 * Update company information
 * PATCH /api/companies/:id
 */
export const updateCompany = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be directly updated
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const company = await prisma.company.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: '業者情報が更新されました',
      data: company
    });
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({
      success: false,
      error: 'システムエラーが発生しました'
    });
  }
};

/**
 * Delete company (Admin only)
 * DELETE /api/companies/:id
 */
export const deleteCompany = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Delete company (cascade will handle related records)
    await prisma.company.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: '業者が削除されました'
    });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({
      success: false,
      error: 'システムエラーが発生しました'
    });
  }
};

/**
 * Update subscription status
 * POST /api/companies/:id/subscription
 */
export const updateSubscription = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { plan, paymentMethodId } = req.body;

    // Get company
    const company = await prisma.company.findUnique({
      where: { id }
    });

    if (!company) {
      res.status(404).json({
        success: false,
        error: '業者が見つかりません'
      });
      return;
    }

    // Determine price based on plan
    let price = 100000; // Basic plan default
    if (plan === 'premium') price = 200000;
    if (plan === 'enterprise') price = 300000;

    // Create Stripe subscription
    const customer = await stripe.customers.create({
      email: company.email,
      name: company.name,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });

    const stripeSubscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: `${plan} プラン`
            },
            recurring: {
              interval: 'month'
            },
            unit_amount: price
          }
        }
      ],
      payment_settings: {
        payment_method_types: ['card']
      }
    });

    // Update company and create subscription record
    const result = await prisma.$transaction(async (tx) => {
      // Update company status
      const updatedCompany = await tx.company.update({
        where: { id },
        data: {
          subscriptionStatus: 'active'
        }
      });

      // Create subscription record
      const subscription = await tx.subscription.create({
        data: {
          companyId: id,
          plan,
          price,
          status: 'active'
        }
      });

      return { company: updatedCompany, subscription };
    });

    res.json({
      success: true,
      message: 'サブスクリプションが開始されました',
      data: {
        company: result.company,
        subscription: result.subscription,
        stripeSubscriptionId: stripeSubscription.id
      }
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({
      success: false,
      error: 'システムエラーが発生しました'
    });
  }
};

/**
 * Connect Instagram account
 * POST /api/companies/:id/instagram
 */
export const connectInstagram = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { instagramHandle, accessToken } = req.body;

    if (!instagramHandle) {
      res.status(400).json({
        success: false,
        error: 'Instagramハンドルは必須です'
      });
      return;
    }

    // Update company with Instagram info
    const company = await prisma.company.update({
      where: { id },
      data: {
        instagramHandle
      }
    });

    res.json({
      success: true,
      message: 'Instagramアカウントが連携されました',
      data: company
    });
  } catch (error) {
    console.error('Error connecting Instagram:', error);
    res.status(500).json({
      success: false,
      error: 'システムエラーが発生しました'
    });
  }
};

/**
 * Get company dashboard data
 * GET /api/companies/:id/dashboard
 */
export const getCompanyDashboard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const [company, inquiryStats, recentInquiries, instagramPosts] = await Promise.all([
      prisma.company.findUnique({
        where: { id },
        include: {
          subscriptions: {
            where: { status: 'active' },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      }),
      prisma.inquiry.groupBy({
        by: ['status'],
        where: {
          selectedCompanies: {
            some: { id }
          }
        },
        _count: true
      }),
      prisma.inquiry.findMany({
        where: {
          selectedCompanies: {
            some: { id }
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          services: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      prisma.instagramPost.findMany({
        where: { companyId: id },
        orderBy: { postedAt: 'desc' },
        take: 6
      })
    ]);

    if (!company) {
      res.status(404).json({
        success: false,
        error: '業者が見つかりません'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        company,
        stats: {
          inquiries: inquiryStats,
          totalInquiries: inquiryStats.reduce((sum, stat) => sum + stat._count, 0)
        },
        recentInquiries,
        instagramPosts
      }
    });
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'システムエラーが発生しました'
    });
  }
};
