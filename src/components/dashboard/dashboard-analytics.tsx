"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { SCORE_KEYS, SCORE_LABELS } from "@/lib/constants";
import type { ReportRow } from "@/types/analysis";

function averageDimensionScores(reports: ReportRow[]) {
  if (!reports.length) return null;
  const totals = SCORE_KEYS.reduce(
    (acc, k) => {
      acc[k] = 0;
      return acc;
    },
    {} as Record<(typeof SCORE_KEYS)[number], number>,
  );
  for (const r of reports) {
    for (const k of SCORE_KEYS) {
      totals[k] += r.payload.scores[k] ?? 0;
    }
  }
  const n = reports.length;
  return SCORE_KEYS.map((k) => ({
    subject: SCORE_LABELS[k],
    score: Math.round(totals[k] / n),
    fullMark: 100,
  }));
}

export function DashboardAnalytics({ reports }: { reports: ReportRow[] }) {
  const barData = useMemo(
    () =>
      [...reports]
        .reverse()
        .slice(-10)
        .map((r, i) => ({
          label: r.title ?? `R${i + 1}`,
          score: r.overall_score,
        })),
    [reports],
  );

  const radarData = useMemo(() => averageDimensionScores(reports.slice(0, 12)), [reports]);

  if (!reports.length) {
    return (
      <Card className="glass-panel border-dashed border-border/80 p-8 text-center text-sm text-muted-foreground">
        Run your first analysis to unlock trend charts and dimension averages.
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="glass-panel border-border/70 p-5">
        <h3 className="text-sm font-semibold">Recent overall scores</h3>
        <p className="text-xs text-muted-foreground">Last {barData.length} reports (chronological)</p>
        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid oklch(0.9 0.02 264)",
                  background: "oklch(1 0 0 / 0.92)",
                }}
              />
              <Bar dataKey="score" fill="oklch(0.55 0.18 264)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="glass-panel border-border/70 p-5">
        <h3 className="text-sm font-semibold">Dimension balance</h3>
        <p className="text-xs text-muted-foreground">Averaged across your latest {Math.min(reports.length, 12)} reports</p>
        <div className="mt-4 h-64 w-full">
          {radarData ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="78%" data={radarData}>
                <PolarGrid className="stroke-border/70" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="oklch(0.55 0.18 264)"
                  fill="oklch(0.55 0.18 264)"
                  fillOpacity={0.35}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
