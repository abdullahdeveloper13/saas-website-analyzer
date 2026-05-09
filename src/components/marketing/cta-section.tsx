"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-12"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-cyan-400/10" />
        <div className="relative">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to stress-test your next launch page?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Create a free account, paste a URL, and get a scored report in seconds — tuned for modern SaaS marketing sites.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup" className={cn(buttonVariants({ size: "lg" }), "min-w-[11rem] px-8")}>
              Create account
            </Link>
            <Link
              href="/pricing"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "min-w-[11rem] border-border/80 bg-background/50 backdrop-blur-md dark:bg-background/30",
              )}
            >
              View pricing
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
