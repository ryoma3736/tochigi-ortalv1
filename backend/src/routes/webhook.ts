import { Router, Request, Response, NextFunction } from 'express'
import { handleStripeWebhook } from '../controllers/stripeWebhook.js'

const router = Router()

/**
 * Stripe webhook endpoint
 *
 * IMPORTANT: This endpoint must use raw body parsing, not JSON parsing
 * The raw body is required for Stripe signature verification
 *
 * Configure in index.ts:
 * app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }), webhookRoutes)
 */
router.post('/stripe', handleStripeWebhook)

export default router
