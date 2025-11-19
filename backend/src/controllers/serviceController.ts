import { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma.js'
import { createError } from '../middleware/errorHandler.js'
import { logger } from '../utils/logger.js'

/**
 * Get all services with optional category filter
 * GET /api/services?category=kitchen
 */
export const getServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category } = req.query

    const services = await prisma.service.findMany({
      where: category ? { category: category as string } : undefined,
      orderBy: { name: 'asc' },
    })

    logger.info(`Fetched ${services.length} services`)
    res.json({
      success: true,
      data: services,
      count: services.length,
    })
  } catch (error) {
    logger.error('Error fetching services:', error)
    next(error)
  }
}

/**
 * Get service by ID
 * GET /api/services/:id
 */
export const getServiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const service = await prisma.service.findUnique({
      where: { id },
    })

    if (!service) {
      throw createError('Service not found', 404)
    }

    res.json({
      success: true,
      data: service,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get all available service categories
 * GET /api/services/categories
 */
export const getServiceCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.service.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    })

    const categoryList = categories.map((c) => c.category)

    res.json({
      success: true,
      data: categoryList,
      count: categoryList.length,
    })
  } catch (error) {
    logger.error('Error fetching service categories:', error)
    next(error)
  }
}

/**
 * Create new service (admin only)
 * POST /api/services
 */
export const createService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, estimatedPrice, category } = req.body

    const service = await prisma.service.create({
      data: {
        name,
        description,
        estimatedPrice: estimatedPrice ? parseInt(estimatedPrice) : null,
        category,
      },
    })

    logger.info(`Created service: ${service.name}`)
    res.status(201).json({
      success: true,
      data: service,
    })
  } catch (error) {
    logger.error('Error creating service:', error)
    next(error)
  }
}

/**
 * Update service (admin only)
 * PUT /api/services/:id
 */
export const updateService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const { name, description, estimatedPrice, category } = req.body

    const service = await prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        estimatedPrice: estimatedPrice ? parseInt(estimatedPrice) : null,
        category,
      },
    })

    logger.info(`Updated service: ${service.name}`)
    res.json({
      success: true,
      data: service,
    })
  } catch (error) {
    logger.error('Error updating service:', error)
    next(error)
  }
}

/**
 * Delete service (admin only)
 * DELETE /api/services/:id
 */
export const deleteService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    await prisma.service.delete({
      where: { id },
    })

    logger.info(`Deleted service: ${id}`)
    res.json({
      success: true,
      message: 'Service deleted successfully',
    })
  } catch (error) {
    logger.error('Error deleting service:', error)
    next(error)
  }
}
