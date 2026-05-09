import { jsPDF } from "jspdf";
import type { AnalysisPayload } from "@/types/analysis";
import { SCORE_KEYS, SCORE_LABELS } from "@/lib/constants";

/** Builds a simple text PDF from a completed analysis (client-side). */
export function downloadReportPdf(input: {
  url: string;
  overall: number;
  payload: AnalysisPayload;
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  let y = margin;

  doc.setFontSize(18);
  doc.text("AI Website Feedback Report", margin, y);
  y += 28;

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 90);
  doc.text(`URL: ${input.url}`, margin, y);
  y += 16;
  doc.text(`Overall score: ${input.overall}`, margin, y);
  y += 24;

  doc.setTextColor(20, 20, 30);
  doc.setFontSize(11);
  doc.text("Executive summary", margin, y);
  y += 16;
  doc.setFontSize(10);
  const summaryLines = doc.splitTextToSize(input.payload.executiveSummary, 520);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 14 + 20;

  doc.setFontSize(11);
  doc.text("Scores", margin, y);
  y += 16;
  doc.setFontSize(10);
  for (const key of SCORE_KEYS) {
    const line = `${SCORE_LABELS[key]}: ${input.payload.scores[key]}`;
    doc.text(line, margin, y);
    y += 14;
    if (y > 760) {
      doc.addPage();
      y = margin;
    }
  }

  y += 10;
  doc.setFontSize(11);
  doc.text("Detailed sections", margin, y);
  y += 16;
  doc.setFontSize(10);

  for (const key of SCORE_KEYS) {
    const section = input.payload.sections[key];
    const heading = `${SCORE_LABELS[key]} (${section.score})`;
    if (y > 720) {
      doc.addPage();
      y = margin;
    }
    doc.setFont("helvetica", "bold");
    doc.text(heading, margin, y);
    doc.setFont("helvetica", "normal");
    y += 14;
    const sumLines = doc.splitTextToSize(section.summary, 520);
    doc.text(sumLines, margin, y);
    y += sumLines.length * 14 + 8;
    for (const imp of section.improvements) {
      const bullet = `• ${imp}`;
      const blines = doc.splitTextToSize(bullet, 500);
      doc.text(blines, margin + 8, y);
      y += blines.length * 14;
      if (y > 760) {
        doc.addPage();
        y = margin;
      }
    }
    y += 12;
  }

  doc.save(`website-feedback-${Date.now()}.pdf`);
}
