import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VoucherBuilderShell } from "@/components/voucher-builder-shell";
import { getDictionary } from "@/lib/i18n";

describe("VoucherBuilderShell", () => {
  it("renders invoice-generator.com direct-on-paper sheet with right action rail, off-screen export sheet, and mobile bottom dock", () => {
    const myDict = getDictionary("my");
    const html = renderToStaticMarkup(<VoucherBuilderShell />);

    expect(html).toContain('data-editor-pane="true"');
    expect(html).toContain('data-paper-editor="true"');
    expect(html).toContain('data-sidebar-rail="true"');
    expect(html).toContain('data-voucher-sheet="true"');
    expect(html).toContain('data-mobile-summary-bar="true"');
    expect(html).not.toContain('data-slot="tabs-list"');
    expect(html).not.toContain("lucide-file-text");
    expect(html).toContain("lucide-languages");
    expect(html).toContain(myDict.previewButton);
    expect(html).toContain('id="sidebar-currency"');
    expect(html).toContain('id="sidebar-accent-custom"');
    expect(html).toContain(myDict.managePaymentAccounts);

    // Paper sheet sits before the right sidebar rail in DOM order, and sidebar stays visible across all viewports
    const paperIdx = html.indexOf('data-paper-editor="true"');
    const railIdx = html.indexOf('data-sidebar-rail="true"');
    expect(paperIdx).toBeGreaterThan(-1);
    expect(railIdx).toBeGreaterThan(paperIdx);
    expect(html).toContain("flex w-full");
    expect(html).not.toContain("hidden lg:block");

    // Header divider with horizontal spacing and sticky right action rail
    expect(html).toContain(">|<");
    expect(html).toContain("lg:sticky lg:top-6");
    // Widened 304px right rail so single-line PNG + PDF button never wraps, plus colored sidebar action buttons
    expect(html).toContain("lg:grid-cols-[minmax(0,1fr)_304px]");
    expect(html).toContain("text-sky-600");
    expect(html).toContain("text-emerald-600");
    expect(html).toContain("text-amber-600");
  });
});
