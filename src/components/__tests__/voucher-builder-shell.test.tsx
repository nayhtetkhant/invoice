import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VoucherBuilderShell } from "@/components/voucher-builder-shell";
import { getDictionary } from "@/lib/i18n";

describe("VoucherBuilderShell", () => {
  it("renders a single slim header without top mobile tab bar, sticky bottom thumb dock, and preview-first order on mobile", () => {
    const myDict = getDictionary("my");
    const html = renderToStaticMarkup(<VoucherBuilderShell />);

    expect(html).toContain('data-editor-pane="true"');
    expect(html).toContain('data-document-stage="true"');
    expect(html).toContain('data-mobile-summary-bar="true"');
    // Top mobile tab bar removed in favor of the unified bottom thumb dock
    expect(html).not.toContain('data-slot="tabs-list"');
    expect(html).toContain(myDict.previewButton);

    // Export toolbar appears before preview in DOM (desktop top), with mobile flex ordering placing preview first
    const exportIndex = html.indexOf(myDict.downloadButton);
    const sheetIndex = html.indexOf('data-voucher-sheet="true"');
    expect(exportIndex).toBeGreaterThan(-1);
    expect(sheetIndex).toBeGreaterThan(exportIndex);
    expect(html).toContain("order-2 lg:order-1");
    expect(html).toContain("order-1 lg:order-2");
  });
});
