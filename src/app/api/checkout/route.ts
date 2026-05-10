import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

type PaidPlan = "pro" | "team";
type BillingInterval = "monthly" | "annual";

function priceIdForPlan(plan: PaidPlan, interval: BillingInterval): string | undefined {
  if (interval === "annual") {
    if (plan === "team") {
      return (
        process.env.STRIPE_PRICE_TEAM_ANNUAL ??
        process.env.STRIPE_PRICE_TEAM_YEARLY ??
        process.env.STRIPE_PRICE_TEAM ??
        process.env.STRIPE_PRICE_PRO_ANNUAL ??
        process.env.STRIPE_PRICE_PRO_YEARLY ??
        process.env.STRIPE_PRICE_PRO
      );
    }
    return process.env.STRIPE_PRICE_PRO_ANNUAL ?? process.env.STRIPE_PRICE_PRO_YEARLY ?? process.env.STRIPE_PRICE_PRO;
  }

  if (plan === "team") {
    return process.env.STRIPE_PRICE_TEAM_MONTHLY ?? process.env.STRIPE_PRICE_TEAM ?? process.env.STRIPE_PRICE_PRO_MONTHLY ?? process.env.STRIPE_PRICE_PRO;
  }
  return process.env.STRIPE_PRICE_PRO_MONTHLY ?? process.env.STRIPE_PRICE_PRO;
}

function appOrigin(req: Request): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    new URL(req.url).origin
  );
}

/**
 * POST /api/checkout
 * Body: `{ "plan": "pro" | "team", "interval"?: "monthly" | "annual" }`
 * Returns `{ "url": string }` for redirect to Stripe Checkout (subscription mode).
 */
export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured (STRIPE_SECRET_KEY)" }, { status: 501 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let plan: PaidPlan = "pro";
  let interval: BillingInterval = "monthly";
  try {
    const body = (await req.json()) as { plan?: string; interval?: string };
    if (body.plan === "team" || body.plan === "pro") plan = body.plan;
    if (body.interval === "monthly" || body.interval === "annual") interval = body.interval;
  } catch {
    /* default pro */
  }

  const priceId = priceIdForPlan(plan, interval);
  if (!priceId) {
    return NextResponse.json(
      {
        error:
          "Missing Stripe price IDs. Set STRIPE_PRICE_PRO_MONTHLY/ANNUAL and optionally STRIPE_PRICE_TEAM_MONTHLY/ANNUAL.",
      },
      { status: 500 },
    );
  }

  const origin = appOrigin(req);

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let customerId = existing?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    const { error: upsertErr } = await supabase.from("subscriptions").upsert(
      {
        user_id: user.id,
        stripe_customer_id: customerId,
        plan: "free",
        status: "inactive",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (upsertErr) {
      return NextResponse.json({ error: upsertErr.message }, { status: 500 });
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard/settings?checkout=success`,
    cancel_url: `${origin}/pricing?checkout=cancel`,
    client_reference_id: user.id,
    subscription_data: {
      metadata: {
        supabase_user_id: user.id,
        plan,
        interval,
      },
    },
    metadata: {
      supabase_user_id: user.id,
      plan,
      interval,
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Stripe did not return a checkout URL" }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
