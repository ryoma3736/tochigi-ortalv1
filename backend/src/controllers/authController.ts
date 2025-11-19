import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createError } from '../middleware/errorHandler.js'

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password, name } = req.body

    // TODO: Check if user exists in database
    // TODO: Hash password
    // TODO: Create user in database
    // TODO: Generate JWT token

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { email, name },
    })
  } catch (error) {
    next(error)
  }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    // TODO: Find user by email
    // TODO: Verify password
    // TODO: Generate JWT token

    res.json({
      success: true,
      message: 'Login successful',
      data: { token: 'dummy_token' },
    })
  } catch (error) {
    next(error)
  }
}

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, message: 'Logout successful' })
  } catch (error) {
    next(error)
  }
}

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    // TODO: Generate reset token
    // TODO: Send email with reset link

    res.json({ success: true, message: 'Password reset email sent' })
  } catch (error) {
    next(error)
  }
}

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    // TODO: Verify reset token
    // TODO: Update password

    res.json({ success: true, message: 'Password reset successful' })
  } catch (error) {
    next(error)
  }
}
