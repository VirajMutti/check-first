"use client";

// Landing hero: one-line pitch + "Try an example" so the demo is one click.

import samples from "@/data/samples.json";
import { useI18n } from "@/lib/i18n";
import { ShieldLogo } from "./Icons";

export const SAMPLES = samples.samples;
/** The sample "Try an example" runs: the Punjabi fake visa agent. */
export const MAIN_SAMPLE_ID = "pa_visa_agent";

export function Hero({ onSample, disabled }: { onSample: (id: string) => void; disabled: boolean }) {
  const { t } = useI18n();

  return (
    <section className="overflow-hidden rounded-2xl bg-brand p-5 text-white sm:p-7">
      <div className="flex items-start gap-3">
        <ShieldLogo className="hidden h-14 w-14 shrink-0 rounded-xl bg-white p-1.5 sm:block" />
        <div>
          <h1 className="text-2xl leading-snug font-bold sm:text-3xl">{t("app.tagline")}</h1>
          <p className="mt-2 text-white/90">{t("hero.sub")}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onSample(MAIN_SAMPLE_ID)}
        disabled={disabled}
        className="btn mt-4 w-full bg-white text-lg text-brand hover:bg-white/90 sm:w-auto"
      >
        {t("hero.tryExample")}
      </button>

      <div className="mt-4">
        <p className="text-sm text-white/90">{t("hero.moreExamples")}</p>
        <ul className="mt-1 flex flex-wrap gap-2">
          {SAMPLES.filter((s) => s.id !== MAIN_SAMPLE_ID).map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onSample(s.id)}
                disabled={disabled}
                className="inline-flex min-h-11 items-center rounded-full border border-white/60 px-3 text-sm font-semibold hover:bg-white/10"
              >
                {t(`samples.${s.id}`)}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
