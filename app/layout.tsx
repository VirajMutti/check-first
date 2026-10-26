import type { Metadata, Viewport } from "next";
import {
  Noto_Sans,
  Noto_Sans_Arabic,
  Noto_Sans_Devanagari,
  Noto_Sans_Gurmukhi,
} from "next/font/google";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import { ServiceWorker } from "@/components/ServiceWorker";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

// One Noto family per script, so every language renders properly.
// The browser only downloads a font file when that script appears on screen.
// adjustFontFallback: false stops Next adding an Arial fallback in front of the
// script fonts (Arial has Arabic letters, so Dari would render in Arial).
const notoLatin = Noto_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-latin", adjustFontFallback: false });
const notoGurmukhi = Noto_Sans_Gurmukhi({ subsets: ["gurmukhi"], variable: "--font-gurmukhi", preload: false });
const notoDevanagari = Noto_Sans_Devanagari({ subsets: ["devanagari"], variable: "--font-devanagari", preload: false });
const notoArabic = Noto_Sans_Arabic({ subsets: ["arabic"], variable: "--font-arabic", preload: false });
// Chinese: we use the phone's built-in CJK font instead of downloading one.
// Android's built-in Chinese font IS Noto Sans CJK; iPhones use PingFang.
// A self-hosted Chinese font is ~200 files and made builds fail on slow networks.

export const metadata: Metadata = {
  title: "Check First — scam checker for CA-14 families",
  description:
    "Paste a suspicious message or screenshot. Check First tells you in your language how risky it is and how to verify it with official sources.",
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: "/icons/apple-touch-icon.png",
  },
  // iPhone: when added to the home screen, open full screen like an app.
  appleWebApp: { capable: true, title: "Check First", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets the app use the full screen on phones with a notch (safe areas are padded).
  viewportFit: "cover",
  themeColor: "#0d4f5c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const fontVars = [notoLatin, notoGurmukhi, notoDevanagari, notoArabic].map((f) => f.variable).join(" ");
  return (
    <html lang="en" dir="ltr" className={`${fontVars} h-full antialiased`}>
      {/* On phones, leave room at the bottom for the fixed tab bar */}
      <body className="flex min-h-full flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <I18nProvider>
          <Header />
          <main id="main" className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
            {children}
          </main>
          <Footer />
          <BottomNav />
          <ServiceWorker />
        </I18nProvider>
      </body>
    </html>
  );
}
