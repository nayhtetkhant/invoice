import { describe, expect, it } from "vitest";
import { dictionaries, getDictionary } from "@/lib/i18n";

describe("bilingual i18n dictionary", () => {
  it("has identical keys for Burmese (my) and English (en)", () => {
    const myKeys = Object.keys(dictionaries.my).sort();
    const enKeys = Object.keys(dictionaries.en).sort();

    expect(myKeys).toEqual(enKeys);
    expect(myKeys.length).toBeGreaterThan(30);
  });

  it("has non-empty translations for every key in both languages", () => {
    for (const [key, value] of Object.entries(dictionaries.my)) {
      expect(value.trim().length, `Empty 'my' translation for ${key}`).toBeGreaterThan(0);
    }
    for (const [key, value] of Object.entries(dictionaries.en)) {
      expect(value.trim().length, `Empty 'en' translation for ${key}`).toBeGreaterThan(0);
    }
  });

  it("returns the requested language dictionary via getDictionary", () => {
    expect(getDictionary("my")).toBe(dictionaries.my);
    expect(getDictionary("en")).toBe(dictionaries.en);
  });
});
