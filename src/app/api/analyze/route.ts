import { NextResponse } from "next/server";
import { runWebsiteAnalysisPipeline } from "@/lib/analysis/pipeline";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/analyze
 * JSON body: { "url": "https://example.com" }
 * Requires a valid Supabase session cookie (same as the dashboard action).
 * Returns the structured analysis payload without persisting — use the Server Action to save.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const url =
    typeof body === "object" && body !== null && "url" in body
      ? String((body as { url: unknown }).url ?? "")
      : "";

  if (!url.trim()) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  try {
    const result = await runWebsiteAnalysisPipeline(url);
    return NextResponse.json({
      url: result.normalizedUrl,
      title: result.title,
      overall: result.overall,
      payload: result.payload,
      fetchedHtml: result.fetchedHtml,
    });
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }
}
