import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VoucherExportCard } from "@/components/voucher-export-card";
import { getDictionary } from "@/lib/i18n";

describe("VoucherExportCard", () => {
  it("renders Burmese export title, format selector, and download trigger by default", () => {
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

    expect(html).toContain(myDict.exportTitle);
    expect(html).toContain(myDict.exportFormatLabel);
    expect(html).toContain(myDict.formatPng);
    expect(html).toContain(myDict.downloadButton);
    expect(html).not.toContain(myDict.pdfPaperSizeLabel);
  });

  it("shows PDF paper size selector when PDF or Both format is selected", () => {
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

    expect(pdfHtml).toContain(enDict.exportTitle);
    expect(pdfHtml).toContain(enDict.formatPdf);
    expect(pdfHtml).toContain(enDict.pdfPaperSizeLabel);
    expect(pdfHtml).toContain(enDict.paperA4);

    const bothHtml = renderToStaticMarkup(
      <VoucherExportCard
        dictionary={enDict}
        accentColor="#2563eb"
        order={{ voucherNumber: "V-002", date: "2026-11-25" }}
        previewRef={previewRef}
        initialFormat="both"
      />,
    );

    expect(bothHtml).toContain("Both PNG &amp; PDF");
    expect(bothHtml).toContain(enDict.pdfPaperSizeLabel);
  });
});
