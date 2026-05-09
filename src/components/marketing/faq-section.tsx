"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Do you store the full HTML of my site?",
    a: "We only keep a trimmed text snippet for model context, your URL, scores, and structured JSON feedback in Supabase. You control deletion from the history view.",
  },
  {
    q: "What model powers the analysis?",
    a: "Production mode uses OpenAI GPT-4o-mini with JSON-only responses. Without OPENAI_API_KEY, the app serves a deterministic mock so you can build the UI first.",
  },
  {
    q: "Can I use this for client reporting?",
    a: "Yes — copy the report to your clipboard or export a PDF from the dashboard cards. Stripe-ready subscription tables are included for future gating.",
  },
  {
    q: "Is my dashboard protected?",
    a: "Routes under /dashboard require a Supabase session. Middleware refreshes cookies on every navigation so sessions stay fresh.",
  },
];

export function FaqSection() {
  return (
    <section className="border-t border-border/60 bg-muted/20 py-20 dark:bg-muted/10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="text-center"
        >
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Questions, answered</h2>
          <p className="mt-3 text-muted-foreground">
            Straightforward defaults so you can go from clone to customer demo quickly.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="mt-10"
        >
          <Accordion multiple={false} defaultValue={[]} className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`} className="border-border/70">
                <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
