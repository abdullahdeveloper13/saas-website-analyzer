"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(56,189,248,0.35),transparent),radial-gradient(ellipse_50%_40%_at_100%_0%,rgba(99,102,241,0.25),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(56,189,248,0.2),transparent),radial-gradient(ellipse_50%_40%_at_100%_0%,rgba(99,102,241,0.18),transparent)]" />
      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 md:pb-28 md:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-md dark:bg-background/40">
            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
            AI reviews that read like a senior design critique
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Turn any URL into a{" "}
            <span className="text-gradient">premium UX audit</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
            Structured feedback across UI/UX, responsiveness, accessibility, SEO, performance, visual craft, and CTAs — saved to your workspace with scores you can track over time.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link href="/signup" className={cn(buttonVariants({ size: "lg" }), "gap-2 px-6")}>
              Start analyzing
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/features"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "gap-2 border-border/80 bg-background/50 px-6 backdrop-blur-md dark:bg-background/30",
              )}
            >
              <PlayCircle className="size-4" />
              See features
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-14 max-w-4xl"
        >
          <div className="glass-panel relative rounded-2xl p-4 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { k: "UI / UX", v: "92", d: "Hierarchy & flows" },
                { k: "Accessibility", v: "88", d: "WCAG-oriented fixes" },
                { k: "Performance", v: "90", d: "Perceived speed" },
              ].map((item) => (
                <div
                  key={item.k}
                  className="rounded-xl border border-border/60 bg-background/40 p-4 transition-transform duration-300 hover:-translate-y-0.5 dark:bg-background/20"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {item.k}
                  </p>
                  <p className="mt-2 text-3xl font-semibold tabular-nums">{item.v}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.d}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-dashed border-border/70 bg-muted/30 p-4 text-left text-sm text-muted-foreground dark:bg-muted/15">
              Live analyses combine fetched page text with GPT-4o-mini structured JSON — or a deterministic mock when no API key is configured.
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
