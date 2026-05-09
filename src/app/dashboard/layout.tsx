import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isAdminEmail } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  const showAdmin = isAdminEmail(user.email);

  return (
    <DashboardShell user={user} showAdmin={showAdmin}>
      {children}
    </DashboardShell>
  );
}
