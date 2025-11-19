import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth.js'

export const getBusinesses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // TODO: Fetch businesses from database
    res.json({ success: true, data: [] })
  } catch (error) {
    next(error)
  }
}

export const getBusinessById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    // TODO: Fetch business by ID
    res.json({ success: true, data: { id } })
  } catch (error) {
    next(error)
  }
}

export const createBusiness = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // TODO: Create business in database
    res.status(201).json({ success: true, data: req.body })
  } catch (error) {
    next(error)
  }
}

export const updateBusiness = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    // TODO: Update business in database
    res.json({ success: true, data: { id, ...req.body } })
  } catch (error) {
    next(error)
  }
}

export const deleteBusiness = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    // TODO: Delete business from database
    res.json({ success: true, message: 'Business deleted' })
  } catch (error) {
    next(error)
  }
}
