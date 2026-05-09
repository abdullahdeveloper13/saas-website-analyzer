import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PricingPageClient } from "@/components/marketing/pricing-page-client";

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl space-y-8 px-4 py-24">
          <Skeleton className="mx-auto h-10 w-2/3 max-w-md" />
          <Skeleton className="mx-auto h-4 w-1/2 max-w-lg" />
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-96 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
      }
    >
      <PricingPageClient />
    </Suspense>
  );
}
