"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReportRow } from "@/types/analysis";

export function RecentReportsTable({
  reports,
  maxRows = 6,
}: {
  reports: ReportRow[];
  maxRows?: number;
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = needle
      ? reports.filter(
          (r) =>
            r.url.toLowerCase().includes(needle) ||
            (r.title ?? "").toLowerCase().includes(needle),
        )
      : reports;
    return list.slice(0, maxRows);
  }, [reports, q, maxRows]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by URL or title…"
          className="pl-9"
        />
      </div>
      <div className="overflow-hidden rounded-xl border border-border/70">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Site</TableHead>
              <TableHead className="w-24">Score</TableHead>
              <TableHead className="hidden sm:table-cell">When</TableHead>
              <TableHead className="w-24 text-right">Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                  No reports match that filter yet.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{r.title ?? new URL(r.url).hostname}</span>
                      <span className="truncate text-xs text-muted-foreground">{r.url}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="tabular-nums">
                      {r.overall_score}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                    {new Date(r.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(buttonVariants({ variant: "ghost", size: "icon-xs" }), "inline-flex")}
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {reports.length > maxRows ? (
        <p className="text-center text-xs text-muted-foreground">
          Showing {filtered.length} of {reports.length}.{" "}
          <Link href="/dashboard/history" className="text-primary hover:underline">
            View all
          </Link>
        </p>
      ) : null}
    </div>
  );
}
