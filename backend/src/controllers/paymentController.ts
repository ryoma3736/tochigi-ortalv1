import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth.js'
import { logger } from '../utils/logger.js'
import * as stripeService from '../services/stripe.js'

/**
 * Create a checkout session for subscription
 */
export const createCheckoutSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id
    const { email, name, priceId } = req.body

    if (!userId || !email) {
      return res.status(400).json({ error: 'User ID and email are required' })
    }

    // Create or get Stripe customer
    const customer = await stripeService.getOrCreateCustomer(userId, email, name)

    // Create checkout session
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const session = await stripeService.createCheckoutSession(
      customer.id,
      priceId || stripeService.PLANS.INSTAGRAM_MONTHLY.priceId,
      `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      `${frontendUrl}/payment/cancel`,
      { userId }
    )

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    })
  } catch (error) {
    logger.error('Error creating checkout session:', error)
    next(error)
  }
}

/**
 * Create a subscription directly (requires payment method)
 */
export const createSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id
    const { email, name, priceId } = req.body

    if (!userId || !email) {
      return res.status(400).json({ error: 'User ID and email are required' })
    }

    // Create or get Stripe customer
    const customer = await stripeService.getOrCreateCustomer(userId, email, name)

    // Create subscription
    const subscription = await stripeService.createSubscription(
      customer.id,
      priceId || stripeService.PLANS.INSTAGRAM_MONTHLY.priceId,
      { userId }
    )

    res.json({
      success: true,
      data: {
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
        status: subscription.status,
      },
    })
  } catch (error) {
    logger.error('Error creating subscription:', error)
    next(error)
  }
}

/**
 * Get current user's subscriptions
 */
export const getMySubscriptions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id
    const { email } = req.query

    if (!userId || !email) {
      return res.status(400).json({ error: 'User ID and email are required' })
    }

    // Get customer
    const customer = await stripeService.getOrCreateCustomer(userId, email as string)

    // Get subscriptions
    const subscriptions = await stripeService.listCustomerSubscriptions(customer.id)

    res.json({
      success: true,
      data: subscriptions,
    })
  } catch (error) {
    logger.error('Error fetching subscriptions:', error)
    next(error)
  }
}

/**
 * Cancel a subscription
 */
export const cancelSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { subscriptionId } = req.params
    const { immediate = false } = req.body

    if (!subscriptionId) {
      return res.status(400).json({ error: 'Subscription ID is required' })
    }

    const subscription = await stripeService.cancelSubscription(subscriptionId, !immediate)

    res.json({
      success: true,
      data: subscription,
      message: immediate ? 'Subscription cancelled immediately' : 'Subscription will cancel at period end',
    })
  } catch (error) {
    logger.error('Error cancelling subscription:', error)
    next(error)
  }
}

/**
 * Resume a cancelled subscription
 */
export const resumeSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { subscriptionId } = req.params

    if (!subscriptionId) {
      return res.status(400).json({ error: 'Subscription ID is required' })
    }

    const subscription = await stripeService.resumeSubscription(subscriptionId)

    res.json({
      success: true,
      data: subscription,
      message: 'Subscription resumed successfully',
    })
  } catch (error) {
    logger.error('Error resuming subscription:', error)
    next(error)
  }
}

/**
 * Get payment history
 */
export const getPaymentHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id
    const { email } = req.query

    if (!userId || !email) {
      return res.status(400).json({ error: 'User ID and email are required' })
    }

    // Get customer
    const customer = await stripeService.getOrCreateCustomer(userId, email as string)

    // Get payment history
    const invoices = await stripeService.getPaymentHistory(customer.id)

    res.json({
      success: true,
      data: invoices,
    })
  } catch (error) {
    logger.error('Error fetching payment history:', error)
    next(error)
  }
}

/**
 * Get upcoming invoice
 */
export const getUpcomingInvoice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id
    const { email, subscriptionId } = req.query

    if (!userId || !email) {
      return res.status(400).json({ error: 'User ID and email are required' })
    }

    // Get customer
    const customer = await stripeService.getOrCreateCustomer(userId, email as string)

    // Get upcoming invoice
    const invoice = await stripeService.getUpcomingInvoice(customer.id, subscriptionId as string | undefined)

    res.json({
      success: true,
      data: invoice,
    })
  } catch (error) {
    logger.error('Error fetching upcoming invoice:', error)
    next(error)
  }
}

/**
 * Create one-time payment intent
 */
export const createPaymentIntent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id
    const { amount, currency = 'jpy', email } = req.body

    if (!userId || !amount) {
      return res.status(400).json({ error: 'User ID and amount are required' })
    }

    let customerId: string | undefined

    if (email) {
      const customer = await stripeService.getOrCreateCustomer(userId, email)
      customerId = customer.id
    }

    const paymentIntent = await stripeService.createPaymentIntent(
      amount,
      currency,
      customerId,
      { userId }
    )

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    })
  } catch (error) {
    logger.error('Error creating payment intent:', error)
    next(error)
  }
}
