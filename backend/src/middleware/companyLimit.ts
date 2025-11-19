import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Maximum number of companies allowed
const MAX_COMPANIES = 300;

/**
 * Middleware to check if the company limit has been reached
 * If limit is reached, returns error with waiting list option
 */
export const checkCompanyLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Count active companies
    const activeCompanies = await prisma.company.count({
      where: {
        subscriptionStatus: {
          in: ['active', 'trial']
        }
      }
    });

    if (activeCompanies >= MAX_COMPANIES) {
      res.status(403).json({
        success: false,
        error: '現在満員です。キャンセル待ちリストに追加しますか？',
        limitReached: true,
        currentCount: activeCompanies,
        maxCount: MAX_COMPANIES,
        waitingListAvailable: true
      });
      return;
    }

    // Add company count to request for controller use
    (req as any).companyCount = activeCompanies;
    next();
  } catch (error) {
    console.error('Error checking company limit:', error);
    res.status(500).json({
      success: false,
      error: 'システムエラーが発生しました'
    });
  }
};

/**
 * Get current company statistics
 */
export const getCompanyStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const [activeCount, totalCount, waitingCount] = await Promise.all([
      prisma.company.count({
        where: {
          subscriptionStatus: {
            in: ['active', 'trial']
          }
        }
      }),
      prisma.company.count(),
      prisma.waitingList.count({
        where: {
          status: 'WAITING'
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        activeCount,
        totalCount,
        waitingCount,
        maxCount: MAX_COMPANIES,
        slotsAvailable: MAX_COMPANIES - activeCount,
        isAtCapacity: activeCount >= MAX_COMPANIES
      }
    });
  } catch (error) {
    console.error('Error getting company stats:', error);
    res.status(500).json({
      success: false,
      error: 'システムエラーが発生しました'
    });
  }
};

/**
 * Add to waiting list when limit is reached
 */
export const addToWaitingList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email) {
      res.status(400).json({
        success: false,
        error: '名前とメールアドレスは必須です'
      });
      return;
    }

    // Check if email already exists in waiting list
    const existing = await prisma.waitingList.findUnique({
      where: { email }
    });

    if (existing) {
      res.status(409).json({
        success: false,
        error: 'このメールアドレスは既にキャンセル待ちリストに登録されています'
      });
      return;
    }

    // Add to waiting list
    const waitingListEntry = await prisma.waitingList.create({
      data: {
        name,
        email,
        phone,
        message,
        status: 'WAITING'
      }
    });

    // Get position in queue
    const position = await prisma.waitingList.count({
      where: {
        status: 'WAITING',
        createdAt: {
          lte: waitingListEntry.createdAt
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'キャンセル待ちリストに追加されました',
      data: {
        id: waitingListEntry.id,
        position,
        email: waitingListEntry.email
      }
    });
  } catch (error) {
    console.error('Error adding to waiting list:', error);
    res.status(500).json({
      success: false,
      error: 'システムエラーが発生しました'
    });
  }
};

/**
 * Get waiting list (admin only)
 */
export const getWaitingList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = status ? { status: status as string } : {};

    const [entries, total] = await Promise.all([
      prisma.waitingList.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        skip,
        take: Number(limit)
      }),
      prisma.waitingList.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        entries,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error getting waiting list:', error);
    res.status(500).json({
      success: false,
      error: 'システムエラーが発生しました'
    });
  }
};
