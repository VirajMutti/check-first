import type { MetadataRoute } from "next";

// Lets phones install Check First like an app: home-screen icon, opens
// full screen without the browser bar. (Works with the offline service worker.)
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Check First: scam checker",
    short_name: "Check First",
    description: "Check a suspicious message in your language before you pay anyone.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f4ef",
    theme_color: "#0d4f5c",
    lang: "en",
    categories: ["utilities", "security"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // "maskable": Android may crop it into a circle; the shield stays inside the safe area.
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Get help", url: "/help", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Learn the scams", url: "/learn", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
