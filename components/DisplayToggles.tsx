"use client";

// "Large text" and "High contrast" switches. They set data attributes on
// <html>, and globals.css changes the font size and colors from there.

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

type Prefs = { largeText: boolean; highContrast: boolean };
const STORAGE_KEY = "checkfirst-display";

export function DisplayToggles() {
  const { t } = useI18n();
  const [prefs, setPrefs] = useState<Prefs>({ largeText: false, highContrast: false });

  // Restore saved choices (a convenience only; ignore storage errors).
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Prefs | null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser storage after hydration
      if (saved) setPrefs(saved);
    } catch {}
  }, []);

  // Apply the choices to <html> and remember them.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.text = prefs.largeText ? "large" : "normal";
    root.dataset.contrast = prefs.highContrast ? "high" : "normal";
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {}
  }, [prefs]);

  const toggle = (key: keyof Prefs) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="flex flex-wrap gap-2">
      <ToggleButton pressed={prefs.largeText} onClick={() => toggle("largeText")}>
        <span aria-hidden="true" className="font-bold">
          A<span className="text-xs">A</span>
        </span>
        {t("a11y.largeText")}
      </ToggleButton>
      <ToggleButton pressed={prefs.highContrast} onClick={() => toggle("highContrast")}>
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
        </svg>
        {t("a11y.highContrast")}
      </ToggleButton>
    </div>
  );
}

function ToggleButton({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-3 text-sm font-semibold ${
        pressed ? "border-brand bg-brand text-white" : "border-line bg-surface text-ink"
      }`}
    >
      {children}
    </button>
  );
}
