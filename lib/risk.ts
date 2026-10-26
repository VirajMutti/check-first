// Shared risk helpers used by both detection layers (rules + AI).

/** The three risk levels Check First can report. */
export type RiskLevel = "low" | "medium" | "high";

// Ordered from least to most risky, so the array index works as a rank.
const ORDER: RiskLevel[] = ["low", "medium", "high"];

/** Returns whichever of the two risk levels is more dangerous. */
export function higherRisk(a: RiskLevel, b: RiskLevel): RiskLevel {
  return ORDER.indexOf(a) >= ORDER.indexOf(b) ? a : b;
}
