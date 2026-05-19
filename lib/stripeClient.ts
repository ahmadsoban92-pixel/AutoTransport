// lib/stripeClient.ts
// Server-side Stripe singleton. Import ONLY in API routes, never in client components.

import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (_stripe) return _stripe;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === "sk_test_REPLACE_ME") {
    throw new Error(
      "Stripe not configured: set STRIPE_SECRET_KEY in .env.local"
    );
  }

  _stripe = new Stripe(key, {
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
  });

  return _stripe;
}
