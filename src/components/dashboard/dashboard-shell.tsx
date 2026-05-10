"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import {
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Shield,
  Sparkles,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({
  children,
  user,
  showAdmin,
}: {
  children: React.ReactNode;
  user: User;
  showAdmin: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const links = showAdmin ? [...nav, { href: "/dashboard/admin", label: "Admin", icon: Shield }] : nav;

  function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <nav className="flex flex-col gap-1">
        {links.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 border-r border-border/70 bg-sidebar/30 px-3 py-6 backdrop-blur-md md:flex md:flex-col">
        <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2 font-semibold">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
            <Sparkles className="size-4" />
          </span>
          <span className="text-sm">Feedback</span>
        </Link>
        <NavLinks />
        <div className="mt-auto space-y-2 border-t border-border/60 pt-4">
          <p className="truncate px-2 text-xs text-muted-foreground" title={user.email ?? ""}>
            {user.email}
          </p>
          <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => signOut()}>
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border/70 bg-background/80 px-4 backdrop-blur-md md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              nativeButton
              render={
                <Button variant="outline" size="icon-sm" aria-label="Open navigation">
                  <Menu className="size-4" />
                </Button>
              }
            />
            <SheetContent side="left" className="w-64">
              <SheetHeader>
                <SheetTitle>Workspace</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <NavLinks onNavigate={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          <span className="text-sm font-medium">Dashboard</span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {mounted && resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </header>

        <header className="hidden h-14 items-center justify-end gap-2 border-b border-border/50 bg-background/50 px-6 backdrop-blur-md md:flex">
          <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mr-auto text-muted-foreground")}>
            Marketing site
          </Link>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {mounted && resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 px-4 py-6 sm:px-6 lg:px-10"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
