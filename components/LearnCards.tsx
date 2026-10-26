"use client";

// /learn: six common scam cards. All text is bundled with the app, so this
// page works offline (with the service worker in public/sw.js).

import { useI18n } from "@/lib/i18n";
import { ReadAloud } from "./ReadAloud";

const CARDS = ["uscis_call", "notario", "visa_agent", "irs_ssa", "grandparent", "toll_package"] as const;

export function LearnCards() {
  const { t, tList } = useI18n();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[1.75rem] leading-[1.15] font-extrabold tracking-tight sm:text-[2.5rem]">{t("learn.title")}</h1>
        <p className="mt-2 text-ink-muted">{t("learn.intro")}</p>
      </div>

      {CARDS.map((id) => {
        const key = `learn.cards.${id}`;
        const signs = tList(`${key}.signs`);
        const spoken = [t(`${key}.title`), t(`${key}.example`), ...signs, t(`${key}.action`)].join(". ");
        return (
          <article key={id} className="card space-y-3" aria-labelledby={`card-${id}`}>
            <h2 id={`card-${id}`} className="text-xl font-bold">
              {t(`${key}.title`)}
            </h2>
            <figure className="rounded-[var(--radius)] bg-surface-muted p-3">
              <figcaption className="text-sm font-semibold text-ink-muted">{t("learn.exampleLabel")}</figcaption>
              <blockquote className="mt-1 text-lg font-medium">{t(`${key}.example`)}</blockquote>
            </figure>
            <div>
              <h3 className="font-semibold">{t("learn.signsHeading")}</h3>
              <ul className="mt-1 list-disc space-y-1 ps-6">
                {signs.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="border-s-4 border-risk-low bg-risk-low-bg p-3">
              <h3 className="font-semibold">{t("learn.actionHeading")}</h3>
              <p>{t(`${key}.action`)}</p>
            </div>
            <ReadAloud text={spoken} />
          </article>
        );
      })}
    </div>
  );
}
