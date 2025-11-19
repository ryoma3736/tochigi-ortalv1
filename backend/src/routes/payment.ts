import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import * as paymentController from '../controllers/paymentController.js'

const router = Router()

// User endpoints (require authentication)
router.use(authenticate)

// Subscription management
router.post('/checkout-session', paymentController.createCheckoutSession)
router.post('/subscription', paymentController.createSubscription)
router.get('/subscriptions', paymentController.getMySubscriptions)
router.post('/subscription/:subscriptionId/cancel', paymentController.cancelSubscription)
router.post('/subscription/:subscriptionId/resume', paymentController.resumeSubscription)

// Payment history and invoices
router.get('/history', paymentController.getPaymentHistory)
router.get('/upcoming-invoice', paymentController.getUpcomingInvoice)

// One-time payment
router.post('/payment-intent', paymentController.createPaymentIntent)

export default router
