"use client";

// /help: for people who already paid or shared information.
// 1. "How did you pay?" → what to do right now (based on the FTC's official advice)
// 2. Real phone numbers for government agencies, with tap-to-call
// 3. What to say to a scammer, in the user's language

import resources from "@/data/resources.json";
import { useI18n } from "@/lib/i18n";
import { ReadAloud } from "./ReadAloud";
import { StepsPicker } from "./StepsPicker";

const URLS = resources.links as Record<string, string>;

export function HelpPage() {
  const { t, tList } = useI18n();
  const sayLines = tList("help.sayLines");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[1.75rem] leading-[1.15] font-extrabold tracking-tight sm:text-[2.5rem]">{t("help.title")}</h1>
        <p className="mt-2 text-lg">{t("help.intro")}</p>
      </div>

      {/* 1. Already paid */}
      <section aria-labelledby="paid-heading" className="space-y-3">
        <h2 id="paid-heading" className="text-xl font-bold">
          {t("help.paidTitle")}
        </h2>
        <StepsPicker
          name="paid-method"
          legend={t("help.paidTitle")}
          prefix="help.methods"
          options={resources.paidMethods}
          stepsHeading={t("help.doNow")}
          linksHeading={t("verify.linksHeading")}
        />
      </section>

      {/* 2. Real phone numbers */}
      <section aria-labelledby="phones-heading" className="card space-y-3">
        <h2 id="phones-heading" className="card-title mb-0">
          {t("help.phonesTitle")}
        </h2>
        <p className="text-ink-muted">{t("help.phonesIntro")}</p>
        <ul className="divide-y divide-line">
          {resources.phones.map((phone) => (
            <li key={phone.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <p className="font-semibold">{t(`help.phones.${phone.id}.name`)}</p>
                <p className="text-sm text-ink-muted">{t(`help.phones.${phone.id}.note`)}</p>
                {phone.source && (
                  <a
                    href={URLS[phone.source]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand underline"
                  >
                    {t("help.source")}
                  </a>
                )}
              </div>
              {/* dir="ltr" keeps the number in the right order in Dari */}
              <a
                href={`tel:${phone.number.replaceAll("-", "")}`}
                dir="ltr"
                className={`btn ${phone.id === "emergency" ? "bg-risk-high text-white" : "btn-secondary"}`}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
                  <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z" />
                </svg>
                <span className="sr-only">{t("help.call")} </span>
                {phone.number}
              </a>
            </li>
          ))}
        </ul>
        <p className="text-sm text-ink-muted">{t("help.checkedOn", { date: resources.verifiedOn })}</p>
      </section>

      {/* 3. What to say */}
      <section aria-labelledby="say-heading" className="card space-y-3">
        <h2 id="say-heading" className="card-title mb-0">
          {t("help.sayTitle")}
        </h2>
        <p className="text-ink-muted">{t("help.sayIntro")}</p>
        <ul className="space-y-2">
          {sayLines.map((line, i) => (
            <li key={i} className="rounded-[var(--radius)] bg-surface-muted p-3 text-lg font-semibold">
              “{line}”
            </li>
          ))}
        </ul>
        <ReadAloud text={sayLines.join(" ")} />
      </section>
    </div>
  );
}
