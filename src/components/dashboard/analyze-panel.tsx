"use client";

import { useActionState, useEffect } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { analyzeWebsite } from "@/lib/actions/analyze";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalysisResultView } from "@/components/dashboard/analysis-result-view";

export function AnalyzePanel() {
  const [state, formAction, pending] = useActionState(analyzeWebsite, null);

  useEffect(() => {
    if (!state) return;
    if (!state.ok) toast.error(state.message);
    else if (state.saved) toast.success("Analysis complete — saved to your workspace.");
    else {
      toast.warning(
        "Analysis complete, but your reports table is missing. Run supabase/schema.sql to enable saving history.",
      );
    }
  }, [state]);

  return (
    <div className="space-y-8">
      <CardShell>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="url"
                name="url"
                type="url"
                required
                disabled={pending}
                placeholder="https://your-site.com"
                className="sm:flex-1"
              />
              <Button type="submit" disabled={pending} className="sm:w-40 shrink-0 gap-2">
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Analyzing
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Run analysis
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              We fetch public HTML server-side when possible, then ask the model for structured JSON scores.
            </p>
          </div>
        </form>
      </CardShell>

      {pending ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
      ) : null}

      {state?.ok ? (
        <AnalysisResultView url={state.url} overall={state.overall} payload={state.payload} />
      ) : null}
    </div>
  );
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass-panel rounded-2xl border border-border/70 p-5 sm:p-6">{children}</div>
  );
}
