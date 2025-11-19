import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import * as inquiryController from '../controllers/inquiryController.js'
import { body, query } from 'express-validator'
import { validate } from '../middleware/validation.js'

const router = Router()

// All routes require authentication
router.use(authenticate)

// User routes
router.post(
  '/',
  [
    body('serviceIds')
      .optional()
      .isArray()
      .withMessage('Service IDs must be an array'),
    body('companyIds')
      .optional()
      .isArray()
      .withMessage('Company IDs must be an array'),
    body('message').optional().trim(),
    validate,
  ],
  inquiryController.createInquiry
)

router.get('/', inquiryController.getUserInquiries)
router.get('/:id', inquiryController.getInquiryById)

router.post(
  '/bulk-send',
  [
    body('inquiryId').notEmpty().withMessage('Inquiry ID is required'),
    validate,
  ],
  inquiryController.bulkSendInquiries
)

// Admin routes
router.get(
  '/all',
  authorize('ADMIN'),
  [
    query('status').optional().isIn(['pending', 'processing', 'completed', 'cancelled']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
    validate,
  ],
  inquiryController.getAllInquiries
)

router.patch(
  '/:id/status',
  authorize('ADMIN'),
  [
    body('status')
      .isIn(['pending', 'processing', 'completed', 'cancelled'])
      .withMessage('Invalid status'),
    validate,
  ],
  inquiryController.updateInquiryStatus
)

export default router
