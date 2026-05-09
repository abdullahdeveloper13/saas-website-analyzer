"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Gauge,
  LayoutTemplate,
  LineChart,
  Palette,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Type,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: LayoutTemplate,
    title: "UI / UX narratives",
    body: "Heuristic review of hierarchy, spacing rhythm, and primary flows — written for humans, not robots.",
  },
  {
    icon: Smartphone,
    title: "Responsive thinking",
    body: "Mobile-first breakpoints, tap targets, and content reflow risks called out explicitly.",
  },
  {
    icon: ShieldCheck,
    title: "Accessibility posture",
    body: "Color contrast, semantics, and keyboard risks summarized with pragmatic fixes.",
  },
  {
    icon: LineChart,
    title: "SEO surface area",
    body: "Titles, headings, and indexability cues reviewed from the captured snippet.",
  },
  {
    icon: Gauge,
    title: "Performance story",
    body: "Perceived performance and payload discipline — aligned with how buyers feel speed.",
  },
  {
    icon: Palette,
    title: "Color system",
    body: "Brand restraint, accent usage, and neutral balance for premium SaaS aesthetics.",
  },
  {
    icon: Type,
    title: "Typography craft",
    body: "Scale, line length, and weight pairing to keep long-form sections readable.",
  },
  {
    icon: BarChart3,
    title: "CTA effectiveness",
    body: "Primary vs secondary actions, repetition, and clarity of the next step.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mx-auto max-w-2xl text-center"
      >
        <p className="inline-flex items-center gap-2 text-sm font-medium text-primary">
          <Sparkles className="size-4" />
          Feature depth
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Everything in one structured critique
        </h1>
        <p className="mt-4 text-muted-foreground">
          Eight scored dimensions mirror how great teams review marketing sites — from craft details to growth mechanics.
        </p>
      </motion.div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
          >
            <Card className="glass-panel h-full border-border/70 p-5 transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-md">
              <f.icon className="size-9 rounded-lg bg-primary/12 p-2 text-primary" />
              <h2 className="mt-4 text-base font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
