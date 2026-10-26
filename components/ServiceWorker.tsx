"use client";

// Registers public/sw.js so the app keeps working without internet.
// Only in production builds, so the dev server never serves stale files.

import { useEffect } from "react";

export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then(() => navigator.serviceWorker.ready)
      .then((registration) => {
        // Hand over everything this page already downloaded (scripts, styles, fonts).
        const urls = performance
          .getEntriesByType("resource")
          .map((entry) => entry.name)
          .filter((url) => url.startsWith(location.origin) && !url.includes("/api/"));
        registration.active?.postMessage({ type: "CACHE_URLS", urls: [location.pathname, ...urls] });
      })
      .catch(() => {
        // Offline support is a bonus; the app works fine without it.
      });
  }, []);

  return null;
}
