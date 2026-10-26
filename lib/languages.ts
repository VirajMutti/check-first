// The six languages Check First supports, for both the UI and the AI's answer.

export const LANGUAGES = [
  { code: "en", label: "English", englishName: "English", dir: "ltr" },
  { code: "pa", label: "ਪੰਜਾਬੀ", englishName: "Punjabi (Gurmukhi script)", dir: "ltr" },
  { code: "hi", label: "हिन्दी", englishName: "Hindi", dir: "ltr" },
  { code: "es", label: "Español", englishName: "Spanish", dir: "ltr" },
  { code: "zh", label: "中文", englishName: "Simplified Chinese", dir: "ltr" },
  { code: "fa-AF", label: "دری", englishName: "Dari (Afghan Persian)", dir: "rtl" },
] as const;

export type LangCode = (typeof LANGUAGES)[number]["code"];

/** Just the codes, e.g. for zod.enum(). */
export const LANG_CODES = LANGUAGES.map((l) => l.code) as [LangCode, ...LangCode[]];

export function getLanguage(code: LangCode) {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}
