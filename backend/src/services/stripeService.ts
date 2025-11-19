import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

const prisma = new PrismaClient();

const MONTHLY_PLAN_PRICE = 100000; // ¥100,000/month

export class StripeService {
  async createCustomer(data: { email: string; name: string }) {
    return stripe.customers.create({
      email: data.email,
      name: data.name,
    });
  }

  async createSubscription(data: {
    customerId: string;
    companyId: string;
  }) {
    // Create price if not exists
    const price = await stripe.prices.create({
      unit_amount: MONTHLY_PLAN_PRICE,
      currency: 'jpy',
      recurring: { interval: 'month' },
      product_data: {
        name: 'Instagram毎日投稿プラン',
        description: '栃木リフォームポータル 月額プラン（300社限定）',
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: data.customerId,
      items: [{ price: price.id }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // Save to database
    await prisma.subscription.create({
      data: {
        companyId: data.companyId,
        plan: 'instagram_daily',
        price: MONTHLY_PLAN_PRICE,
        status: 'pending',
        startDate: new Date(),
      },
    });

    return subscription;
  }

  async cancelSubscription(subscriptionId: string) {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);

    // Update database
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: { status: 'cancelled', endDate: new Date() },
    });

    return subscription;
  }

  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: { status: 'active' },
    });
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: { status: subscription.status },
    });
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: { status: 'cancelled', endDate: new Date() },
    });

    // Update company status
    const sub = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (sub) {
      await prisma.company.update({
        where: { id: sub.companyId },
        data: { subscriptionStatus: 'cancelled' },
      });
    }
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice) {
    // Create payment record
    await prisma.payment.create({
      data: {
        stripeInvoiceId: invoice.id,
        amount: invoice.amount_paid,
        status: 'succeeded',
        paidAt: new Date(invoice.status_transitions.paid_at! * 1000),
      },
    });
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    await prisma.payment.create({
      data: {
        stripeInvoiceId: invoice.id,
        amount: invoice.amount_due,
        status: 'failed',
      },
    });
  }

  async getSubscriptionStatus(companyId: string) {
    return prisma.subscription.findFirst({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRevenue(startDate: Date, endDate: Date) {
    const payments = await prisma.payment.findMany({
      where: {
        status: 'succeeded',
        paidAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    return { total, count: payments.length, payments };
  }
}
