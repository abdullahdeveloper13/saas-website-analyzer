import { redirect } from "next/navigation";
import { BillingSection } from "@/components/dashboard/billing-section";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const sp = await searchParams;
  const checkoutSuccess = sp.checkout === "success";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/settings");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status, stripe_customer_id, stripe_subscription_id, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Profile & settings</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Update how your name appears in the workspace. Auth email is managed in Supabase.
        </p>
      </div>

      <BillingSection subscription={subscription ?? null} checkoutSuccess={checkoutSuccess} />

      <div>
        <h2 className="mb-4 text-lg font-semibold">Profile</h2>
        <SettingsForm defaultName={profile?.full_name ?? ""} />
      </div>
    </div>
  );
}
