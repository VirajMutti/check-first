import type { Metadata, Viewport } from "next";
import {
  Noto_Sans,
  Noto_Sans_Arabic,
  Noto_Sans_Devanagari,
  Noto_Sans_Gurmukhi,
} from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

// One Noto family per script, so every language renders properly.
// The browser only downloads a font file when that script appears on screen.
const notoLatin = Noto_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-latin" });
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
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d4f5c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const fontVars = [notoLatin, notoGurmukhi, notoDevanagari, notoArabic].map((f) => f.variable).join(" ");
  return (
    <html lang="en" dir="ltr" className={`${fontVars} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <I18nProvider>
          <Header />
          <main id="main" className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
            {children}
          </main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
