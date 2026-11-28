import * as fs from "node:fs";
import * as path from "node:path";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/local", () => ({
  default: ({ variable }: { variable?: string }) => ({
    variable: variable ?? "--font-pyidaungsu",
  }),
}));

vi.mock("next/font/google", () => ({
  Noto_Sans: ({ variable }: { variable?: string }) => ({
    variable: variable ?? "--font-noto-sans",
  }),
  Noto_Sans_Mono: ({ variable }: { variable?: string }) => ({
    variable: variable ?? "--font-noto-mono",
  }),
}));

vi.mock("@/app/globals.css", () => ({}));

import RootLayout from "@/app/layout";

describe("Pyidaungsu font configuration", () => {
  it("bundles Pyidaungsu Regular and Bold woff2 font files locally", () => {
    const fontsDir = path.resolve(import.meta.dirname, "../fonts");
    expect(fs.existsSync(path.join(fontsDir, "Pyidaungsu-Regular.woff2"))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(fontsDir, "Pyidaungsu-Bold.woff2"))).toBe(
      true,
    );
  });

  it("applies Pyidaungsu, Noto Sans, and Noto Sans Mono CSS variables on RootLayout", () => {
    const html = renderToStaticMarkup(
      <RootLayout params={Promise.resolve({})}>
        <main>Voucher</main>
      </RootLayout>,
    );

    expect(html).toContain("--font-pyidaungsu");
    expect(html).toContain("--font-noto-sans");
    expect(html).toContain("--font-noto-mono");
    expect(html).not.toContain("--font-noto-myanmar");
    expect(html).not.toContain("--font-geist");
  });

  it("maps Tailwind sans, mono, and heading font tokens to Pyidaungsu first in globals.css", () => {
    const css = fs.readFileSync(
      path.resolve(import.meta.dirname, "../globals.css"),
      "utf8",
    );

    expect(css).toContain(
      "--font-sans: var(--font-pyidaungsu), var(--font-noto-sans)",
    );
    expect(css).toContain(
      "--font-mono: var(--font-noto-mono), var(--font-pyidaungsu)",
    );
    expect(css).toContain(
      "--font-heading: var(--font-pyidaungsu), var(--font-noto-sans)",
    );
    expect(css).not.toContain("--font-geist");
  });
});
