/**
 * Shared types for AI analysis payloads stored in `reports.payload` (JSON)
 * and returned to the client.
 */
export type ScoreKey =
  | "uiUx"
  | "responsiveness"
  | "accessibility"
  | "seo"
  | "performance"
  | "colorUsage"
  | "typography"
  | "cta";

export type AnalysisScores = Record<ScoreKey, number>;

export interface AnalysisSection {
  score: number;
  summary: string;
  improvements: string[];
}

export type AnalysisSections = Record<ScoreKey, AnalysisSection>;

export interface AnalysisPayload {
  executiveSummary: string;
  scores: AnalysisScores;
  sections: AnalysisSections;
  /** Optional note when page HTML could not be fetched */
  pageContextNote?: string;
}

export interface ReportRow {
  id: string;
  user_id: string;
  url: string;
  title: string | null;
  overall_score: number;
  payload: AnalysisPayload;
  created_at: string;
}
