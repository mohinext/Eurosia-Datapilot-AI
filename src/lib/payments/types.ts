/**
 * Universal Payment Provider Interface
 * Supports Stripe and local Bangladeshi gateways (SSLCommerz, bKash, etc.)
 */
export interface PaymentProvider {
  id: string;
  name: string;
  
  createCheckoutSession(params: {
    userId: string;
    planId: string;
    amount: number;
    currency: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ url: string; sessionId: string }>;

  verifyPayment(payload: any): Promise<boolean>;
  
  handleWebhook(header: string, body: any): Promise<void>;
}

export interface SubscriptionStatus {
  active: boolean;
  planId: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'none';
  currentPeriodEnd: Date;
}
