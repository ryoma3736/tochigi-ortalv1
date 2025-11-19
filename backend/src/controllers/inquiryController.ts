import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import { prisma } from '../lib/prisma.js'
import { createError } from '../middleware/errorHandler.js'
import { logger } from '../utils/logger.js'
import { sendInquiryEmail } from '../services/emailService.js'

/**
 * Create inquiry
 * POST /api/inquiries
 */
export const createInquiry = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { serviceIds, companyIds, message } = req.body
    const userId = req.user?.id

    if (!userId) {
      throw createError('User not authenticated', 401)
    }

    // Validate services exist
    if (serviceIds && serviceIds.length > 0) {
      const services = await prisma.service.findMany({
        where: { id: { in: serviceIds } },
      })

      if (services.length !== serviceIds.length) {
        throw createError('One or more services not found', 404)
      }
    }

    // Validate companies exist
    if (companyIds && companyIds.length > 0) {
      const companies = await prisma.company.findMany({
        where: { id: { in: companyIds } },
      })

      if (companies.length !== companyIds.length) {
        throw createError('One or more companies not found', 404)
      }
    }

    // Create inquiry
    const inquiry = await prisma.inquiry.create({
      data: {
        userId,
        message,
        status: 'pending',
        services: serviceIds
          ? {
              connect: serviceIds.map((id: string) => ({ id })),
            }
          : undefined,
        selectedCompanies: companyIds
          ? {
              connect: companyIds.map((id: string) => ({ id })),
            }
          : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        services: true,
        selectedCompanies: true,
      },
    })

    logger.info(`Created inquiry ${inquiry.id} for user ${userId}`)

    res.status(201).json({
      success: true,
      data: inquiry,
    })
  } catch (error) {
    logger.error('Error creating inquiry:', error)
    next(error)
  }
}

/**
 * Get user's inquiries
 * GET /api/inquiries
 */
export const getUserInquiries = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      throw createError('User not authenticated', 401)
    }

    const inquiries = await prisma.inquiry.findMany({
      where: { userId },
      include: {
        services: true,
        selectedCompanies: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json({
      success: true,
      data: inquiries,
      count: inquiries.length,
    })
  } catch (error) {
    logger.error('Error fetching user inquiries:', error)
    next(error)
  }
}

/**
 * Get inquiry by ID
 * GET /api/inquiries/:id
 */
export const getInquiryById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        services: true,
        selectedCompanies: true,
      },
    })

    if (!inquiry) {
      throw createError('Inquiry not found', 404)
    }

    // Check authorization (user can only view their own inquiries unless admin)
    if (inquiry.userId !== userId && req.user?.role !== 'ADMIN') {
      throw createError('Not authorized to view this inquiry', 403)
    }

    res.json({
      success: true,
      data: inquiry,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Send bulk inquiry emails to selected companies
 * POST /api/inquiries/bulk-send
 */
export const bulkSendInquiries = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { inquiryId } = req.body
    const userId = req.user?.id

    if (!userId) {
      throw createError('User not authenticated', 401)
    }

    // Get inquiry with all related data
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        services: true,
        selectedCompanies: true,
      },
    })

    if (!inquiry) {
      throw createError('Inquiry not found', 404)
    }

    // Check authorization
    if (inquiry.userId !== userId && req.user?.role !== 'ADMIN') {
      throw createError('Not authorized to send this inquiry', 403)
    }

    // Check if companies are selected
    if (!inquiry.selectedCompanies || inquiry.selectedCompanies.length === 0) {
      throw createError('No companies selected for this inquiry', 400)
    }

    // Send emails to all selected companies
    const emailResults = await Promise.allSettled(
      inquiry.selectedCompanies.map((company) =>
        sendInquiryEmail({
          to: company.email,
          companyName: company.name,
          customerName: inquiry.user.name,
          customerEmail: inquiry.user.email,
          customerPhone: inquiry.user.phone || '',
          services: inquiry.services.map((s) => s.name),
          message: inquiry.message || '',
        })
      )
    )

    const successCount = emailResults.filter((r) => r.status === 'fulfilled').length
    const failedCount = emailResults.filter((r) => r.status === 'rejected').length

    // Update inquiry status
    await prisma.inquiry.update({
      where: { id: inquiryId },
      data: { status: 'processing' },
    })

    logger.info(
      `Sent inquiry ${inquiryId} to ${successCount} companies (${failedCount} failed)`
    )

    res.json({
      success: true,
      data: {
        inquiryId,
        totalCompanies: inquiry.selectedCompanies.length,
        successCount,
        failedCount,
      },
    })
  } catch (error) {
    logger.error('Error sending bulk inquiries:', error)
    next(error)
  }
}

/**
 * Update inquiry status
 * PATCH /api/inquiries/:id/status
 */
export const updateInquiryStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: { status },
    })

    logger.info(`Updated inquiry ${id} status to ${status}`)

    res.json({
      success: true,
      data: inquiry,
    })
  } catch (error) {
    logger.error('Error updating inquiry status:', error)
    next(error)
  }
}

/**
 * Get all inquiries (admin only)
 * GET /api/inquiries/all
 */
export const getAllInquiries = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, limit = '20', offset = '0' } = req.query

    const where: any = {}
    if (status) {
      where.status = status
    }

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          services: true,
          selectedCompanies: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.inquiry.count({ where }),
    ])

    res.json({
      success: true,
      data: inquiries,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: parseInt(offset as string) + inquiries.length < total,
      },
    })
  } catch (error) {
    logger.error('Error fetching all inquiries:', error)
    next(error)
  }
}
