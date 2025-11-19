import { Router } from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import * as serviceController from '../controllers/serviceController.js'
import { body } from 'express-validator'
import { validate } from '../middleware/validation.js'

const router = Router()

// Public routes
router.get('/', serviceController.getServices)
router.get('/categories', serviceController.getServiceCategories)
router.get('/:id', serviceController.getServiceById)

// Admin only routes
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  [
    body('name').trim().notEmpty().withMessage('Service name is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('description').optional().trim(),
    body('estimatedPrice').optional().isInt({ min: 0 }).withMessage('Price must be a positive number'),
    validate,
  ],
  serviceController.createService
)

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  [
    body('name').optional().trim().notEmpty(),
    body('category').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('estimatedPrice').optional().isInt({ min: 0 }),
    validate,
  ],
  serviceController.updateService
)

router.delete('/:id', authenticate, authorize('ADMIN'), serviceController.deleteService)

export default router
