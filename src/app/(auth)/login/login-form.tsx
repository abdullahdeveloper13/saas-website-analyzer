"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"idle" | "password" | "magic">("idle");

  async function signInPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading("password");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading("idle");
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed in");
    router.push(redirect);
    router.refresh();
  }

  async function signInMagic(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      toast.error("Enter your email for the magic link.");
      return;
    }
    setLoading("magic");
    const supabase = createClient();
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirect)}` },
    });
    setLoading("idle");
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Check your inbox for the magic link.");
  }

  return (
    <Card className="glass-panel border-border/70 p-6 shadow-xl sm:p-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to run analyses and view saved reports.
        </p>
      </div>

      <form onSubmit={signInPassword} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            required
            placeholder="you@company.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            required
            placeholder="••••••••"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading !== "idle"}>
          {loading === "password" ? "Signing in…" : "Sign in with password"}
        </Button>
      </form>

      <div className="relative my-8">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
          or
        </span>
      </div>

      <form onSubmit={signInMagic} className="space-y-4">
        <Button type="submit" variant="outline" className="w-full" disabled={loading !== "idle"}>
          {loading === "magic" ? "Sending link…" : "Email me a magic link"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </Card>
  );
}
