"use client";

// The main "check a message" flow on the home page.
//
// 1. Rules engine runs instantly in the browser (works offline).
// 2. In parallel we ask /api/analyze (Claude). If that fails or takes more
//    than 8 seconds, we keep the rules result and show a small notice.
// 3. The two results are combined and shown in <ResultCard>.

import { useRef, useState } from "react";
import { MAX_TEXT_LENGTH, type AiAnalysis, type AnalyzeResponse } from "@/lib/analysis";
import { combineResults, type AiSkipReason, type CheckResult } from "@/lib/combine";
import { useI18n } from "@/lib/i18n";
import { prepareImage, type PreparedImage } from "@/lib/image";
import { analyzeWithRules } from "@/lib/redFlags";
import { ResultCard } from "./ResultCard";
import { UploadIcon } from "./Icons";

const AI_TIMEOUT_MS = 8000;

/** Calls the AI layer. Never throws: failures come back as a reason string. */
async function askAi(
  text: string,
  image: PreparedImage | null,
  language: string,
): Promise<{ analysis: AiAnalysis } | { reason: AiSkipReason }> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return { reason: "offline" };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  try {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        language,
        image: image ? { mediaType: image.mediaType, data: image.data } : undefined,
      }),
      signal: controller.signal,
    });
    const body = (await res.json()) as AnalyzeResponse;
    return body.ok ? { analysis: body.analysis } : { reason: body.reason };
  } catch {
    // Timeout, network error, or a non-JSON reply.
    return { reason: "ai_failed" };
  } finally {
    clearTimeout(timer);
  }
}

export function Checker() {
  const { t, lang } = useI18n();
  const [text, setText] = useState("");
  const [image, setImage] = useState<PreparedImage | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const textArea = useRef<HTMLTextAreaElement>(null);

  async function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be chosen again later
    if (!file) return;
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setError(t("form.badImage"));
      return;
    }
    try {
      setImage(await prepareImage(file));
      setError("");
    } catch {
      setError(t("form.badImage"));
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const message = text.slice(0, MAX_TEXT_LENGTH);
    if (!message.trim() && !image) {
      setError(t("form.empty"));
      textArea.current?.focus();
      return;
    }
    setError("");
    setChecking(true);

    // Layer 1: rules — instant and offline.
    let rules = analyzeWithRules(message);

    // Layer 2: AI — may fail; that's OK.
    const ai = await askAi(message, image, lang);
    const analysis = "analysis" in ai ? ai.analysis : null;

    // Screenshot only? Let the rules engine also read the text Claude extracted.
    if (!message.trim() && analysis?.extractedText) {
      rules = analyzeWithRules(analysis.extractedText);
    }
    const imageUnread = !message.trim() && !analysis;

    setResult(combineResults(rules, analysis, "reason" in ai ? ai.reason : null, imageUnread));
    setChecking(false);
  }

  function reset() {
    setResult(null);
    setText("");
    setImage(null);
    // Wait for the form to re-render, then focus it.
    setTimeout(() => textArea.current?.focus(), 0);
  }

  if (result) return <ResultCard result={result} onReset={reset} />;

  return (
    <form onSubmit={onSubmit} className="card space-y-5" noValidate aria-busy={checking}>
      <div>
        <label htmlFor="message" className="mb-2 block text-xl font-semibold">
          {t("form.messageLabel")}
        </label>
        <textarea
          id="message"
          ref={textArea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          dir="auto"
          placeholder={t("form.messagePlaceholder")}
          className="input min-h-40 w-full resize-y"
          aria-describedby={error ? "form-error" : undefined}
        />
        {text.length > MAX_TEXT_LENGTH && (
          <p className="mt-1 text-sm text-ink-muted">{t("form.tooLong", { max: MAX_TEXT_LENGTH })}</p>
        )}
      </div>

      <div>
        <p className="mb-2 font-semibold">
          {t("form.screenshotLabel")} <span className="font-normal text-ink-muted">({t("form.screenshotHint")})</span>
        </p>
        <input
          ref={fileInput}
          id="screenshot"
          type="file"
          accept="image/png,image/jpeg"
          onChange={onFileChosen}
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
        />
        {image ? (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- local data URL preview */}
            <img src={image.previewUrl} alt={t("form.screenshotAlt")} className="h-24 w-auto rounded-lg border border-line" />
            <button type="button" onClick={() => setImage(null)} className="btn btn-secondary">
              {t("form.removeScreenshot")}
            </button>
          </div>
        ) : (
          // A real button (keyboard-friendly) that opens the hidden file picker.
          <button type="button" onClick={() => fileInput.current?.click()} className="btn btn-secondary">
            <UploadIcon /> {t("form.screenshotButton")}
          </button>
        )}
      </div>

      {error && (
        <p id="form-error" role="alert" className="font-semibold text-risk-high">
          {error}
        </p>
      )}

      <button type="submit" disabled={checking} className="btn btn-primary w-full text-xl">
        {checking ? (
          <>
            <span className="spinner" aria-hidden="true" /> {t("form.checking")}
          </>
        ) : (
          t("form.submit")
        )}
      </button>
      <p className="text-center text-ink-muted">{t("app.privacy")}</p>
    </form>
  );
}
