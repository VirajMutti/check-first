// Tests for the English report builder (lib/report.ts).

import { describe, expect, it } from "vitest";
import type { AiAnalysis } from "./analysis";
import { combineResults } from "./combine";
import { buildEnglishReport } from "./report";

const aiAnalysis: AiAnalysis = {
  risk: "high",
  scamType: "visa_job_abroad",
  redFlags: [{ flag: "Guaranteed visa", explanation: "No one can guarantee a visa." }],
  nextSteps: ["Do not pay."],
  summary: "Fake visa offer.",
  extractedText: "",
  reportEnglish: "Someone offered a guaranteed visa for $1,500 via Zelle.",
};

describe("buildEnglishReport", () => {
  it("uses the AI's English report when there is one", () => {
    const result = combineResults("msg", { score: 0, risk: "low", matches: [] }, aiAnalysis, "gemini", null, false);
    expect(buildEnglishReport(result)).toBe(aiAnalysis.reportEnglish);
  });

  it("falls back to a template with the warning signs and the message", () => {
    const rules = {
      score: 70,
      risk: "high" as const,
      matches: [
        { category: "payment" as const, matchedText: "gift cards", weight: 30 },
        { category: "secrecy" as const, matchedText: "don't tell anyone", weight: 25 },
      ],
    };
    const result = combineResults("Pay with gift cards. Don't tell anyone.", rules, null, null, "offline", false);
    const report = buildEnglishReport(result);
    expect(report).toContain("strange way to pay");
    expect(report).toContain("keep it secret");
    expect(report).toContain('"Pay with gift cards. Don\'t tell anyone."');
  });

  it("cuts very long messages short", () => {
    const long = "a".repeat(2000);
    const result = combineResults(long, { score: 0, risk: "low", matches: [] }, null, null, "offline", false);
    expect(buildEnglishReport(result).length).toBeLessThan(800);
  });
});
