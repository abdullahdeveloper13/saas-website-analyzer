import Stripe from "stripe";

/**
 * Stripe client factory — wire checkout + webhooks when you add billing.
 * Requires STRIPE_SECRET_KEY in production.
 */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, {
    typescript: true,
  });
}
