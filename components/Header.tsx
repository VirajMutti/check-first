"use client";

// Top bar: logo, app name, language picker and display settings.
// The page menu shows here on bigger screens; phones use <BottomNav> instead.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { LANGUAGES, type LangCode } from "@/lib/languages";
import { DisplayToggles } from "./DisplayToggles";
import { ShieldLogo } from "./Icons";

export function Header() {
  const { t, lang, setLang } = useI18n();
  const pathname = usePathname();
  const navItems = [
    { href: "/", label: t("nav.check") },
    { href: "/verify", label: t("nav.verify") },
    { href: "/learn", label: t("nav.learn") },
    { href: "/help", label: t("nav.help") },
  ];

  return (
    <header>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-10 focus:rounded-[var(--radius)] focus:bg-surface focus:p-3">
        {t("a11y.skip")}
      </a>
      {/* Deep blue bar: name and language */}
      <div className="bg-brand text-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-2.5">
          <Link href="/" className="flex min-h-11 items-center gap-2 text-xl font-extrabold tracking-tight">
            <ShieldLogo inverted className="h-8 w-8" />
            {t("app.name")}
          </Link>

          <label className="flex items-center gap-2">
            <span className="sr-only">{t("form.language")}</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
            </svg>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as LangCode)}
              className="min-h-11 rounded-[var(--radius)] border-2 border-white/70 bg-brand px-2 py-1.5 text-base font-bold text-white"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} lang={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* White strip: page menu (computers only) and display settings */}
      <div className="border-b border-line">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-2 px-4 py-2">
          <nav aria-label={t("nav.label")} className="hidden md:block">
            <ul className="flex flex-wrap">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className="inline-flex min-h-11 items-center border-b-[3px] border-transparent px-3 font-bold whitespace-nowrap text-ink-muted hover:text-ink aria-[current=page]:border-ink aria-[current=page]:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <DisplayToggles />
        </div>
      </div>
    </header>
  );
}
