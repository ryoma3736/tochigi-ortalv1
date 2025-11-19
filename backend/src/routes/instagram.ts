import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import * as instagramController from '../controllers/instagramController.js'

const router = Router()

// Public routes (no authentication required)
router.get('/auth', instagramController.getAuthUrl)
router.post('/callback', instagramController.handleCallback)

// Protected routes (authentication required)
router.use(authenticate)

// Get Instagram posts for a company
router.get('/posts', instagramController.getPosts)

// Get cache statistics
router.get('/cache/stats', instagramController.getCacheStats)

// Clear cache for a company
router.delete('/cache', instagramController.clearCache)

// Validate access token
router.post('/validate-token', instagramController.validateToken)

// Get Instagram insights
router.get('/insights', instagramController.getInsights)

// Admin routes
router.post('/sync', instagramController.syncAllCompanies)
router.get('/sync/status', instagramController.getSyncStatus)

export default router
