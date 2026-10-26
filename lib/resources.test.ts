// Checks data/resources.json: every link is an official https .gov site,
// every link id it uses exists, and every link has a label in English.

import { describe, expect, it } from "vitest";
import resources from "@/data/resources.json";
import en from "@/locales/en.json";

const urls = resources.links as Record<string, string>;
const usedIds = [...Object.values(resources.scamTypeLinks), ...Object.values(resources.verifyTypes)].flat();

describe("official resources", () => {
  it.each(Object.entries(urls))("%s is an official https .gov link", (_, url) => {
    const { protocol, hostname } = new URL(url);
    expect(protocol).toBe("https:");
    expect(hostname.endsWith(".gov")).toBe(true);
  });

  it("every link id used exists", () => {
    for (const id of usedIds) expect(urls[id], id).toBeDefined();
  });

  it("every link has an English label", () => {
    for (const id of Object.keys(urls)) expect((en.links as Record<string, string>)[id], id).toBeTruthy();
  });
});
