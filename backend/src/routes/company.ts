import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import * as companyController from '../controllers/companyController.js'
import { body, query } from 'express-validator'
import { validate } from '../middleware/validation.js'
import {
  checkCompanyLimit,
  getCompanyStats,
  addToWaitingList,
  getWaitingList
} from '../middleware/companyLimit.js'

const router = Router()

// Public routes
router.get(
  '/',
  [
    query('subscriptionStatus').optional().isIn(['active', 'inactive', 'trial']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
    validate,
  ],
  companyController.getCompanies
)

// Company registration with limit check
router.post(
  '/register',
  checkCompanyLimit,
  [
    body('name').trim().notEmpty().withMessage('名前は必須です'),
    body('email').isEmail().withMessage('有効なメールアドレスを入力してください'),
    body('password').isLength({ min: 8 }).withMessage('パスワードは8文字以上である必要があります'),
    body('phone').optional().trim(),
    body('instagramHandle').optional().trim(),
    body('plan').optional().isIn(['basic', 'premium', 'enterprise']),
    validate,
  ],
  companyController.registerCompany
)

// Company statistics
router.get('/stats', getCompanyStats)

// Waiting list routes
router.post(
  '/waiting-list',
  [
    body('name').trim().notEmpty().withMessage('名前は必須です'),
    body('email').isEmail().withMessage('有効なメールアドレスを入力してください'),
    body('phone').optional().trim(),
    body('message').optional().trim(),
    validate,
  ],
  addToWaitingList
)

router.get('/waiting-list', authenticate, authorize('ADMIN'), getWaitingList)

router.get('/check-limit', companyController.checkCompanyLimit)
router.get('/:id', authenticate, companyController.getCompanyById)

// Company dashboard
router.get('/:id/dashboard', authenticate, companyController.getCompanyDashboard)

// Instagram integration
router.post(
  '/:id/instagram',
  authenticate,
  [
    body('instagramHandle').trim().notEmpty(),
    body('accessToken').optional().trim(),
    validate,
  ],
  companyController.connectInstagram
)

router.get(
  '/:id/instagram',
  [
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('offset').optional().isInt({ min: 0 }),
    validate,
  ],
  companyController.getCompanyInstagram
)

// Subscription management
router.post(
  '/:id/subscription',
  authenticate,
  [
    body('plan').isIn(['basic', 'premium', 'enterprise']),
    body('paymentMethodId').trim().notEmpty(),
    validate,
  ],
  companyController.updateSubscription
)

// Admin only routes
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  [
    body('name').trim().notEmpty().withMessage('Company name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional().trim(),
    body('instagramHandle').optional().trim(),
    body('subscriptionStatus').optional().isIn(['active', 'inactive', 'trial']),
    body('maxSlots').optional().isInt({ min: 1 }),
    validate,
  ],
  companyController.createCompany
)

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'COMPANY_OWNER'),
  [
    body('name').optional().trim().notEmpty(),
    body('email').optional().isEmail(),
    body('phone').optional().trim(),
    body('instagramHandle').optional().trim(),
    body('subscriptionStatus').optional().isIn(['active', 'inactive', 'trial']),
    body('maxSlots').optional().isInt({ min: 1 }),
    validate,
  ],
  companyController.updateCompany
)

router.delete('/:id', authenticate, authorize('ADMIN'), companyController.deleteCompany)

export default router
