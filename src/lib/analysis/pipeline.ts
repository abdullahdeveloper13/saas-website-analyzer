import { fetchPageContext, overallScoreFromPayload, runAnalysis } from "@/lib/openai/analyze";
import type { AnalysisPayload } from "@/types/analysis";

export type PipelineResult = {
  normalizedUrl: string;
  title: string | null;
  payload: AnalysisPayload;
  overall: number;
  fetchedHtml: boolean;
};

/**
 * Normalizes the URL, pulls HTML context, runs the model (or mock), and computes the overall score.
 * Shared by the Server Action and the HTTP API route.
 */
export async function runWebsiteAnalysisPipeline(urlRaw: string): Promise<PipelineResult> {
  let normalized = urlRaw.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }
  new URL(normalized);

  const { snippet, fetched } = await fetchPageContext(normalized);
  const payload = await runAnalysis(normalized, snippet, fetched);
  const overall = overallScoreFromPayload(payload);

  let title: string | null = null;
  try {
    title = new URL(normalized).hostname.replace(/^www\./, "");
  } catch {
    title = null;
  }

  return {
    normalizedUrl: normalized,
    title,
    payload,
    overall,
    fetchedHtml: fetched,
  };
}
