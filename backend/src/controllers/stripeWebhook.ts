import { Request, Response, NextFunction } from 'express'
import Stripe from 'stripe'
import { verifyWebhookSignature } from '../services/stripe.js'
import { logger } from '../utils/logger.js'

/**
 * Stripe Webhook Handler
 *
 * This controller handles all Stripe webhook events
 * Raw body parsing is required for signature verification
 */

/**
 * Handle Stripe webhook events
 * NOTE: This endpoint should NOT use express.json() middleware
 * Raw body is required for signature verification
 */
export const handleStripeWebhook = async (req: Request, res: Response, next: NextFunction) => {
  const signature = req.headers['stripe-signature'] as string

  if (!signature) {
    logger.error('Missing stripe-signature header')
    return res.status(400).json({ error: 'Missing signature' })
  }

  let event: Stripe.Event

  try {
    // Verify webhook signature
    event = verifyWebhookSignature(req.body, signature)
    logger.info(`Webhook verified: ${event.type}`)
  } catch (error) {
    logger.error('Webhook signature verification failed:', error)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'invoice.upcoming':
        await handleInvoiceUpcoming(event.data.object as Stripe.Invoice)
        break

      case 'customer.subscription.trial_will_end':
        await handleSubscriptionTrialWillEnd(event.data.object as Stripe.Subscription)
        break

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      default:
        logger.warn(`Unhandled event type: ${event.type}`)
    }

    // Return 200 to acknowledge receipt
    res.json({ received: true })
  } catch (error) {
    logger.error(`Error processing webhook ${event.type}:`, error)
    next(error)
  }
}

/**
 * Handle checkout session completed
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  logger.info(`Checkout session completed: ${session.id}`)

  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  // TODO: Update database with subscription info
  // Example:
  // await db.subscription.create({
  //   data: {
  //     userId: session.metadata?.userId,
  //     stripeCustomerId: customerId,
  //     stripeSubscriptionId: subscriptionId,
  //     status: 'active',
  //     currentPeriodStart: new Date(),
  //     currentPeriodEnd: new Date(),
  //   }
  // })

  logger.info(`Subscription ${subscriptionId} created for customer ${customerId}`)
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  logger.info(`Subscription created: ${subscription.id}`)

  const customerId = subscription.customer as string
  const userId = subscription.metadata?.userId

  // TODO: Create subscription record in database
  // await db.subscription.create({
  //   data: {
  //     userId: userId,
  //     stripeCustomerId: customerId,
  //     stripeSubscriptionId: subscription.id,
  //     status: subscription.status,
  //     currentPeriodStart: new Date(subscription.current_period_start * 1000),
  //     currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  //     cancelAtPeriodEnd: subscription.cancel_at_period_end,
  //   }
  // })

  logger.info(`Database updated for subscription ${subscription.id}`)
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  logger.info(`Subscription updated: ${subscription.id}`)

  // TODO: Update subscription in database
  // await db.subscription.update({
  //   where: { stripeSubscriptionId: subscription.id },
  //   data: {
  //     status: subscription.status,
  //     currentPeriodStart: new Date(subscription.current_period_start * 1000),
  //     currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  //     cancelAtPeriodEnd: subscription.cancel_at_period_end,
  //     canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
  //   }
  // })

  logger.info(`Subscription ${subscription.id} updated in database`)
}

/**
 * Handle subscription deleted/cancelled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  logger.info(`Subscription deleted: ${subscription.id}`)

  // TODO: Update subscription status to cancelled
  // await db.subscription.update({
  //   where: { stripeSubscriptionId: subscription.id },
  //   data: {
  //     status: 'cancelled',
  //     canceledAt: new Date(),
  //   }
  // })

  logger.info(`Subscription ${subscription.id} marked as cancelled`)
}

/**
 * Handle successful payment
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  logger.info(`Payment succeeded for invoice: ${invoice.id}`)

  const subscriptionId = invoice.subscription as string
  const customerId = invoice.customer as string

  // TODO: Record payment in database
  // await db.payment.create({
  //   data: {
  //     stripeInvoiceId: invoice.id,
  //     stripeSubscriptionId: subscriptionId,
  //     stripeCustomerId: customerId,
  //     amount: invoice.amount_paid,
  //     currency: invoice.currency,
  //     status: 'succeeded',
  //     paidAt: new Date(invoice.status_transitions.paid_at! * 1000),
  //   }
  // })

  // TODO: Send payment success email
  // await sendPaymentSuccessEmail(customerId, invoice)

  logger.info(`Payment recorded for invoice ${invoice.id}`)
}

/**
 * Handle failed payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  logger.error(`Payment failed for invoice: ${invoice.id}`)

  const subscriptionId = invoice.subscription as string
  const customerId = invoice.customer as string

  // TODO: Record failed payment
  // await db.payment.create({
  //   data: {
  //     stripeInvoiceId: invoice.id,
  //     stripeSubscriptionId: subscriptionId,
  //     stripeCustomerId: customerId,
  //     amount: invoice.amount_due,
  //     currency: invoice.currency,
  //     status: 'failed',
  //     failedAt: new Date(),
  //   }
  // })

  // TODO: Send payment failure notification
  // await sendPaymentFailedEmail(customerId, invoice)

  // TODO: Implement retry logic or subscription suspension
  logger.warn(`Payment failed for subscription ${subscriptionId}`)
}

/**
 * Handle upcoming invoice (reminder)
 */
async function handleInvoiceUpcoming(invoice: Stripe.Invoice) {
  logger.info(`Upcoming invoice: ${invoice.id}`)

  const customerId = invoice.customer as string
  const subscriptionId = invoice.subscription as string

  // TODO: Send upcoming payment reminder email
  // await sendUpcomingPaymentEmail(customerId, invoice)

  logger.info(`Reminder sent for upcoming invoice ${invoice.id}`)
}

/**
 * Handle trial ending soon
 */
async function handleSubscriptionTrialWillEnd(subscription: Stripe.Subscription) {
  logger.info(`Trial ending soon for subscription: ${subscription.id}`)

  const customerId = subscription.customer as string

  // TODO: Send trial ending notification
  // await sendTrialEndingEmail(customerId, subscription)

  logger.info(`Trial ending notification sent for ${subscription.id}`)
}

/**
 * Handle payment intent succeeded (one-time payments)
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  logger.info(`Payment intent succeeded: ${paymentIntent.id}`)

  const customerId = paymentIntent.customer as string

  // TODO: Record one-time payment
  // await db.payment.create({
  //   data: {
  //     stripePaymentIntentId: paymentIntent.id,
  //     stripeCustomerId: customerId,
  //     amount: paymentIntent.amount,
  //     currency: paymentIntent.currency,
  //     status: 'succeeded',
  //     paidAt: new Date(),
  //   }
  // })

  logger.info(`Payment intent ${paymentIntent.id} recorded`)
}

/**
 * Handle payment intent failed
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  logger.error(`Payment intent failed: ${paymentIntent.id}`)

  const customerId = paymentIntent.customer as string

  // TODO: Record failed payment attempt
  // TODO: Send failure notification

  logger.warn(`Payment failed for customer ${customerId}`)
}
