"use client";

// A list of options (radio buttons). Picking one shows its steps and official
// links. Used by /verify ("Who are you dealing with?") and /help ("How did you pay?").
//
// Text comes from the locale files:  `${prefix}.${id}.label` and `${prefix}.${id}.steps`.

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { OfficialLinks } from "./OfficialLinks";

interface StepsPickerProps {
  /** Unique name for the radio group, e.g. "verify-type". */
  name: string;
  /** Screen-reader label for the whole group. */
  legend: string;
  /** Where the labels and steps live in the locale files, e.g. "verify.types". */
  prefix: string;
  /** Option id → official link ids (from data/resources.json). */
  options: Record<string, string[]>;
  stepsHeading: string;
  linksHeading: string;
}

export function StepsPicker({ name, legend, prefix, options, stepsHeading, linksHeading }: StepsPickerProps) {
  const { t, tList } = useI18n();
  const [selected, setSelected] = useState<string | null>(null);
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
    <div className="space-y-4">
      {/* Native radio buttons: arrow keys and screen readers work for free */}
      <fieldset className="grid gap-2 sm:grid-cols-2" onPointerDown={() => (pickedByPointer.current = true)}>
        <legend className="sr-only">{legend}</legend>
        {Object.keys(options).map((id) => (
          <label
            key={id}
            className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-[var(--radius)] border-2 px-4 py-3 font-bold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus)] ${
              selected === id ? "border-ink bg-ink text-white" : "border-line bg-surface hover:border-ink"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={id}
              checked={selected === id}
              onChange={() => setSelected(id)}
              className="h-5 w-5 shrink-0 accent-white"
            />
            {t(`${prefix}.${id}.label`)}
          </label>
        ))}
      </fieldset>

      {selected && (
        <section key={selected} ref={stepsRef} aria-live="polite" className="result-enter space-y-4">
          <div className="card">
            <h2 className="card-title">
              {t(`${prefix}.${selected}.label`)}: {stepsHeading}
            </h2>
            <ol className="list-decimal space-y-3 ps-6 text-lg">
              {tList(`${prefix}.${selected}.steps`).map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
          <div className="card">
            <h2 className="card-title">{linksHeading}</h2>
            <OfficialLinks ids={options[selected]} />
          </div>
        </section>
      )}
    </div>
  );
}
