// Builds the English fraud report shown under "Report it in English".
// If the AI wrote one, we use it. Otherwise we fill in a simple template
// from the rules engine's findings, so this works offline too.

import en from "@/locales/en.json";
import type { CheckResult } from "./combine";

const MAX_QUOTE = 600; // characters of the original message to include

export function buildEnglishReport(result: CheckResult): string {
  const aiReport = result.ai?.reportEnglish.trim();
  if (aiReport) return aiReport;

  // Template: list the warning signs in English, then quote the message.
  const categories = [...new Set(result.rules.matches.map((m) => m.category))];
  const signs = categories.map((c) => en.categories[c].title.toLowerCase()).join(", ");
  const quote = result.message.trim().slice(0, MAX_QUOTE);

  return [
    "I received a message that appears to be a scam.",
    signs ? `Warning signs: ${signs}.` : "",
    quote ? `The message said: "${quote}${result.message.trim().length > MAX_QUOTE ? "…" : ""}"` : "",
  ]
    .filter(Boolean)
    .join(" ");
}
