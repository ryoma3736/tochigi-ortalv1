import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import * as adminController from '../controllers/adminController.js'

const router = Router()

// All admin routes require authentication
// TODO: Add admin role middleware
router.use(authenticate)

// Subscription management
router.get('/subscriptions', adminController.getAllSubscriptions)
router.get('/subscriptions/:subscriptionId', adminController.getSubscriptionDetails)
router.post('/subscriptions/:subscriptionId/cancel', adminController.adminCancelSubscription)

// Customer management
router.get('/customers', adminController.searchCustomers)
router.get('/customers/:customerId', adminController.getCustomerDetails)

// Revenue and analytics
router.get('/revenue', adminController.getRevenueReport)
router.get('/failed-payments', adminController.getFailedPayments)

// Refunds
router.post('/payments/:paymentIntentId/refund', adminController.refundPayment)

export default router
