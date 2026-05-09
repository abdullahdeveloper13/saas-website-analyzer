"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

const items = [
  {
    name: "Maya Chen",
    role: "Head of Product, Northwind",
    body: "We replaced a week of async design reviews with a single dashboard. The score breakdown makes prioritization obvious.",
    initials: "MC",
  },
  {
    name: "Jordan Blake",
    role: "Founder, LumenKit",
    body: "The accessibility and SEO sections caught issues our visual QA missed. Exporting PDFs for stakeholders is a nice touch.",
    initials: "JB",
  },
  {
    name: "Samira Patel",
    role: "Design Lead, Atlas CRM",
    body: "Feels like Linear-level polish. The glass cards and motion make dense feedback approachable for non-designers.",
    initials: "SP",
  },
];

export function TestimonialsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Loved by product teams</h2>
        <p className="mt-3 text-muted-foreground">
          Built for founders, marketers, and designers who want crisp narratives — not vague “make it pop” advice.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {items.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card className="glass-panel h-full border-border/70 p-6 transition-shadow duration-300 hover:shadow-lg">
              <Quote className="size-8 text-primary/40" />
              <p className="mt-4 text-sm leading-relaxed text-foreground/90">{t.body}</p>
              <div className="mt-6 flex items-center gap-3">
                <Avatar className="size-10 border border-border/60">
                  <AvatarFallback>{t.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
