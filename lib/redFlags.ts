// Layer 1 of Check First: the offline rules engine.
//
// This runs in the browser, needs no internet and no API key, and gives a
// result even if the AI layer fails. The types below are the contract the
// rest of the app depends on — keep their shape the same.
//
// The scoring LOGIC inside analyzeWithRules is written by Viraj (see
// RULES_GUIDE.md and lib/redFlags.test.ts). AI tools only wrote the types and
// this stub.

import type { RiskLevel } from "./risk";

/** The kinds of red flags the rules engine looks for. */
export type RedFlagCategory =
  | "urgency" // threats or deadlines: arrest, deportation, account closed, "today only"
  | "payment" // unusual payment: gift cards, crypto, wire, Zelle, Western Union
  | "government" // pretending to be USCIS, IRS, SSA, ICE, police
  | "guarantee" // guaranteed visa, green card or job abroad
  | "upfront_fee" // pay a fee first to receive something
  | "secrecy" // "don't tell anyone"
  | "notario" // notario or consultant giving legal advice
  | "prize" // you won a prize or lottery
  | "link"; // suspicious links

/** One rule that fired on the message. */
export interface RuleMatch {
  category: RedFlagCategory;
  /** The exact words in the message that triggered the rule. */
  matchedText: string;
  /** How many points this match added to the score. */
  weight: number;
}

/** What the rules engine returns. */
export interface RulesResult {
  /** 0 (looks safe) to 100 (almost certainly a scam). */
  score: number;
  risk: RiskLevel;
  matches: RuleMatch[];
}

/**
 * Scores a message for scam warning signs using keyword/regex rules.
 *
 * STUB: always returns Low until Viraj writes the real logic.
 */
export function analyzeWithRules(text: string): RulesResult {
  // TODO(Viraj): replace this stub with your weighted keyword/regex scorer.
  void text;
  return { score: 0, risk: "low", matches: [] };
}
