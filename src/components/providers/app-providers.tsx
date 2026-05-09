"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

/**
 * Client-side providers mounted once at the root.
 * - `next-themes` powers light/dark toggling (class strategy on <html>).
 * - `sonner` renders toast notifications app-wide.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  );
}
