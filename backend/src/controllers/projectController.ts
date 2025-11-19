import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth.js'

export const getProjects = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // TODO: Fetch projects from database
    res.json({ success: true, data: [] })
  } catch (error) {
    next(error)
  }
}

export const getProjectById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    // TODO: Fetch project by ID
    res.json({ success: true, data: { id } })
  } catch (error) {
    next(error)
  }
}

export const createProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // TODO: Create project in database
    res.status(201).json({ success: true, data: req.body })
  } catch (error) {
    next(error)
  }
}

export const updateProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    // TODO: Update project in database
    res.json({ success: true, data: { id, ...req.body } })
  } catch (error) {
    next(error)
  }
}

export const deleteProject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    // TODO: Delete project from database
    res.json({ success: true, message: 'Project deleted' })
  } catch (error) {
    next(error)
  }
}
