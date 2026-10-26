// Makes sure every language file has exactly the same keys as English,
// so no screen ever shows a raw key like "result.verify".

import { describe, expect, it } from "vitest";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import faAF from "@/locales/fa-AF.json";
import hi from "@/locales/hi.json";
import pa from "@/locales/pa.json";
import zh from "@/locales/zh.json";

/** Lists every key path, e.g. "result.verify" or "defaultSteps.high". */
function keyPaths(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) return [prefix];
  return Object.entries(obj).flatMap(([k, v]) => keyPaths(v, prefix ? `${prefix}.${k}` : k));
}

const others = { es, "fa-AF": faAF, hi, pa, zh };

describe("locale files", () => {
  it.each(Object.entries(others))("%s has the same keys as English", (_, messages) => {
    expect(keyPaths(messages).sort()).toEqual(keyPaths(en).sort());
  });

  it.each(Object.entries(others))("%s keeps every {placeholder}", (_, messages) => {
    const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
    for (const path of keyPaths(en)) {
      const get = (o: unknown) => path.split(".").reduce<unknown>((n, p) => (n as Record<string, unknown>)[p], o);
      const english = get(en);
      if (typeof english === "string") {
        expect(placeholders(get(messages) as string), path).toEqual(placeholders(english));
      }
    }
  });
});
