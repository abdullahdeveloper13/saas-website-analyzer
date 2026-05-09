import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

type PaidPlan = "pro" | "team";

function priceIdForPlan(plan: PaidPlan): string | undefined {
  if (plan === "team") return process.env.STRIPE_PRICE_TEAM ?? process.env.STRIPE_PRICE_PRO;
  return process.env.STRIPE_PRICE_PRO;
}

function appOrigin(req: Request): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    new URL(req.url).origin
  );
}

/**
 * POST /api/checkout
 * Body: `{ "plan": "pro" | "team" }`
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
  try {
    const body = (await req.json()) as { plan?: string };
    if (body.plan === "team" || body.plan === "pro") plan = body.plan;
  } catch {
    /* default pro */
  }

  const priceId = priceIdForPlan(plan);
  if (!priceId) {
    return NextResponse.json(
      { error: "Missing STRIPE_PRICE_PRO (and optionally STRIPE_PRICE_TEAM) in environment" },
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
      },
    },
    metadata: {
      supabase_user_id: user.id,
      plan,
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Stripe did not return a checkout URL" }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
