"use client";

import { useMemo } from "react";
import { toast } from "sonner";
import { Copy, Download } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SCORE_KEYS, SCORE_LABELS } from "@/lib/constants";
import { downloadReportPdf } from "@/lib/pdf-export";
import type { AnalysisPayload } from "@/types/analysis";

function formatReportText(url: string, overall: number, payload: AnalysisPayload): string {
  const lines: string[] = [
    `URL: ${url}`,
    `Overall: ${overall}`,
    "",
    payload.executiveSummary,
    "",
  ];
  for (const key of SCORE_KEYS) {
    const s = payload.sections[key];
    lines.push(`${SCORE_LABELS[key]} (${payload.scores[key]})`);
    lines.push(s.summary);
    lines.push(...s.improvements.map((i) => `• ${i}`));
    lines.push("");
  }
  return lines.join("\n");
}

export function AnalysisResultView({
  url,
  overall,
  payload,
}: {
  url: string;
  overall: number;
  payload: AnalysisPayload;
}) {
  const text = useMemo(() => formatReportText(url, overall, payload), [url, overall, payload]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Report copied");
    } catch {
      toast.error("Clipboard not available");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Latest analysis</h2>
          <p className="text-sm text-muted-foreground">{url}</p>
          {payload.pageContextNote ? (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">{payload.pageContextNote}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => copy()}>
            <Copy className="size-4" />
            Copy report
          </Button>
          <Button
            type="button"
            size="sm"
            className="gap-2"
            onClick={() => downloadReportPdf({ url, overall, payload })}
          >
            <Download className="size-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <Card className="glass-panel border-border/70 p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Overall score</p>
            <p className="text-4xl font-semibold tabular-nums">{overall}</p>
          </div>
          <Badge variant="secondary" className="text-xs">
            Saved to history
          </Badge>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-foreground/90">{payload.executiveSummary}</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {SCORE_KEYS.map((key, i) => {
          const section = payload.sections[key];
          const score = payload.scores[key];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.35 }}
            >
              <Card className="glass-panel h-full border-border/70 p-5 transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold">{SCORE_LABELS[key]}</h3>
                  <span className="text-sm tabular-nums text-muted-foreground">{score}</span>
                </div>
                <Progress value={score} className="mt-3" />
                <p className="mt-3 text-sm text-muted-foreground">{section.summary}</p>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {section.improvements.map((imp) => (
                    <li key={imp} className="flex gap-2 text-foreground/90">
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary/80" />
                      {imp}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
