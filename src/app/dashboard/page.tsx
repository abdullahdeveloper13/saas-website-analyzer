import { AnalyzePanel } from "@/components/dashboard/analyze-panel";
import { DashboardAnalytics } from "@/components/dashboard/dashboard-analytics";
import { RecentReportsTable } from "@/components/dashboard/recent-reports-table";
import { getReportsForCurrentUser } from "@/lib/data/reports";

export default async function DashboardHomePage() {
  const reports = await getReportsForCurrentUser();

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Workspace overview</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Submit a public URL to generate a scored critique, then track how your experience evolves over time.
        </p>
      </div>

      <AnalyzePanel />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Analytics</h2>
          <p className="text-sm text-muted-foreground">Visualize score trends and category balance from saved reports.</p>
        </div>
        <DashboardAnalytics reports={reports.slice(0, 12)} />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Recent analyses</h2>
            <p className="text-sm text-muted-foreground">Search and open the original URLs in a new tab.</p>
          </div>
        </div>
        <RecentReportsTable reports={reports} maxRows={6} />
      </section>
    </div>
  );
}
