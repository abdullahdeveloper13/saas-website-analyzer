import { createClient } from "@/lib/supabase/server";
import type { ReportRow } from "@/types/analysis";

/** Loads the signed-in user's reports (newest first) for dashboard + history views. */
export async function getReportsForCurrentUser(): Promise<ReportRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as ReportRow[];
}
