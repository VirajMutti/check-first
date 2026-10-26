// AI provider 2: Gemini (Google). Used when GEMINI_API_KEY is set and
// ANTHROPIC_API_KEY is not. Gemini has a free tier, which is why it's here.

import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { AiOutputSchema, type AiOutput } from "@/lib/analysis";
import { AI_TIMEOUT_MS, buildUserText, SYSTEM_PROMPT, type AiInput } from "./prompt";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

// The same zod schema Claude uses, turned into JSON Schema for Gemini.
const OUTPUT_JSON_SCHEMA = z.toJSONSchema(AiOutputSchema);

let client: GoogleGenAI | null = null;

/** Returns Gemini's answer, or null if it didn't finish or sent bad JSON. Throws on network/API errors. */
export async function analyzeWithGemini({ text, languageName, image }: AiInput): Promise<AiOutput | null> {
  client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Optional screenshot first, then the instructions.
  const input: Array<{ type: "text"; text: string } | { type: "image"; data: string; mime_type: string }> = [];
  if (image) input.push({ type: "image", data: image.data, mime_type: image.mediaType });
  input.push({ type: "text", text: buildUserText(text, languageName) });

  const interaction = await client.interactions.create(
    {
      model: MODEL,
      system_instruction: SYSTEM_PROMPT,
      input,
      // Ask for JSON that matches our schema.
      response_format: { type: "text", mime_type: "application/json", schema: OUTPUT_JSON_SCHEMA },
      // Less "thinking" = faster answers, to fit in 8 seconds.
      generation_config: { thinking_level: "low" },
      // Don't keep the request on Google's side for later retrieval.
      store: false,
    },
    { timeout_ms: AI_TIMEOUT_MS, retries: { strategy: "none" } },
  );

  if (interaction.status !== "completed" || !interaction.output_text) return null;

  // Gemini returns JSON as text; parse it and check it with zod.
  try {
    const parsed = AiOutputSchema.safeParse(JSON.parse(interaction.output_text));
    return parsed.success ? parsed.data : null;
  } catch {
    return null; // not valid JSON
  }
}
