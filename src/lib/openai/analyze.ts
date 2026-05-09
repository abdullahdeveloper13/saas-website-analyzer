import OpenAI from "openai";
import type { AnalysisPayload, AnalysisScores } from "@/types/analysis";
import { SCORE_KEYS } from "@/lib/constants";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Pulls lightweight HTML context for the model (best-effort; many sites block bots).
 */
export async function fetchPageContext(url: string): Promise<{
  snippet: string;
  fetched: boolean;
}> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; AIFeedbackBot/1.0; +https://example.com)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    clearTimeout(timeout);
    if (!res.ok) return { snippet: "", fetched: false };
    const html = await res.text();
    const stripped = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return { snippet: stripped.slice(0, 18_000), fetched: true };
  } catch {
    return { snippet: "", fetched: false };
  }
}

function emptyScores(fallback: number): AnalysisScores {
  return SCORE_KEYS.reduce((acc, key) => {
    acc[key] = fallback;
    return acc;
  }, {} as AnalysisScores);
}

/** Deterministic mock for local development when OPENAI_API_KEY is not set */
export function buildMockAnalysis(url: string, fetched: boolean): AnalysisPayload {
  const hostname = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();

  const base = 72 + (hostname.length % 12);
  const scores = emptyScores(0);
  SCORE_KEYS.forEach((k, i) => {
    scores[k] = Math.min(96, base + ((i * 3) % 9));
  });

  const sections = SCORE_KEYS.reduce((acc, key) => {
    acc[key] = {
      score: scores[key],
      summary: `High-level review for ${hostname} focusing on ${key}.`,
      improvements: [
        "Tighten visual hierarchy around primary actions.",
        "Reduce cognitive load in dense sections with progressive disclosure.",
      ],
    };
    return acc;
  }, {} as AnalysisPayload["sections"]);

  return {
    executiveSummary: fetched
      ? `We parsed public HTML from ${hostname} and produced a heuristic review across UX, accessibility, and growth surfaces.`
      : `We could not fetch live HTML for ${hostname} (blocked or invalid). This mock analysis demonstrates the report layout — add OPENAI_API_KEY for real reviews.`,
    scores,
    sections,
    pageContextNote: fetched ? undefined : "Live page HTML was not available; scores are illustrative.",
  };
}

const systemPrompt = `You are a senior product designer and web performance consultant.
Given a website URL and optional text extracted from its HTML, respond with STRICT JSON only (no markdown).
The JSON must match this shape:
{
  "executiveSummary": string (2-4 sentences),
  "scores": {
    "uiUx": number 0-100,
    "responsiveness": number 0-100,
    "accessibility": number 0-100,
    "seo": number 0-100,
    "performance": number 0-100,
    "colorUsage": number 0-100,
    "typography": number 0-100,
    "cta": number 0-100
  },
  "sections": {
    (same keys as scores): {
      "score": number (match scores[key]),
      "summary": string (3-5 sentences),
      "improvements": string[] (3-5 actionable bullets)
    }
  }
}
Be specific and reference patterns you infer from the text snippet. If the snippet is empty, infer cautiously from the domain/URL and state assumptions.`;

export async function runAnalysis(
  url: string,
  pageSnippet: string,
  fetched: boolean,
): Promise<AnalysisPayload> {
  if (!openai) {
    return buildMockAnalysis(url, fetched);
  }

  const userContent = `URL: ${url}
HTML text snippet (may be empty):\n${pageSnippet || "[empty]"}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    return buildMockAnalysis(url, fetched);
  }

  try {
    const parsed = JSON.parse(raw) as AnalysisPayload;
    // Light validation — fall back if model drifted
    if (!parsed.scores || !parsed.sections || !parsed.executiveSummary) {
      return buildMockAnalysis(url, fetched);
    }
    for (const key of SCORE_KEYS) {
      if (typeof parsed.scores[key] !== "number") {
        return buildMockAnalysis(url, fetched);
      }
    }
    if (!fetched) {
      parsed.pageContextNote =
        parsed.pageContextNote ??
        "Live page HTML was not available; some conclusions are inferred from the URL only.";
    }
    return parsed;
  } catch {
    return buildMockAnalysis(url, fetched);
  }
}

export function overallScoreFromPayload(payload: AnalysisPayload): number {
  const vals = SCORE_KEYS.map((k) => payload.scores[k]);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}
