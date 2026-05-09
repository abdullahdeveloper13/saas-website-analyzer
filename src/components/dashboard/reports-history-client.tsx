"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const scoreFilters = [
  { value: "0", label: "Any score" },
  { value: "70", label: "70+" },
  { value: "80", label: "80+" },
  { value: "90", label: "90+" },
];

export function ReportsHistoryClient({ reports }: { reports: ReportRow[] }) {
  const [q, setQ] = useState("");
  const [minScore, setMinScore] = useState("0");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const min = Number(minScore) || 0;
    return reports.filter((r) => {
      if (r.overall_score < min) return false;
      if (!needle) return true;
      return (
        r.url.toLowerCase().includes(needle) || (r.title ?? "").toLowerCase().includes(needle)
      );
    });
  }, [reports, q, minScore]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search URL or title…"
            className="pl-9"
          />
        </div>
        <div className="w-full sm:w-44">
          <Label className="text-xs text-muted-foreground">Minimum score</Label>
          <Select value={minScore} onValueChange={(v) => setMinScore(v ?? "0")}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {scoreFilters.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/70">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Site</TableHead>
              <TableHead className="w-24">Score</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead className="w-24 text-right">Open</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center text-sm text-muted-foreground">
                  No reports match your filters.
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
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {new Date(r.created_at).toLocaleString()}
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
    </div>
  );
}
