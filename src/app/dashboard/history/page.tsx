import { ReportsHistoryClient } from "@/components/dashboard/reports-history-client";
import { getReportsForCurrentUser } from "@/lib/data/reports";

export default async function HistoryPage() {
  const reports = await getReportsForCurrentUser();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Analysis history</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Filter by URL, title, or minimum score. Data lives in Supabase and respects row level security.
        </p>
      </div>
      <ReportsHistoryClient reports={reports} />
    </div>
  );
}
