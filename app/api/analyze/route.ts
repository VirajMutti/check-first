// Layer 2 of Check First: AI analysis with Claude.
//
// Runs only on the server, so ANTHROPIC_API_KEY never reaches the browser.
// We never store or log the user's message or screenshot.

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import {
  AiAnalysisSchema,
  AiOutputSchema,
  AnalyzeRequestSchema,
  type AnalyzeResponse,
} from "@/lib/analysis";
import { getLanguage } from "@/lib/languages";
import { allowRequest } from "@/lib/rateLimit";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
const AI_TIMEOUT_MS = 8000;

const SYSTEM_PROMPT = `You are Check First, a scam checker for immigrant families and seniors in Fremont, Union City, Hayward and the rest of California's 14th congressional district.
People forward you texts, WhatsApp messages, call notes or screenshots. Common scams here: fake USCIS/IRS/SSA/police/ICE calls, notarios or "immigration consultants" giving legal advice, fake travel/visa/job-abroad agents promising guaranteed visas, grandparent emergency calls, fake toll/package texts, prize scams, demands for gift cards, crypto, wire, Zelle or Western Union.

Rules:
- Judge the message itself. If it looks like a normal personal or business message, say risk "low", scamType "none", give no red flags.
- Each red flag: a short name plus ONE plain-language sentence a grandparent understands.
- nextSteps: 3 to 5 concrete actions (e.g. "Do not pay", "Call USCIS yourself at 800-375-5283 using the number on uscis.gov", "Ask a licensed lawyer or DOJ-accredited representative").
- summary: 1-2 sentences.
- Never tell the user to reply to, call back, or click anything in the suspicious message.
- You are not giving legal advice; point to official sources.
- extractedText: if an image was provided, copy the message text you can read from it (original language); otherwise "".
- Write flag, explanation, nextSteps and summary in the language the user asks for. Keep extractedText in its original language.`;

// Created lazily so a missing key doesn't crash the module at import time.
let client: Anthropic | null = null;
function getClient() {
  client ??= new Anthropic({ timeout: AI_TIMEOUT_MS, maxRetries: 0 });
  return client;
}

function reply(body: AnalyzeResponse, status: number) {
  return Response.json(body, { status });
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
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
  const languageName = getLanguage(language).englishName;

  // 3. Build the message: optional screenshot first, then the instructions.
  const content: Anthropic.ContentBlockParam[] = [];
  if (image) {
    content.push({
      type: "image",
      source: { type: "base64", media_type: image.mediaType, data: image.data },
    });
  }
  content.push({
    type: "text",
    text:
      `Answer in ${languageName}.\n\n` +
      (text.trim()
        ? `Message to check:\n"""\n${text}\n"""`
        : "Check the message in the screenshot."),
  });

  // 4. Ask Claude for strict JSON, then validate it again with zod.
  try {
    const response = await getClient().messages.parse({
      model: MODEL,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content }],
      // Low effort keeps answers fast enough for our 8 second limit.
      output_config: { effort: "low", format: zodOutputFormat(AiOutputSchema) },
    });

    // A refusal or cut-off answer is treated as a failure → rules fallback.
    if (response.stop_reason !== "end_turn" || !response.parsed_output) {
      return reply({ ok: false, reason: "ai_failed" }, 502);
    }

    const output = response.parsed_output;
    const checked = AiAnalysisSchema.safeParse({
      ...output,
      redFlags: output.redFlags.slice(0, 8),
      nextSteps: output.nextSteps.slice(0, 5),
    });
    if (!checked.success) {
      return reply({ ok: false, reason: "ai_failed" }, 502);
    }
    return reply({ ok: true, analysis: checked.data }, 200);
  } catch (error) {
    // Log only the error type, never the user's message.
    console.error("analyze failed:", error instanceof Error ? error.name : "unknown");
    return reply({ ok: false, reason: "ai_failed" }, 502);
  }
}
