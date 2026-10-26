// Combines the two detection layers into the one result the user sees.

import type { AiAnalysis, AnalyzeResponse, ScamType } from "./analysis";
import type { RedFlagCategory, RulesResult } from "./redFlags";
import { higherRisk, type RiskLevel } from "./risk";
import resources from "@/data/resources.json";

/** Why the AI layer didn't run, if it didn't. */
export type AiSkipReason = Exclude<AnalyzeResponse, { ok: true }>["reason"] | "offline";

export interface CheckResult {
  rules: RulesResult;
  ai: AiAnalysis | null;
  aiSkipReason: AiSkipReason | null;
  /** True when only a screenshot was sent and the AI couldn't read it. */
  imageUnread: boolean;
  finalRisk: RiskLevel;
  scamType: ScamType;
  /** Which layers found anything risky ("rules", "ai", both, or none). */
  flaggedBy: ("rules" | "ai")[];
}

/** Without the AI, guess the scam type from the rules categories that fired. */
export function scamTypeFromRules(categories: RedFlagCategory[]): ScamType {
  const has = (c: RedFlagCategory) => categories.includes(c);
  if (has("notario")) return "immigration";
  if (has("guarantee")) return "visa_job_abroad";
  if (has("government")) return "government_impersonation";
  if (has("prize")) return "prize_lottery";
  if (categories.length === 0) return "none";
  return "other";
}

export function combineResults(
  rules: RulesResult,
  ai: AiAnalysis | null,
  aiSkipReason: AiSkipReason | null,
  imageUnread: boolean,
): CheckResult {
  // Final risk = the more dangerous of the two layers.
  const finalRisk = ai ? higherRisk(rules.risk, ai.risk) : rules.risk;

  const flaggedBy: ("rules" | "ai")[] = [];
  if (rules.risk !== "low") flaggedBy.push("rules");
  if (ai && ai.risk !== "low") flaggedBy.push("ai");

  // Prefer the AI's scam type; fall back to the rules guess.
  let scamType = ai?.scamType ?? scamTypeFromRules(rules.matches.map((m) => m.category));
  // If the rules say risky but the AI said "none", still show useful links.
  if (scamType === "none" && finalRisk !== "low") scamType = "other";

  return { rules, ai, aiSkipReason, imageUnread, finalRisk, scamType, flaggedBy };
}

/** Official link ids to show for a scam type (see data/resources.json). */
export function linksForScamType(scamType: ScamType): { id: string; url: string }[] {
  const ids: string[] = resources.scamTypeLinks[scamType] ?? resources.scamTypeLinks.other;
  const urls = resources.links as Record<string, string>;
  return ids.map((id) => ({ id, url: urls[id] }));
}
