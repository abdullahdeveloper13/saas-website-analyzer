"use server";

import { revalidatePath } from "next/cache";
import { runWebsiteAnalysisPipeline } from "@/lib/analysis/pipeline";
import { createClient } from "@/lib/supabase/server";
import type { AnalysisPayload } from "@/types/analysis";

export type AnalyzeState =
  | { ok: true; reportId: string; payload: AnalysisPayload; overall: number; url: string }
  | { ok: false; message: string };

/**
 * Server Action: runs the shared analysis pipeline and inserts a `reports` row for the signed-in user.
 */
export async function analyzeWebsite(
  _prev: AnalyzeState | null,
  formData: FormData,
): Promise<AnalyzeState> {
  const urlRaw = String(formData.get("url") ?? "").trim();
  if (!urlRaw) {
    return { ok: false, message: "Please enter a URL." };
  }

  let result: Awaited<ReturnType<typeof runWebsiteAnalysisPipeline>>;
  try {
    result = await runWebsiteAnalysisPipeline(urlRaw);
  } catch {
    return { ok: false, message: "That does not look like a valid URL." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "You must be signed in to run an analysis." };
  }

  const { data, error } = await supabase
    .from("reports")
    .insert({
      user_id: user.id,
      url: result.normalizedUrl,
      title: result.title,
      overall_score: result.overall,
      payload: result.payload,
    })
    .select("id")
    .single();

  if (error) {
    return {
      ok: false,
      message:
        error.message ||
        "Could not save the report. Did you run supabase/schema.sql in your project?",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/history");

  return {
    ok: true,
    reportId: data.id,
    payload: result.payload,
    overall: result.overall,
    url: result.normalizedUrl,
  };
}
