// Layer 2 of Check First: AI analysis.
//
// Runs only on the server, so API keys never reach the browser.
// Uses Claude if ANTHROPIC_API_KEY is set, otherwise Gemini if GEMINI_API_KEY
// is set (free tier). We never store or log the user's message or screenshot.

import { analyzeWithClaude } from "@/lib/ai/claude";
import { analyzeWithGemini } from "@/lib/ai/gemini";
import { AiAnalysisSchema, AnalyzeRequestSchema, type AiProvider, type AnalyzeResponse } from "@/lib/analysis";
import { getLanguage } from "@/lib/languages";
import { allowRequest } from "@/lib/rateLimit";

/** Picks the AI provider from whichever key is configured. */
function chooseProvider(): AiProvider | null {
  if (process.env.ANTHROPIC_API_KEY) return "claude";
  if (process.env.GEMINI_API_KEY) return "gemini";
  return null;
}

function reply(body: AnalyzeResponse, status: number) {
  return Response.json(body, { status });
}

export async function POST(request: Request) {
  const provider = chooseProvider();
  if (!provider) {
    return reply({ ok: false, reason: "not_configured" }, 503);
  }

  // 1. Rate limit by IP address (Vercel puts the real IP first in this header).
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allowRequest(ip)) {
    return reply({ ok: false, reason: "rate_limited" }, 429);
  }

  // 2. Validate the input with zod (length caps live in the schema).
  const parsed = AnalyzeRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return reply({ ok: false, reason: "bad_request" }, 400);
  }
  const { text, image, language } = parsed.data;
  const input = { text, image, languageName: getLanguage(language).englishName };

  // 3. Ask the AI, then validate its answer again with the stricter zod schema.
  try {
    const output = provider === "claude" ? await analyzeWithClaude(input) : await analyzeWithGemini(input);
    if (!output) {
      return reply({ ok: false, reason: "ai_failed" }, 502);
    }

    const checked = AiAnalysisSchema.safeParse({
      ...output,
      redFlags: output.redFlags.slice(0, 8),
      nextSteps: output.nextSteps.slice(0, 5),
    });
    if (!checked.success) {
      return reply({ ok: false, reason: "ai_failed" }, 502);
    }
    return reply({ ok: true, analysis: checked.data, provider }, 200);
  } catch (error) {
    // Log only the error type, never the user's message.
    console.error(`analyze (${provider}) failed:`, error instanceof Error ? error.name : "unknown");
    return reply({ ok: false, reason: "ai_failed" }, 502);
  }
}
