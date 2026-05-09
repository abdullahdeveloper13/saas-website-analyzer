import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client for Client Components (forms, theme, realtime, etc.).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
