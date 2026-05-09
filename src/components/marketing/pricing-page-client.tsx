"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type Tier = {
  name: string;
  price: string;
  blurb: string;
  features: string[];
  cta: string;
  href: string;
  highlight: boolean;
  /** When set, logged-in users start Stripe Checkout for this plan */
  checkoutPlan?: "pro" | "team";
};

const tiers: Tier[] = [
  {
    name: "Starter",
    price: "$0",
    blurb: "Prototype the workflow and share mock analyses.",
    features: ["3 saved reports / month", "Mock mode without OpenAI", "Dashboard history", "Clipboard export"],
    cta: "Create account",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$24",
    blurb: "For founders shipping weekly landing experiments.",
    features: [
      "Unlimited analyses",
      "GPT-4o-mini structured JSON",
      "PDF export",
      "Analytics charts",
      "Stripe Checkout subscription",
    ],
    cta: "Start Pro",
    href: "/login",
    highlight: true,
    checkoutPlan: "pro",
  },
  {
    name: "Team",
    price: "$59",
    blurb: "Shared history with admin insights (structure included).",
    features: ["Everything in Pro", "Admin panel scaffold", "Priority roadmap slots", "Shared workspace (coming soon)"],
    cta: "Start Team",
    href: "/login",
    highlight: false,
    checkoutPlan: "team",
  },
];

async function startCheckout(plan: "pro" | "team") {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? "Checkout failed");
  }
  if (!data.url) {
    throw new Error("No checkout URL returned");
  }
  window.location.href = data.url;
}

export function PricingPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessionReady, setSessionReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<"pro" | "team" | null>(null);
  const autoStarted = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
      setSessionReady(true);
    });
  }, []);

  const loginRedirect = useCallback((plan: "pro" | "team") => {
    const next = `/pricing?plan=${plan}`;
    return `/login?redirect=${encodeURIComponent(next)}`;
  }, []);

  const handlePaidTier = useCallback(
    async (plan: "pro" | "team") => {
      if (!hasSession) {
        router.push(loginRedirect(plan));
        return;
      }
      setLoadingPlan(plan);
      try {
        await startCheckout(plan);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Checkout failed";
        toast.error(msg);
        setLoadingPlan(null);
      }
    },
    [hasSession, loginRedirect, router],
  );

  // After login, ?plan=pro|team triggers checkout once
  useEffect(() => {
    if (!sessionReady || !hasSession) return;
    const plan = searchParams.get("plan");
    if (plan !== "pro" && plan !== "team") return;
    if (autoStarted.current) return;
    autoStarted.current = true;
    void (async () => {
      setLoadingPlan(plan);
      try {
        await startCheckout(plan);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Checkout failed";
        toast.error(msg);
        autoStarted.current = false;
        setLoadingPlan(null);
      }
    })();
  }, [sessionReady, hasSession, searchParams]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl text-center"
      >
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Simple, transparent pricing</h1>
        <p className="mt-4 text-muted-foreground">
          Paid plans use Stripe Checkout. Add price IDs to your environment, then subscribe in one click while signed in.
        </p>
      </motion.div>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {tiers.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.06 }}
          >
            <Card
              className={cn(
                "glass-panel flex h-full flex-col border-border/70 p-6",
                t.highlight && "border-primary/50 ring-2 ring-primary/25",
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold">{t.name}</h2>
                {t.highlight ? (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                    Popular
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t.blurb}</p>
              <p className="mt-6 text-4xl font-semibold tabular-nums">
                {t.price}
                <span className="text-base font-normal text-muted-foreground"> / mo</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {t.checkoutPlan ? (
                <button
                  type="button"
                  disabled={loadingPlan !== null}
                  onClick={() => void handlePaidTier(t.checkoutPlan!)}
                  className={cn(
                    buttonVariants({ variant: t.highlight ? "default" : "outline" }),
                    "mt-8 w-full gap-2",
                  )}
                >
                  {loadingPlan === t.checkoutPlan ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Redirecting…
                    </>
                  ) : hasSession ? (
                    t.cta
                  ) : (
                    `Sign in to ${t.name}`
                  )}
                </button>
              ) : (
                <Link href={t.href} className={cn(buttonVariants({ variant: "outline" }), "mt-8 w-full")}>
                  {t.cta}
                </Link>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
