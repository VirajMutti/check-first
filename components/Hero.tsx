"use client";

import { useI18n } from "@/lib/i18n";

export function Hero() {
  const { t } = useI18n();
  return (
    <section className="pt-2">
      <h1 className="text-2xl leading-snug font-bold text-brand sm:text-3xl">{t("app.tagline")}</h1>
    </section>
  );
}
