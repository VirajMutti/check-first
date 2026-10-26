"use client";

// /verify: "Who are you dealing with?" — pick a type, see 3 steps + official links.

import resources from "@/data/resources.json";
import { useI18n } from "@/lib/i18n";
import { StepsPicker } from "./StepsPicker";

export function VerifyPicker() {
  const { t } = useI18n();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-brand sm:text-3xl">{t("verify.title")}</h1>
        <p className="mt-2 text-ink-muted">{t("verify.intro")}</p>
      </div>
      <StepsPicker
        name="verify-type"
        legend={t("verify.title")}
        prefix="verify.types"
        options={resources.verifyTypes}
        stepsHeading={t("verify.stepsHeading")}
        linksHeading={t("verify.linksHeading")}
      />
    </div>
  );
}
