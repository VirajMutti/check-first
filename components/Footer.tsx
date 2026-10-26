"use client";

import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-8 border-t border-line bg-surface">
      <div className="mx-auto max-w-2xl space-y-1 px-4 py-6 text-ink-muted">
        <p className="font-semibold text-ink">{t("footer.notLegal")}</p>
        <p>
          {t("footer.emergency")}{" "}
          <a href="tel:911" className="font-semibold text-risk-high underline">
            911
          </a>
        </p>
        <p>{t("footer.madeFor")}</p>
      </div>
    </footer>
  );
}
