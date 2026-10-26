"use client";

// "Get the app" card: lets people add Check First to their home screen.
// - Android / Chrome: the browser fires "beforeinstallprompt"; we save it and
//   show an Install button that opens the real install prompt.
// - iPhone / iPad: there's no install prompt, so we show the steps instead.
// - Already installed (opened from the home screen): show nothing.

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

// Chrome's install event isn't in TypeScript's built-in types yet.
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Mode = "hidden" | "button" | "ios";

export function InstallApp() {
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>("hidden");
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const installed =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (installed) return;

    // iPhone/iPad Safari can't show an install prompt, so explain the steps.
    if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the device type after hydration
      setMode("ios");
      return;
    }

    const onPrompt = (e: Event) => {
      e.preventDefault(); // keep it for our own button instead of the browser's banner
      setInstallEvent(e as InstallPromptEvent);
      setMode("button");
    };
    const onInstalled = () => setMode("hidden");
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === "accepted") setMode("hidden");
    setInstallEvent(null);
  }

  if (mode === "hidden") return null;

  return (
    <section aria-labelledby="install-heading" className="card flex items-start gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny static icon */}
      <img src="/icons/icon-192.png" alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-xl" />
      <div className="space-y-2">
        <h2 id="install-heading" className="text-lg font-bold">
          {t("install.title")}
        </h2>
        <p className="text-ink-muted">{t("install.body")}</p>
        {mode === "button" ? (
          <button type="button" onClick={install} className="btn btn-primary">
            {t("install.button")}
          </button>
        ) : (
          <p className="font-semibold">{t("install.ios")}</p>
        )}
      </div>
    </section>
  );
}
