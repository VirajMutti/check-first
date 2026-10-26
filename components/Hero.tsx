"use client";

// Landing hero: one-line pitch + "Try an example" so the demo is one click.

import samples from "@/data/samples.json";
import { useI18n } from "@/lib/i18n";

export const SAMPLES = samples.samples;
/** The sample "Try an example" runs: the Punjabi fake visa agent. */
export const MAIN_SAMPLE_ID = "pa_visa_agent";

export function Hero({ onSample, disabled }: { onSample: (id: string) => void; disabled: boolean }) {
  const { t } = useI18n();

  return (
    <section className="pt-2">
      <h1 className="text-[1.75rem] leading-[1.15] font-extrabold tracking-tight sm:text-[2.5rem]">{t("app.tagline")}</h1>
      <p className="mt-3 max-w-xl text-lg text-ink-muted">{t("hero.sub")}</p>

      <button
        type="button"
        onClick={() => onSample(MAIN_SAMPLE_ID)}
        disabled={disabled}
        className="btn btn-primary mt-5 w-full text-lg sm:w-auto"
      >
        {t("hero.tryExample")}
      </button>

      {/* Other samples as plain underlined text buttons, like links in a notice */}
      <div className="mt-4 flex flex-wrap items-baseline gap-x-1 gap-y-0 text-base">
        <span className="me-1 text-ink-muted">{t("hero.moreExamples")}</span>
        {SAMPLES.filter((s) => s.id !== MAIN_SAMPLE_ID).map((s, i, all) => (
          <span key={s.id} className="inline-flex items-center">
            <button
              type="button"
              onClick={() => onSample(s.id)}
              disabled={disabled}
              className="min-h-11 font-bold text-brand underline decoration-1 underline-offset-4 hover:decoration-2"
            >
              {t(`samples.${s.id}`)}
            </button>
            {i < all.length - 1 && <span aria-hidden="true" className="mx-1.5 text-ink-muted">·</span>}
          </span>
        ))}
      </div>
    </section>
  );
}
