"use client";

// Very small translation system: every UI string lives in /locales/*.json.
// t("form.submit") looks up a dotted key in the current language and falls
// back to English if a translation is missing.

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import en from "@/locales/en.json";
import { getLanguage, LANG_CODES, type LangCode } from "./languages";

type Messages = typeof en;

// Each language file is loaded here. Missing keys fall back to English.
const MESSAGES: Partial<Record<LangCode, Messages>> = { en };

/** Finds "a.b.c" inside a nested object, or returns undefined. */
function lookup(obj: unknown, key: string): unknown {
  return key.split(".").reduce<unknown>(
    (node, part) => (node && typeof node === "object" ? (node as Record<string, unknown>)[part] : undefined),
    obj,
  );
}

interface I18n {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  /** Translate a string, replacing {name} placeholders with vars. */
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** Translate a list of strings (e.g. default steps). */
  tList: (key: string) => string[];
}

const I18nContext = createContext<I18n | null>(null);
const STORAGE_KEY = "checkfirst-lang";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  // Restore the visitor's last language (only a convenience, so errors are ignored).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as LangCode | null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser storage after hydration
      if (saved && LANG_CODES.includes(saved)) setLangState(saved);
    } catch {}
  }, []);

  // Keep <html lang> and <html dir> in sync so screen readers and RTL work.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = getLanguage(lang).dir;
  }, [lang]);

  const setLang = useCallback((next: LangCode) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const value = lookup(MESSAGES[lang], key) ?? lookup(en, key);
      let text = typeof value === "string" ? value : key;
      for (const [name, v] of Object.entries(vars ?? {})) {
        text = text.replaceAll(`{${name}}`, String(v));
      }
      return text;
    },
    [lang],
  );

  const tList = useCallback(
    (key: string) => {
      const value = lookup(MESSAGES[lang], key) ?? lookup(en, key);
      return Array.isArray(value) ? (value as string[]) : [];
    },
    [lang],
  );

  return <I18nContext.Provider value={{ lang, setLang, t, tList }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
