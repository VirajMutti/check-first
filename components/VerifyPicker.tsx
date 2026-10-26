"use client";

// /verify: "Who are you dealing with?" — pick a type, see 3 steps + official links.

import { useEffect, useRef, useState } from "react";
import resources from "@/data/resources.json";
import { useI18n } from "@/lib/i18n";
import { OfficialLinks } from "./OfficialLinks";

type VerifyType = keyof typeof resources.verifyTypes;
const TYPES = Object.keys(resources.verifyTypes) as VerifyType[];

export function VerifyPicker() {
  const { t, tList } = useI18n();
  const [selected, setSelected] = useState<VerifyType | null>(null);
  const stepsRef = useRef<HTMLElement>(null);
  const pickedByPointer = useRef(false);

  // On phones the steps appear below the fold, so bring them into view after a
  // tap. Not for keyboard users: it would scroll the radio they're on out of view.
  useEffect(() => {
    if (!selected || !pickedByPointer.current) return;
    pickedByPointer.current = false;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    stepsRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }, [selected]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-brand sm:text-3xl">{t("verify.title")}</h1>
        <p className="mt-2 text-ink-muted">{t("verify.intro")}</p>
      </div>

      {/* Native radio buttons: arrow keys and screen readers work for free */}
      <fieldset className="grid gap-2 sm:grid-cols-2" onPointerDown={() => (pickedByPointer.current = true)}>
        <legend className="sr-only">{t("verify.title")}</legend>
        {TYPES.map((type) => (
          <label
            key={type}
            className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 font-semibold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus)] ${
              selected === type ? "border-brand bg-brand text-white" : "border-line bg-surface"
            }`}
          >
            <input
              type="radio"
              name="verify-type"
              value={type}
              checked={selected === type}
              onChange={() => setSelected(type)}
              className="h-5 w-5 shrink-0 accent-white"
            />
            {t(`verify.types.${type}.label`)}
          </label>
        ))}
      </fieldset>

      {selected && (
        <section key={selected} ref={stepsRef} aria-live="polite" className="result-enter space-y-4">
          <div className="card">
            <h2 className="card-title">
              {t(`verify.types.${selected}.label`)}: {t("verify.stepsHeading")}
            </h2>
            <ol className="list-decimal space-y-3 ps-6 text-lg">
              {tList(`verify.types.${selected}.steps`).map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
          <div className="card">
            <h2 className="card-title">{t("verify.linksHeading")}</h2>
            <OfficialLinks ids={resources.verifyTypes[selected]} />
          </div>
        </section>
      )}
    </div>
  );
}
