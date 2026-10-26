"use client";

// Top bar: logo, app name, language picker and display settings.

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
    <header className="border-b border-line bg-surface">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-10 focus:rounded-lg focus:bg-surface focus:p-3">
        {t("a11y.skip")}
      </a>
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex min-h-11 items-center gap-2 text-2xl font-bold text-brand">
          <ShieldLogo />
          {t("app.name")}
        </Link>

        <label className="flex items-center gap-2">
          <span className="sr-only">{t("form.language")}</span>
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-ink-muted" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
          </svg>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as LangCode)}
            className="input min-h-11 py-1.5 text-base"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} lang={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <nav aria-label="Main" className="w-full">
          <ul className="flex flex-wrap gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="inline-flex min-h-11 items-center rounded-lg px-3 font-semibold whitespace-nowrap text-ink-muted hover:text-brand aria-[current=page]:bg-surface-muted aria-[current=page]:text-brand"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="w-full">
          <DisplayToggles />
        </div>
      </div>
    </header>
  );
}
