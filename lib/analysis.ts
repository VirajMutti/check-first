// Shapes of the data that travels between the browser and /api/analyze.
// zod schemas give us TypeScript types AND runtime checks from one definition.

import { z } from "zod";
import { LANG_CODES } from "./languages";

/** Longest message we accept. Real scam texts are far shorter. */
export const MAX_TEXT_LENGTH = 4000;
/** Largest screenshot we accept, as a base64 string (~3 MB of image). */
export const MAX_IMAGE_BASE64_LENGTH = 4_000_000;

export const SCAM_TYPES = [
  "immigration", // fake USCIS, notario, immigration consultant
  "government_impersonation", // fake IRS, SSA, police, ICE
  "visa_job_abroad", // fake travel/visa agent, job abroad
  "prize_lottery",
  "family_emergency", // "grandparent" call
  "delivery_toll", // fake package or toll text
  "online_shopping",
  "other",
  "none", // looks safe
] as const;
export type ScamType = (typeof SCAM_TYPES)[number];

/** What the browser sends to /api/analyze. */
export const AnalyzeRequestSchema = z
  .object({
    text: z.string().max(MAX_TEXT_LENGTH).default(""),
    image: z
      .object({
        mediaType: z.enum(["image/png", "image/jpeg"]),
        data: z.string().max(MAX_IMAGE_BASE64_LENGTH), // base64, no "data:" prefix
      })
      .optional(),
    language: z.enum(LANG_CODES),
  })
  .refine((r) => r.text.trim().length > 0 || r.image, {
    message: "Send a message or a screenshot",
  });
export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

/**
 * What we ask Claude to return. Kept simple (no min/max rules) because
 * structured outputs only support basic JSON Schema.
 */
export const AiOutputSchema = z.object({
  risk: z.enum(["low", "medium", "high"]),
  scamType: z.enum(SCAM_TYPES),
  redFlags: z.array(z.object({ flag: z.string(), explanation: z.string() })),
  nextSteps: z.array(z.string()),
  summary: z.string(),
  /** Text Claude read from the screenshot, so the rules engine can check it too. */
  extractedText: z.string(),
});

/** The stricter shape the browser trusts, checked again after Claude replies. */
export const AiAnalysisSchema = AiOutputSchema.extend({
  redFlags: z.array(z.object({ flag: z.string().min(1), explanation: z.string().min(1) })).max(8),
  nextSteps: z.array(z.string().min(1)).min(1).max(5),
  summary: z.string().min(1),
});
export type AiAnalysis = z.infer<typeof AiAnalysisSchema>;

/** /api/analyze always answers with one of these two shapes. */
export type AnalyzeResponse =
  | { ok: true; analysis: AiAnalysis }
  | { ok: false; reason: "not_configured" | "rate_limited" | "bad_request" | "ai_failed" };
