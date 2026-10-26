"use client";

// Shows the combined result: risk level, red flags from each layer,
// next steps, official links and share buttons.

import { useEffect, useRef, useState } from "react";
import { linksForScamType, type CheckResult } from "@/lib/combine";
import { useI18n } from "@/lib/i18n";
import type { RedFlagCategory } from "@/lib/redFlags";
import type { RiskLevel } from "@/lib/risk";
import { CopyIcon, RiskIcon, WhatsAppIcon } from "./Icons";
import { OfficialLinks } from "./OfficialLinks";
import { ReadAloud } from "./ReadAloud";

// Tailwind classes for each risk level. Color is always paired with an icon + label.
const RISK_STYLE: Record<RiskLevel, string> = {
  high: "bg-risk-high-bg text-risk-high border-risk-high",
  medium: "bg-risk-medium-bg text-risk-medium border-risk-medium",
  low: "bg-risk-low-bg text-risk-low border-risk-low",
};

export function ResultCard({ result, onReset }: { result: CheckResult; onReset: () => void }) {
  const { t, tList } = useI18n();
  const { rules, ai, finalRisk, scamType } = result;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [copied, setCopied] = useState(false);

  // Move keyboard/screen-reader focus to the result when it appears.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  // Each rules category only needs to be listed once, with every phrase it matched.
  const ruleCategories = [...new Set(rules.matches.map((m) => m.category))];
  const phrasesFor = (c: RedFlagCategory) => [
    ...new Set(rules.matches.filter((m) => m.category === c).map((m) => m.matchedText)),
  ];

  const summary = ai?.summary ?? t(`risk.summary.${finalRisk}`);
  // Use the AI's steps when we have them, otherwise safe default steps.
  const steps = ai && ai.nextSteps.length > 0 ? ai.nextSteps : tList(`defaultSteps.${finalRisk}`);
  const links = linksForScamType(scamType);

  const layerName = (layer: "rules" | "ai") => t(layer === "rules" ? "result.rulesLayer" : "result.aiLayer");
  const flaggedText =
    result.flaggedBy.length > 0
      ? t("result.flaggedBy", { layers: result.flaggedBy.map(layerName).join(" + ") })
      : t("result.flaggedByNone");

  // What "Read aloud" says: the verdict, the red flags, then the steps.
  const spokenText = [
    t(`risk.${finalRisk}`),
    summary,
    ...(ai?.redFlags.map((f) => `${f.flag}. ${f.explanation}`) ?? []),
    ...ruleCategories.map((c) => `${t(`categories.${c}.title`)}. ${t(`categories.${c}.explanation`)}`),
    t("result.nextSteps"),
    ...steps,
  ].join(". ");

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareText = t("shareText", { risk: t(`risk.${finalRisk}`), url: siteUrl });

  async function copyWarning() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard can be blocked; the WhatsApp button still works.
    }
  }

  return (
    <section aria-labelledby="result-heading" className="result-enter space-y-4">
      {/* 1. Risk banner */}
      <div className={`rounded-2xl border-2 p-5 ${RISK_STYLE[finalRisk]}`}>
        <div className="flex items-center gap-4">
          <RiskIcon risk={finalRisk} className="h-12 w-12 shrink-0" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide opacity-80">
              {t(`scamTypes.${scamType}`)}
            </p>
            <h2 id="result-heading" ref={headingRef} tabIndex={-1} className="text-3xl font-bold outline-none">
              {t(`risk.${finalRisk}`)}
            </h2>
          </div>
        </div>
        <p className="mt-3 text-lg text-ink">{summary}</p>
        <div className="mt-3">
          <ReadAloud text={spokenText} />
        </div>
      </div>

      {/* Fallback notices: shown when the AI layer didn't run */}
      {result.aiSkipReason && (
        <p role="status" className="rounded-xl border border-line bg-surface-muted px-4 py-3 text-ink-muted">
          {t(`fallback.${result.aiSkipReason}`)}
        </p>
      )}
      {result.imageUnread && (
        <p role="status" className="rounded-xl border border-risk-medium bg-risk-medium-bg px-4 py-3 text-ink">
          {t("fallback.imageOnly")}
        </p>
      )}

      {/* 2. How we decided: the two layers side by side */}
      <div className="card">
        <h3 className="card-title">{t("result.howDecided")}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <LayerBox title={t("result.rulesLayer")} hint={t("result.rulesLayerHint")} risk={rules.risk} detail={`${rules.score}/100`} />
          <LayerBox title={t("result.aiLayer")} hint={t("result.aiLayerHint")} risk={ai?.risk ?? null} />
        </div>
        <p className="mt-3 text-ink-muted">
          {flaggedText} {t("result.finalNote")}
        </p>
      </div>

      {/* 3. Red flags, grouped by the layer that found them */}
      <div className="card">
        <h3 className="card-title">{t("result.redFlags")}</h3>
        {ruleCategories.length === 0 && (!ai || ai.redFlags.length === 0) && (
          <p className="text-ink-muted">{t("result.noRedFlags")}</p>
        )}

        {ai && ai.redFlags.length > 0 && (
          <>
            <h4 className="layer-label">{t("result.aiLayer")}</h4>
            <ul className="space-y-3">
              {ai.redFlags.map((f, i) => (
                <li key={i} className="flag-item">
                  <strong className="block">{f.flag}</strong>
                  <span className="text-ink-muted">{f.explanation}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {ruleCategories.length > 0 && (
          <>
            <h4 className="layer-label">{t("result.rulesLayer")}</h4>
            <ul className="space-y-3">
              {ruleCategories.map((c) => (
                <li key={c} className="flag-item">
                  <strong className="block">{t(`categories.${c}.title`)}</strong>
                  <span className="text-ink-muted">{t(`categories.${c}.explanation`)}</span>
                  <span className="mt-1 flex flex-wrap gap-2">
                    <span className="sr-only">{t("result.matched")}:</span>
                    {phrasesFor(c).map((p) => (
                      <q key={p} className="rounded-md bg-surface-muted px-2 py-0.5 text-sm">
                        {p}
                      </q>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* 4. What to do now */}
      <div className="card">
        <h3 className="card-title">{t("result.nextSteps")}</h3>
        <ol className="list-decimal space-y-2 ps-6 text-lg">
          {steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </div>

      {/* 5. Verify it yourself */}
      <div className="card">
        <h3 className="card-title">{t("result.verify")}</h3>
        <p className="mb-3 text-ink-muted">{t("result.verifyHint")}</p>
        <OfficialLinks ids={links} />
      </div>

      {/* 6. Share with family — only when there's something to warn about */}
      {finalRisk !== "low" && (
      <div className="card">
        <h3 className="card-title">{t("result.share")}</h3>
        <p className="mb-3 rounded-lg bg-surface-muted p-3 text-ink-muted">{shareText}</p>
        <div className="flex flex-wrap gap-3">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn bg-whatsapp text-white"
          >
            <WhatsAppIcon /> {t("result.shareWhatsApp")}
          </a>
          <button type="button" onClick={copyWarning} className="btn btn-secondary">
            <CopyIcon /> {copied ? t("result.copied") : t("result.copy")}
          </button>
          <span aria-live="polite" className="sr-only">
            {copied ? t("result.copied") : ""}
          </span>
        </div>
      </div>
      )}

      <button type="button" onClick={onReset} className="btn btn-secondary w-full">
        {t("result.checkAnother")}
      </button>
    </section>
  );
}

function LayerBox({ title, hint, risk, detail }: { title: string; hint: string; risk: RiskLevel | null; detail?: string }) {
  const { t } = useI18n();
  return (
    <div className="rounded-xl border border-line p-3">
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-ink-muted">{hint}</p>
      {risk ? (
        <p className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-semibold ${RISK_STYLE[risk]}`}>
          <RiskIcon risk={risk} className="h-5 w-5" />
          {t(`risk.${risk}`)}
          {detail && <span className="font-normal opacity-80">· {detail}</span>}
        </p>
      ) : (
        <p className="mt-2 text-ink-muted">{t("result.notRun")}</p>
      )}
    </div>
  );
}
