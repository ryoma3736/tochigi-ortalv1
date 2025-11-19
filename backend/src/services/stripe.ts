import Stripe from 'stripe'
import { logger } from '../utils/logger.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
})

/**
 * Stripe Product and Price IDs
 * Replace these with your actual Stripe product/price IDs from dashboard
 */
export const PLANS = {
  INSTAGRAM_MONTHLY: {
    priceId: process.env.STRIPE_PRICE_ID_MONTHLY || 'price_instagram_monthly_100000',
    amount: 100000, // 10万円
    currency: 'jpy',
    interval: 'month' as const,
    name: 'Instagram毎日投稿プラン（月額）',
  },
}

/**
 * Create or retrieve a Stripe customer
 */
export async function getOrCreateCustomer(userId: string, email: string, name?: string): Promise<Stripe.Customer> {
  try {
    // Search for existing customer by metadata
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      logger.info(`Existing Stripe customer found: ${existingCustomers.data[0].id}`)
      return existingCustomers.data[0]
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
      },
    })

    logger.info(`New Stripe customer created: ${customer.id}`)
    return customer
  } catch (error) {
    logger.error('Error creating/retrieving Stripe customer:', error)
    throw error
  }
}

/**
 * Create a subscription for the Instagram monthly plan
 */
export async function createSubscription(
  customerId: string,
  priceId: string = PLANS.INSTAGRAM_MONTHLY.priceId,
  metadata?: Record<string, string>
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: metadata || {},
    })

    logger.info(`Subscription created: ${subscription.id}`)
    return subscription
  } catch (error) {
    logger.error('Error creating subscription:', error)
    throw error
  }
}

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession(
  customerId: string,
  priceId: string = PLANS.INSTAGRAM_MONTHLY.priceId,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>
): Promise<Stripe.Checkout.Session> {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata || {},
      subscription_data: {
        metadata: metadata || {},
      },
    })

    logger.info(`Checkout session created: ${session.id}`)
    return session
  } catch (error) {
    logger.error('Error creating checkout session:', error)
    throw error
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd,
    })

    logger.info(`Subscription ${subscriptionId} ${cancelAtPeriodEnd ? 'scheduled for cancellation' : 'cancelled immediately'}`)
    return subscription
  } catch (error) {
    logger.error('Error cancelling subscription:', error)
    throw error
  }
}

/**
 * Resume a cancelled subscription
 */
export async function resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    })

    logger.info(`Subscription resumed: ${subscriptionId}`)
    return subscription
  } catch (error) {
    logger.error('Error resuming subscription:', error)
    throw error
  }
}

/**
 * Retrieve subscription details
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription
  } catch (error) {
    logger.error('Error retrieving subscription:', error)
    throw error
  }
}

/**
 * List all subscriptions for a customer
 */
export async function listCustomerSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      expand: ['data.latest_invoice', 'data.customer'],
    })

    return subscriptions.data
  } catch (error) {
    logger.error('Error listing subscriptions:', error)
    throw error
  }
}

/**
 * Get payment history (invoices) for a customer
 */
export async function getPaymentHistory(customerId: string, limit = 10): Promise<Stripe.Invoice[]> {
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
      expand: ['data.charge', 'data.subscription'],
    })

    return invoices.data
  } catch (error) {
    logger.error('Error retrieving payment history:', error)
    throw error
  }
}

/**
 * Get upcoming invoice (for subscription preview)
 */
export async function getUpcomingInvoice(customerId: string, subscriptionId?: string): Promise<Stripe.Invoice> {
  try {
    const params: Stripe.InvoiceRetrieveUpcomingParams = {
      customer: customerId,
    }

    if (subscriptionId) {
      params.subscription = subscriptionId
    }

    const invoice = await stripe.invoices.retrieveUpcoming(params)
    return invoice
  } catch (error) {
    logger.error('Error retrieving upcoming invoice:', error)
    throw error
  }
}

/**
 * Create a payment intent (for one-time payments)
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = 'jpy',
  customerId?: string,
  metadata?: Record<string, string>
): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      metadata: metadata || {},
      automatic_payment_methods: { enabled: true },
    })

    logger.info(`Payment intent created: ${paymentIntent.id}`)
    return paymentIntent
  } catch (error) {
    logger.error('Error creating payment intent:', error)
    throw error
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
    return event
  } catch (error) {
    logger.error('Webhook signature verification failed:', error)
    throw new Error('Webhook signature verification failed')
  }
}

/**
 * Get revenue metrics
 */
export async function getRevenueMetrics(startDate?: Date, endDate?: Date) {
  try {
    const params: Stripe.InvoiceListParams = {
      status: 'paid',
      limit: 100,
    }

    if (startDate) {
      params.created = {
        gte: Math.floor(startDate.getTime() / 1000),
      }
    }

    if (endDate) {
      params.created = {
        ...params.created,
        lte: Math.floor(endDate.getTime() / 1000),
      }
    }

    const invoices = await stripe.invoices.list(params)

    const totalRevenue = invoices.data.reduce((sum, invoice) => sum + (invoice.amount_paid || 0), 0)
    const totalInvoices = invoices.data.length
    const successfulPayments = invoices.data.filter(inv => inv.status === 'paid').length

    return {
      totalRevenue,
      totalInvoices,
      successfulPayments,
      currency: 'jpy',
      invoices: invoices.data,
    }
  } catch (error) {
    logger.error('Error retrieving revenue metrics:', error)
    throw error
  }
}

export { stripe }
