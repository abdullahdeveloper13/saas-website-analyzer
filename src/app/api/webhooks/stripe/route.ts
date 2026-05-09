import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { clearSubscriptionFromStripe, upsertSubscriptionFromStripe } from "@/lib/stripe/sync-subscription";

/**
 * Stripe webhook — configure endpoint in Dashboard → Developers → Webhooks.
 * Required env: STRIPE_WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY
 */
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 501 });
  }

  const body = await req.text();
  const headerList = await headers();
  const sig = headerList.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const subId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId, {
            expand: ["items.data"],
          });
          await upsertSubscriptionFromStripe(sub);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const thin = event.data.object as Stripe.Subscription;
        const sub = await stripe.subscriptions.retrieve(thin.id, {
          expand: ["items.data"],
        });
        await upsertSubscriptionFromStripe(sub);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await clearSubscriptionFromStripe(sub);
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error("[stripe webhook]", e);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
