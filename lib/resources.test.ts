// Checks data/resources.json: every link is an official https .gov site,
// every link id it uses exists, and every link has a label in English.

import { describe, expect, it } from "vitest";
import resources from "@/data/resources.json";
import en from "@/locales/en.json";

const urls = resources.links as Record<string, string>;
const usedIds = [
  ...Object.values(resources.scamTypeLinks).flat(),
  ...Object.values(resources.verifyTypes).flat(),
  ...Object.values(resources.paidMethods).flat(),
  ...resources.phones.flatMap((p) => (p.source ? [p.source] : [])),
];

describe("official resources", () => {
  it.each(Object.entries(urls))("%s is an official https .gov link", (_, url) => {
    const { protocol, hostname } = new URL(url);
    expect(protocol).toBe("https:");
    expect(hostname.endsWith(".gov")).toBe(true);
  });

  it("every link id used exists", () => {
    for (const id of usedIds) expect(urls[id], id).toBeDefined();
  });

  it("every phone number is 911 or a 10-digit US number", () => {
    for (const { number } of resources.phones) expect(number).toMatch(/^(911|\d{3}-\d{3}-\d{4})$/);
  });

  it("every link has an English label", () => {
    for (const id of Object.keys(urls)) expect((en.links as Record<string, string>)[id], id).toBeTruthy();
  });
});
