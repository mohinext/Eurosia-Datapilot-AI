import { PaymentProvider } from "./types";

/**
 * Placeholder for SSLCommerz (Popular in Bangladesh)
 */
export class SSLCommerzProvider implements PaymentProvider {
  id = "sslcommerz";
  name = "SSLCommerz";

  async createCheckoutSession() {
    // Implementation for SSLCommerz API
    return { url: "#", sessionId: "mock_ssl" };
  }

  async verifyPayment() {
    return true;
  }

  async handleWebhook() {
    // Logic to update user subscription based on SSLCommerz post-back
  }
}

/**
 * Placeholder for bKash
 */
export class BkashProvider implements PaymentProvider {
  id = "bkash";
  name = "bKash";

  async createCheckoutSession() {
    return { url: "#", sessionId: "mock_bkash" };
  }

  async verifyPayment() { return true; }
  async handleWebhook() { }
}
