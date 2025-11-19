import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import { logger } from '../utils/logger.js'
import * as stripeService from '../services/stripe.js'

/**
 * Admin: Get all subscriptions
 */
export const getAllSubscriptions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // TODO: Add admin role check
    // if (req.user?.role !== 'admin') {
    //   return res.status(403).json({ error: 'Forbidden' })
    // }

    const { limit = 20, starting_after, status } = req.query

    const params: any = {
      limit: Number(limit),
      expand: ['data.customer', 'data.latest_invoice'],
    }

    if (starting_after) {
      params.starting_after = starting_after
    }

    if (status) {
      params.status = status
    }

    const subscriptions = await stripeService.stripe.subscriptions.list(params)

    res.json({
      success: true,
      data: subscriptions.data,
      hasMore: subscriptions.has_more,
    })
  } catch (error) {
    logger.error('Error fetching all subscriptions:', error)
    next(error)
  }
}

/**
 * Admin: Get subscription details
 */
export const getSubscriptionDetails = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { subscriptionId } = req.params

    const subscription = await stripeService.getSubscription(subscriptionId)

    res.json({
      success: true,
      data: subscription,
    })
  } catch (error) {
    logger.error('Error fetching subscription details:', error)
    next(error)
  }
}

/**
 * Admin: Cancel a subscription
 */
export const adminCancelSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { subscriptionId } = req.params
    const { immediate = false, reason } = req.body

    logger.info(`Admin cancelling subscription ${subscriptionId}`, { immediate, reason })

    const subscription = await stripeService.cancelSubscription(subscriptionId, !immediate)

    // TODO: Log admin action to database
    // await db.adminLog.create({
    //   data: {
    //     adminId: req.user?.id,
    //     action: 'cancel_subscription',
    //     targetId: subscriptionId,
    //     metadata: { immediate, reason },
    //   }
    // })

    res.json({
      success: true,
      data: subscription,
      message: 'Subscription cancelled by admin',
    })
  } catch (error) {
    logger.error('Error cancelling subscription (admin):', error)
    next(error)
  }
}

/**
 * Admin: Get revenue report
 */
export const getRevenueReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query

    let start: Date | undefined
    let end: Date | undefined

    if (startDate) {
      start = new Date(startDate as string)
    }

    if (endDate) {
      end = new Date(endDate as string)
    }

    const metrics = await stripeService.getRevenueMetrics(start, end)

    // Additional analytics
    const monthlyRecurringRevenue = await calculateMRR()
    const activeSubscriptions = await getActiveSubscriptionCount()

    res.json({
      success: true,
      data: {
        ...metrics,
        mrr: monthlyRecurringRevenue,
        activeSubscriptions,
      },
    })
  } catch (error) {
    logger.error('Error generating revenue report:', error)
    next(error)
  }
}

/**
 * Admin: Get customer details
 */
export const getCustomerDetails = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { customerId } = req.params

    const customer = await stripeService.stripe.customers.retrieve(customerId, {
      expand: ['subscriptions', 'invoice_settings.default_payment_method'],
    })

    const subscriptions = await stripeService.listCustomerSubscriptions(customerId)
    const paymentHistory = await stripeService.getPaymentHistory(customerId, 20)

    res.json({
      success: true,
      data: {
        customer,
        subscriptions,
        paymentHistory,
      },
    })
  } catch (error) {
    logger.error('Error fetching customer details:', error)
    next(error)
  }
}

/**
 * Admin: Search customers
 */
export const searchCustomers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, limit = 20 } = req.query

    const params: any = {
      limit: Number(limit),
      expand: ['data.subscriptions'],
    }

    if (email) {
      params.email = email
    }

    const customers = await stripeService.stripe.customers.list(params)

    res.json({
      success: true,
      data: customers.data,
      hasMore: customers.has_more,
    })
  } catch (error) {
    logger.error('Error searching customers:', error)
    next(error)
  }
}

/**
 * Admin: Get failed payments
 */
export const getFailedPayments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { limit = 20 } = req.query

    const invoices = await stripeService.stripe.invoices.list({
      status: 'open',
      limit: Number(limit),
      expand: ['data.customer', 'data.subscription'],
    })

    const failedPayments = invoices.data.filter(inv =>
      inv.attempted && !inv.paid
    )

    res.json({
      success: true,
      data: failedPayments,
    })
  } catch (error) {
    logger.error('Error fetching failed payments:', error)
    next(error)
  }
}

/**
 * Admin: Refund a payment
 */
export const refundPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { paymentIntentId } = req.params
    const { amount, reason = 'requested_by_customer' } = req.body

    const refund = await stripeService.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Number(amount) : undefined,
      reason: reason as any,
    })

    logger.info(`Refund created by admin: ${refund.id}`)

    res.json({
      success: true,
      data: refund,
      message: 'Refund processed successfully',
    })
  } catch (error) {
    logger.error('Error processing refund:', error)
    next(error)
  }
}

// Helper functions

/**
 * Calculate Monthly Recurring Revenue (MRR)
 */
async function calculateMRR(): Promise<number> {
  try {
    const subscriptions = await stripeService.stripe.subscriptions.list({
      status: 'active',
      limit: 100,
      expand: ['data.items.data.price'],
    })

    let mrr = 0

    for (const subscription of subscriptions.data) {
      for (const item of subscription.items.data) {
        const price = item.price
        const amount = price.unit_amount || 0
        const quantity = item.quantity || 1

        // Convert to monthly amount
        let monthlyAmount = amount * quantity

        if (price.recurring?.interval === 'year') {
          monthlyAmount = monthlyAmount / 12
        } else if (price.recurring?.interval === 'week') {
          monthlyAmount = monthlyAmount * 4
        } else if (price.recurring?.interval === 'day') {
          monthlyAmount = monthlyAmount * 30
        }

        mrr += monthlyAmount
      }
    }

    return Math.round(mrr)
  } catch (error) {
    logger.error('Error calculating MRR:', error)
    return 0
  }
}

/**
 * Get active subscription count
 */
async function getActiveSubscriptionCount(): Promise<number> {
  try {
    const subscriptions = await stripeService.stripe.subscriptions.list({
      status: 'active',
      limit: 1,
    })

    return subscriptions.data.length
  } catch (error) {
    logger.error('Error getting active subscription count:', error)
    return 0
  }
}
