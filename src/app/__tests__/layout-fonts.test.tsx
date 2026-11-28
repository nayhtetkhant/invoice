import * as fs from "node:fs";
import * as path from "node:path";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Noto_Sans: ({ variable }: { variable?: string }) => ({
    variable: variable ?? "--font-noto-sans",
  }),
  Noto_Sans_Mono: ({ variable }: { variable?: string }) => ({
    variable: variable ?? "--font-noto-mono",
  }),
  Noto_Sans_Myanmar: ({ variable }: { variable?: string }) => ({
    variable: variable ?? "--font-noto-myanmar",
  }),
}));

vi.mock("@/app/globals.css", () => ({}));

import RootLayout from "@/app/layout";

describe("Noto Sans font configuration", () => {
  it("applies Noto Sans, Noto Sans Mono, and Noto Sans Myanmar CSS variables on RootLayout", () => {
    const html = renderToStaticMarkup(
      <RootLayout params={Promise.resolve({})}>
        <main>Voucher</main>
      </RootLayout>,
    );

    expect(html).toContain("--font-noto-sans");
    expect(html).toContain("--font-noto-mono");
    expect(html).toContain("--font-noto-myanmar");
    expect(html).not.toContain("--font-geist");
  });

  it("maps Tailwind sans, mono, and heading font tokens to Noto Sans in globals.css", () => {
    const css = fs.readFileSync(
      path.resolve(import.meta.dirname, "../globals.css"),
      "utf8",
    );

    expect(css).toContain(
      "--font-sans: var(--font-noto-sans), var(--font-noto-myanmar)",
    );
    expect(css).toContain("--font-mono: var(--font-noto-mono)");
    expect(css).toContain(
      "--font-heading: var(--font-noto-sans), var(--font-noto-myanmar)",
    );
    expect(css).not.toContain("--font-geist");
  });
});
