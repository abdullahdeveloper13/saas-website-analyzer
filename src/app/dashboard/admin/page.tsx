import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { isAdminEmail } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Admin scaffold — gate with `ADMIN_EMAILS` env. Extend with user search, plan overrides, etc.
 */
export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  const { count: ownReportCount } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Admin</h1>
        <Badge variant="secondary" className="text-xs">
          Structure only
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        This route is hidden from non-admin accounts. Wire your own policies, audit trails, and Stripe
        subscription management here.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-panel border-border/70 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Your reports (demo metric)</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{ownReportCount ?? 0}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Global aggregates require a service-role key in a secure Route Handler — never expose it to the browser.
          </p>
        </Card>
        <Card className="glass-panel border-border/70 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Next steps</p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>Add service-role queries in Route Handlers only.</li>
            <li>Listen to Stripe webhooks in `/api/webhooks/stripe`.</li>
            <li>Map customers to `public.subscriptions`.</li>
          </ul>
        </Card>
      </div>

      <Separator />

      <Card className="border-dashed border-border/80 bg-muted/20 p-6 text-sm text-muted-foreground">
        Placeholder admin table area — plug in TanStack Table, filters, and impersonation flows when you are ready.
      </Card>
    </div>
  );
}
