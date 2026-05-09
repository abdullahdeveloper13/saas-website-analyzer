import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

type Plan = "free" | "pro" | "team";

function planFromMetadata(sub: Stripe.Subscription): Plan {
  const p = sub.metadata?.plan;
  if (p === "team") return "team";
  if (p === "pro") return "pro";
  return "pro";
}

/**
 * Upserts `public.subscriptions` from a Stripe Subscription object (webhook handlers).
 */
export async function upsertSubscriptionFromStripe(sub: Stripe.Subscription) {
  const userId = sub.metadata?.supabase_user_id;
  if (!userId) {
    console.warn("[stripe] subscription missing supabase_user_id metadata", sub.id);
    return;
  }

  const admin = createAdminClient();
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  if (!customerId) return;

  const plan = planFromMetadata(sub);
  const paidStatuses = ["active", "trialing", "past_due"];
  const isPaid = paidStatuses.includes(sub.status);

  // Stripe SDK v22+ exposes billing period on subscription items, not the root object.
  const primaryItem = sub.items?.data?.[0];
  const periodEndUnix = primaryItem?.current_period_end ?? null;

  await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      status: sub.status,
      plan: isPaid ? plan : "free",
      current_period_end: periodEndUnix ? new Date(periodEndUnix * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
}

/**
 * Marks billing as inactive when a subscription is fully removed / canceled.
 */
export async function clearSubscriptionFromStripe(sub: Stripe.Subscription) {
  const userId = sub.metadata?.supabase_user_id;
  if (!userId) return;

  const admin = createAdminClient();
  await admin
    .from("subscriptions")
    .update({
      stripe_subscription_id: null,
      status: "canceled",
      plan: "free",
      current_period_end: null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
}
