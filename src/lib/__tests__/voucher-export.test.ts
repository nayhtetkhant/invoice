import { describe, expect, it, vi } from "vitest";
import {
  buildVoucherFilename,
  calculateCaptureScale,
  calculatePdfPlacement,
  copyVoucherImage,
  exportVoucher,
} from "@/lib/voucher-export";

describe("buildVoucherFilename", () => {
  it("builds a clean filename using voucher number and date", () => {
    expect(
      buildVoucherFilename(
        { voucherNumber: "V-2026/001", date: "2026-11-25" },
        "png",
      ),
    ).toBe("voucher-V-2026-001-2026-11-25.png");
  });

  it("falls back cleanly when voucher number or date is blank", () => {
    expect(
      buildVoucherFilename({ voucherNumber: "   ", date: "2026-11-25" }, "pdf"),
    ).toBe("voucher-2026-11-25.pdf");
    expect(buildVoucherFilename({ voucherNumber: "", date: "" }, "png")).toBe(
      "voucher.png",
    );
  });

  it("strips unsafe characters and avoids duplicate voucher prefix", () => {
    expect(
      buildVoucherFilename(
        { voucherNumber: "Voucher #12: Ma Su", date: "2026-11-25" },
        "pdf",
      ),
    ).toBe("Voucher-12-Ma-Su-2026-11-25.pdf");
  });
});

describe("calculateCaptureScale", () => {
  it("uses target high-res scale 3 for standard mobile/desktop voucher sheets", () => {
    expect(calculateCaptureScale(460, 720)).toBe(3);
  });

  it("clamps scale for very tall vouchers so canvas pixel budget stays safe", () => {
    const scale = calculateCaptureScale(460, 5000);
    expect(scale).toBeGreaterThanOrEqual(1);
    expect(scale).toBeLessThan(3);
    expect(460 * scale * 5000 * scale).toBeLessThanOrEqual(12_000_000);
  });
});

describe("calculatePdfPlacement", () => {
  it("centers a standard voucher on A4 without distortion or overflow", () => {
    const placement = calculatePdfPlacement(1380, 2100, "a4");

    expect(placement.pageWidth).toBe(210);
    expect(placement.pageHeight).toBe(297);
    expect(placement.width).toBeGreaterThan(0);
    expect(placement.height).toBeGreaterThan(0);
    expect(placement.width).toBeLessThanOrEqual(210 - 24);
    expect(placement.height).toBeLessThanOrEqual(297 - 24);
    expect(placement.x).toBeCloseTo((210 - placement.width) / 2, 5);
    expect(placement.y).toBeCloseTo((297 - placement.height) / 2, 5);
    expect(placement.width / placement.height).toBeCloseTo(1380 / 2100, 5);
  });

  it("scales down very tall vouchers proportionally to fit inside A5 margins", () => {
    const placement = calculatePdfPlacement(900, 3600, "a5");

    expect(placement.pageWidth).toBe(148);
    expect(placement.pageHeight).toBe(210);
    expect(placement.height).toBeCloseTo(210 - 20, 5);
    expect(placement.width).toBeCloseTo((210 - 20) * (900 / 3600), 5);
    expect(placement.x).toBeCloseTo((148 - placement.width) / 2, 5);
    expect(placement.y).toBeCloseTo(10, 5);
  });

  it("throws when source dimensions are invalid", () => {
    expect(() => calculatePdfPlacement(0, 500, "a4")).toThrow();
    expect(() => calculatePdfPlacement(400, -10, "a5")).toThrow();
  });
});

describe("exportVoucher", () => {
  it("throws a clear error when the preview element is missing", async () => {
    await expect(
      exportVoucher({
        element: null,
        format: "png",
        paperSize: "a4",
        order: { voucherNumber: "V-001", date: "2026-11-25" },
      }),
    ).rejects.toThrow(/preview element/i);
  });

  it("captures once and triggers PNG, PDF, or both downloads with expected filenames", async () => {
    const fakeCanvas = { width: 1380, height: 1920 } as HTMLCanvasElement;
    const pngBlob = new Blob(["png"], { type: "image/png" });
    const pdfBlob = new Blob(["pdf"], { type: "application/pdf" });

    const captureCanvas = vi.fn().mockResolvedValue(fakeCanvas);
    const toPngBlob = vi.fn().mockResolvedValue(pngBlob);
    const toPdfBlob = vi.fn().mockResolvedValue(pdfBlob);
    const downloadBlob = vi.fn();

    const fakeElement = {} as HTMLElement;
    const order = { voucherNumber: "V-009", date: "2026-11-25" };

    await exportVoucher(
      { element: fakeElement, format: "png", paperSize: "a4", order },
      { captureCanvas, toPngBlob, toPdfBlob, downloadBlob, betweenDownloadsMs: 0 },
    );
    expect(captureCanvas).toHaveBeenCalledTimes(1);
    expect(toPngBlob).toHaveBeenCalledTimes(1);
    expect(toPdfBlob).not.toHaveBeenCalled();
    expect(downloadBlob).toHaveBeenCalledWith(
      pngBlob,
      "voucher-V-009-2026-11-25.png",
    );

    vi.clearAllMocks();
    await exportVoucher(
      { element: fakeElement, format: "pdf", paperSize: "a5", order },
      { captureCanvas, toPngBlob, toPdfBlob, downloadBlob, betweenDownloadsMs: 0 },
    );
    expect(captureCanvas).toHaveBeenCalledTimes(1);
    expect(toPngBlob).not.toHaveBeenCalled();
    expect(toPdfBlob).toHaveBeenCalledWith(fakeCanvas, "a5");
    expect(downloadBlob).toHaveBeenCalledWith(
      pdfBlob,
      "voucher-V-009-2026-11-25.pdf",
    );

    vi.clearAllMocks();
    await exportVoucher(
      { element: fakeElement, format: "both", paperSize: "a4", order },
      { captureCanvas, toPngBlob, toPdfBlob, downloadBlob, betweenDownloadsMs: 0 },
    );
    expect(captureCanvas).toHaveBeenCalledTimes(1);
    expect(toPngBlob).toHaveBeenCalledTimes(1);
    expect(toPdfBlob).toHaveBeenCalledWith(fakeCanvas, "a4");
    expect(downloadBlob).toHaveBeenNthCalledWith(
      1,
      pngBlob,
      "voucher-V-009-2026-11-25.png",
    );
    expect(downloadBlob).toHaveBeenNthCalledWith(
      2,
      pdfBlob,
      "voucher-V-009-2026-11-25.pdf",
    );
  });
});

describe("copyVoucherImage", () => {
  it("captures PNG blob and writes it via the injected clipboard writer", async () => {
    const fakeCanvas = { width: 1380, height: 1920 } as HTMLCanvasElement;
    const pngBlob = new Blob(["png"], { type: "image/png" });
    const captureCanvas = vi.fn().mockResolvedValue(fakeCanvas);
    const toPngBlob = vi.fn().mockResolvedValue(pngBlob);
    const writeImageBlob = vi.fn().mockResolvedValue(undefined);

    await copyVoucherImage(
      { element: {} as HTMLElement },
      { captureCanvas, toPngBlob, writeImageBlob },
    );

    expect(captureCanvas).toHaveBeenCalledTimes(1);
    expect(toPngBlob).toHaveBeenCalledWith(fakeCanvas);
    expect(writeImageBlob).toHaveBeenCalledWith(pngBlob);
  });

  it("throws when the preview element is missing", async () => {
    await expect(copyVoucherImage({ element: null })).rejects.toThrow(
      /preview element/i,
    );
  });
});
