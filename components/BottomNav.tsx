"use client";

// Phone-only tab bar fixed to the bottom of the screen, like a native app.
// On bigger screens it's hidden and the top menu in <Header> is used instead.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";

// Simple outline icons for each tab (decorative: the text label says what it is).
const ICONS: Record<string, React.ReactNode> = {
  check: <path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6l-7-3Zm-3 9 2.2 2.2L15.5 10" />,
  verify: (
    <>
      <circle cx="10" cy="8" r="4" />
      <path d="M3 20c0-3.3 3-6 7-6 1.4 0 2.6.3 3.7.9M15 18l2 2 4-4" />
    </>
  ),
  learn: <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Zm0 16a2 2 0 0 1 2-2h13v2" />,
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01" />
    </>
  ),
};

const TABS = [
  { id: "check", href: "/" },
  { id: "verify", href: "/verify" },
  { id: "learn", href: "/learn" },
  { id: "help", href: "/help" },
];

export function BottomNav() {
  const { t } = useI18n();
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("nav.label")}
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto grid max-w-2xl grid-cols-4">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <li key={tab.id}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-0.5 px-1 text-sm font-semibold ${
                  active ? "text-brand" : "text-ink-muted"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={active ? 2.4 : 1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {ICONS[tab.id]}
                </svg>
                {t(`nav.short.${tab.id}`)}
                {/* A small bar under the active tab, so it's not shown by color alone */}
                <span aria-hidden="true" className={`h-1 w-6 rounded-full ${active ? "bg-brand" : "bg-transparent"}`} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
