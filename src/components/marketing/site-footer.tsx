import Link from "next/link";
import { Sparkles } from "lucide-react";

const footerLinks = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/login", label: "Sign in" },
  { href: "/signup", label: "Create account" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
              <Sparkles className="size-4" />
            </span>
            AI Website Feedback
          </Link>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Ship sharper landing pages with structured AI critique across UX, accessibility, SEO, and performance.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {footerLinks.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} AI Website Feedback Platform. Built with Next.js & Supabase.
      </div>
    </footer>
  );
}
