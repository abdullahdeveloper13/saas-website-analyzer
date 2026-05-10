"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type SubscriptionRow = {
  plan: string;
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
};

type PaidPlan = "pro" | "team";
type BillingInterval = "monthly" | "annual";

const paidPlans: Array<{
  id: PaidPlan;
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  description: string;
  features: string[];
  highlight?: boolean;
}> = [
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: "$24",
    annualPrice: "$240",
    description: "For creators shipping landing-page improvements every week.",
    features: ["Unlimited analyses", "GPT structured reports", "PDF export", "Analytics charts"],
    highlight: true,
  },
  {
    id: "team",
    name: "Express",
    monthlyPrice: "$59",
    annualPrice: "$590",
    description: "For small teams that need faster insights and premium support.",
    features: ["Everything in Pro", "Priority support", "Admin panel scaffold", "Shared workspace"],
  },
];

export function BillingSection({
  subscription,
  checkoutSuccess,
}: {
  subscription: SubscriptionRow | null;
  checkoutSuccess: boolean;
}) {
  const router = useRouter();
  const [portalLoading, setPortalLoading] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [loadingPlan, setLoadingPlan] = useState<PaidPlan | null>(null);

  useEffect(() => {
    if (checkoutSuccess) {
      toast.success("Subscription updated — thanks for upgrading.");
      router.replace("/dashboard/settings", { scroll: false });
    }
  }, [checkoutSuccess, router]);

  const isPaid = Boolean(
    subscription &&
    (subscription.status === "active" ||
      subscription.status === "trialing" ||
      subscription.status === "past_due") &&
    subscription.plan !== "free",
  );

  async function openPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing-portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Could not open billing portal");
        return;
      }
      if (data.url) window.location.href = data.url;
    } finally {
      setPortalLoading(false);
    }
  }

  async function startCheckout(plan: PaidPlan) {
    setLoadingPlan(plan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, interval }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Could not start checkout");
        return;
      }
      if (!data.url) {
        toast.error("Stripe did not return a checkout URL");
        return;
      }
      window.location.href = data.url;
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <Card className="glass-panel border-border/70 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Billing</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your plan via Stripe. Webhooks keep this workspace in sync.
          </p>
        </div>
        {isPaid && subscription ? (
          <Badge variant="secondary" className="capitalize">
            {subscription.plan} · {subscription.status}
          </Badge>
        ) : (
          <Badge variant="outline">Free</Badge>
        )}
      </div>

      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Plan</dt>
          <dd className="font-medium capitalize">{subscription?.plan ?? "free"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Status</dt>
          <dd className="font-medium">{subscription?.status ?? "inactive"}</dd>
        </div>
        {subscription?.current_period_end ? (
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Current period ends</dt>
            <dd className="font-medium">
              {new Date(subscription.current_period_end).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-6 flex flex-wrap gap-3">
        {subscription?.stripe_customer_id ? (
          <Button type="button" variant="outline" className="gap-2" disabled={portalLoading} onClick={() => void openPortal()}>
            {portalLoading ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
            Manage billing
          </Button>
        ) : null}
        <Button type="button" className="gap-2" onClick={() => setPlansOpen(true)}>
          <CreditCard className="size-4" />
          {isPaid ? "Change plan" : "View plans"}
        </Button>
      </div>

      <Dialog open={plansOpen} onOpenChange={setPlansOpen}>
        <DialogContent className="max-h-[min(90vh,46rem)] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Choose your plan</DialogTitle>
            <DialogDescription>
              Pick a package for this logged-in workspace and continue in Stripe Checkout.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={interval} onValueChange={(value) => setInterval(value as BillingInterval)}>
            <TabsList className="mx-auto">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="annual">Annual</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid gap-4 sm:grid-cols-2">
            {paidPlans.map((plan) => (
              <Card
                key={plan.id}
                className={cn(
                  "flex h-full flex-col border-border/70 p-5",
                  plan.highlight && "border-primary/50 ring-2 ring-primary/20",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold">{plan.name}</h3>
                  {plan.highlight ? <Badge>Popular</Badge> : null}
                </div>
                <p className="mt-2 min-h-10 text-sm text-muted-foreground">{plan.description}</p>
                <p className="mt-5 text-3xl font-semibold tabular-nums">
                  {interval === "annual" ? plan.annualPrice : plan.monthlyPrice}
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    / {interval === "annual" ? "yr" : "mo"}
                  </span>
                </p>
                {interval === "annual" ? (
                  <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">Save about 2 months</p>
                ) : null}
                <ul className="mt-5 flex-1 space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  variant={plan.highlight ? "default" : "outline"}
                  className="mt-6 w-full gap-2"
                  disabled={loadingPlan !== null || (isPaid && subscription?.plan === plan.id)}
                  onClick={() => void startCheckout(plan.id)}
                >
                  {loadingPlan === plan.id ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
                  {isPaid && subscription?.plan === plan.id ? "Current plan" : `Continue with ${plan.name}`}
                </Button>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
