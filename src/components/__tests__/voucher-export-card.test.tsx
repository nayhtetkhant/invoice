import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VoucherExportCard } from "@/components/voucher-export-card";
import { getDictionary } from "@/lib/i18n";

describe("VoucherExportCard", () => {
  it("renders a compact segmented format toolbar without bulky card title and hides paper size for PNG", () => {
    const myDict = getDictionary("my");
    const previewRef = React.createRef<HTMLDivElement>();

    const html = renderToStaticMarkup(
      <VoucherExportCard
        dictionary={myDict}
        accentColor="#0f766e"
        order={{ voucherNumber: "V-001", date: "2026-11-25" }}
        previewRef={previewRef}
      />,
    );

    expect(html).toContain(`aria-label="${myDict.exportFormatLabel}"`);
    expect(html).toContain(`aria-pressed="true"`);
    expect(html).toContain("grid w-full grid-cols-3");
    expect(html).toContain(myDict.formatPng);
    expect(html).toContain(myDict.formatPdf);
    expect(html).toContain(myDict.formatBoth);
    expect(html).toContain("lucide-image");
    expect(html).toContain("lucide-file");
    expect(html).toContain("lucide-layers");
    expect(html).toContain(myDict.downloadButton);
    expect(html).toContain(myDict.copyImageButton);
    expect(html).toMatch(/<button[^>]*w-full[^>]*>.*ဘောက်ချာဒေါင်းလုဒ်လုပ်မည်/);
    expect(html).not.toContain(myDict.pdfPaperSizeLabel);
    // Concise format labels do not rely on text truncation that clips Burmese glyphs
    expect(myDict.formatPng).toBe("PNG ပုံ");
    expect(html).not.toContain("truncate");
  });

  it("shows segmented PDF paper size pills on a separate half-width row when PDF or Both format is selected", () => {
    const enDict = getDictionary("en");
    const previewRef = React.createRef<HTMLDivElement>();

    const pdfHtml = renderToStaticMarkup(
      <VoucherExportCard
        dictionary={enDict}
        accentColor="#2563eb"
        order={{ voucherNumber: "V-002", date: "2026-11-25" }}
        previewRef={previewRef}
        initialFormat="pdf"
      />,
    );

    expect(pdfHtml).toContain(`aria-label="${enDict.pdfPaperSizeLabel}"`);
    expect(pdfHtml).toContain("grid w-full grid-cols-2");
    expect(pdfHtml).toContain(enDict.paperA4);
    expect(pdfHtml).toContain(enDict.paperA5);

    const downloadIdx = pdfHtml.indexOf(enDict.downloadButton);
    const formatGroupIdx = pdfHtml.indexOf(`aria-label="${enDict.exportFormatLabel}"`);
    const paperGroupIdx = pdfHtml.indexOf(`aria-label="${enDict.pdfPaperSizeLabel}"`);
    expect(formatGroupIdx).toBeGreaterThan(downloadIdx);
    expect(paperGroupIdx).toBeGreaterThan(formatGroupIdx);

    const bothHtml = renderToStaticMarkup(
      <VoucherExportCard
        dictionary={enDict}
        accentColor="#2563eb"
        order={{ voucherNumber: "V-002", date: "2026-11-25" }}
        previewRef={previewRef}
        initialFormat="both"
      />,
    );

    expect(bothHtml).toContain(`aria-label="${enDict.pdfPaperSizeLabel}"`);
  });

  it("scales format button typography and spacing down on narrow mobile viewports", () => {
    const myDict = getDictionary("my");
    const previewRef = React.createRef<HTMLDivElement>();

    const html = renderToStaticMarkup(
      <VoucherExportCard
        dictionary={myDict}
        accentColor="#0f766e"
        order={{ voucherNumber: "V-001", date: "2026-11-25" }}
        previewRef={previewRef}
      />,
    );

    expect(html).toContain("px-1.5 py-1.5 text-center text-[11px]");
    expect(html).toContain("leading-snug");
    expect(html).not.toContain("leading-none");
    expect(html).toContain("sm:gap-1.5 sm:px-2 sm:text-xs");
    expect(html).not.toContain("truncate");
    expect(html).not.toContain("max-w-[460px]");
  });

  it("keeps format button text single-line and gives export buttons distinct bordered styling and colored icons", () => {
    const enDict = getDictionary("en");
    const previewRef = React.createRef<HTMLDivElement>();

    const html = renderToStaticMarkup(
      <VoucherExportCard
        dictionary={enDict}
        accentColor="#2563eb"
        order={{ voucherNumber: "V-003", date: "2026-11-25" }}
        previewRef={previewRef}
        initialFormat="both"
      />,
    );

    // Every format button stays on one line and has explicit border + semantic colored icon
    expect(html).toContain("whitespace-nowrap");
    expect(html).toContain("grid w-full grid-cols-3 gap-1.5");
    expect(html).toContain("text-sky-600");
    expect(html).toContain("text-rose-600");
    expect(html).toContain("text-violet-600");
    expect(html).toContain("border-violet-500 bg-violet-50");
    // Paper size buttons & Copy Image button also have distinct borders and colored icons
    expect(html).toContain("border-amber-500 bg-amber-50");
    expect(html).toContain("text-indigo-600");
    expect(html).toContain("border-indigo-200");
  });
});
