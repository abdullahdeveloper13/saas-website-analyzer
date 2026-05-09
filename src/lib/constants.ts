import type { ScoreKey } from "@/types/analysis";

/** Human-readable labels for each scoring dimension shown in the UI */
export const SCORE_LABELS: Record<ScoreKey, string> = {
  uiUx: "UI / UX",
  responsiveness: "Mobile responsiveness",
  accessibility: "Accessibility",
  seo: "SEO",
  performance: "Performance",
  colorUsage: "Color usage",
  typography: "Typography",
  cta: "CTA effectiveness",
};

export const SCORE_KEYS = Object.keys(SCORE_LABELS) as ScoreKey[];
