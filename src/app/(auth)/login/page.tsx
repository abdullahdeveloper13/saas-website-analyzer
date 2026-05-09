import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="glass-panel rounded-2xl border border-border/70 p-8">
          <Skeleton className="mx-auto h-8 w-48" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-8 h-10 w-full" />
          <Skeleton className="mt-4 h-10 w-full" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
