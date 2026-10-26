// AI provider 1: Claude (Anthropic). Used when ANTHROPIC_API_KEY is set.

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { AiOutputSchema, type AiOutput } from "@/lib/analysis";
import { AI_TIMEOUT_MS, buildUserText, SYSTEM_PROMPT, type AiInput } from "./prompt";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

// Created lazily so a missing key doesn't crash the server at startup.
let client: Anthropic | null = null;

/** Returns Claude's answer, or null if it refused or was cut off. Throws on network/API errors. */
export async function analyzeWithClaude({ text, languageName, image }: AiInput): Promise<AiOutput | null> {
  client ??= new Anthropic({ timeout: AI_TIMEOUT_MS, maxRetries: 0 });

  // Optional screenshot first, then the instructions.
  const content: Anthropic.ContentBlockParam[] = [];
  if (image) {
    content.push({ type: "image", source: { type: "base64", media_type: image.mediaType, data: image.data } });
  }
  content.push({ type: "text", text: buildUserText(text, languageName) });

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content }],
    // Low effort keeps answers fast enough for our 8 second limit.
    output_config: { effort: "low", format: zodOutputFormat(AiOutputSchema) },
  });

  // A refusal or a cut-off answer counts as "no answer".
  if (response.stop_reason !== "end_turn") return null;
  return response.parsed_output ?? null;
}
