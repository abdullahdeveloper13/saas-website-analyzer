"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreditCard, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type SubscriptionRow = {
  plan: string;
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
};

export function BillingSection({
  subscription,
  checkoutSuccess,
}: {
  subscription: SubscriptionRow | null;
  checkoutSuccess: boolean;
}) {
  const router = useRouter();
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (checkoutSuccess) {
      toast.success("Subscription updated — thanks for upgrading.");
      router.replace("/dashboard/settings", { scroll: false });
    }
  }, [checkoutSuccess, router]);

  const isPaid =
    subscription &&
    (subscription.status === "active" ||
      subscription.status === "trialing" ||
      subscription.status === "past_due") &&
    subscription.plan !== "free";

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
        {!isPaid ? (
          <Link
            href="/pricing"
            className={cn(buttonVariants(), "gap-2")}
          >
            <ExternalLink className="size-4" />
            View plans
          </Link>
        ) : null}
      </div>
    </Card>
  );
}
