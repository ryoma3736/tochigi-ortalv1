import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import * as businessController from '../controllers/businessController.js'

const router = Router()

// All routes require authentication
router.use(authenticate)

router.get('/', businessController.getBusinesses)
router.get('/:id', businessController.getBusinessById)
router.post('/', businessController.createBusiness)
router.put('/:id', businessController.updateBusiness)
router.delete('/:id', businessController.deleteBusiness)

export default router
