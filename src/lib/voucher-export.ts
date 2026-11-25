import type {
  ExportFormat,
  PdfPaperSize,
  VoucherOrder,
} from "@/types/voucher";

const TARGET_CAPTURE_SCALE = 3;
const MAX_CANVAS_PIXELS = 12_000_000;
const MAX_CANVAS_WIDTH = 2400;
const OBJECT_URL_REVOKE_DELAY_MS = 10_000;
const DEFAULT_BETWEEN_DOWNLOADS_MS = 250;

const PAPER_SPECS: Record<
  PdfPaperSize,
  { pageWidth: number; pageHeight: number; margin: number; maxContentWidth: number }
> = {
  a4: {
    pageWidth: 210,
    pageHeight: 297,
    margin: 12,
    maxContentWidth: 160,
  },
  a5: {
    pageWidth: 148,
    pageHeight: 210,
    margin: 10,
    maxContentWidth: 128,
  },
};

export interface PdfPlacement {
  pageWidth: number;
  pageHeight: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExportVoucherParams {
  element: HTMLElement | null;
  format: ExportFormat;
  paperSize: PdfPaperSize;
  order: Pick<VoucherOrder, "voucherNumber" | "date">;
}

export interface ExportVoucherDeps {
  captureCanvas?: (element: HTMLElement) => Promise<HTMLCanvasElement>;
  toPngBlob?: (canvas: HTMLCanvasElement) => Promise<Blob>;
  toPdfBlob?: (
    canvas: HTMLCanvasElement,
    paperSize: PdfPaperSize,
  ) => Promise<Blob>;
  downloadBlob?: (blob: Blob, filename: string) => void;
  betweenDownloadsMs?: number;
}

function sanitizeFilenameSegment(value: string): string {
  return value
    .trim()
    .replace(/[\\/:*?"<>|#\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Builds a filesystem-safe download filename from the order's voucher number and date. */
export function buildVoucherFilename(
  order: Pick<VoucherOrder, "voucherNumber" | "date">,
  extension: "png" | "pdf",
): string {
  const numberPart = sanitizeFilenameSegment(order.voucherNumber);
  const datePart = sanitizeFilenameSegment(order.date);
  const parts: string[] = [];

  if (!numberPart || !/^voucher\b/i.test(numberPart)) {
    parts.push("voucher");
  }
  if (numberPart) {
    parts.push(numberPart);
  }
  if (datePart) {
    parts.push(datePart);
  }

  return `${parts.join("-")}.${extension}`;
}

/**
 * Picks a high-resolution capture scale (default 3x) clamped to mobile browser
 * canvas pixel budgets so tall vouchers never render blank.
 */
export function calculateCaptureScale(
  width: number,
  height: number,
  targetScale = TARGET_CAPTURE_SCALE,
): number {
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return 1;
  }

  const areaBound = Math.sqrt(MAX_CANVAS_PIXELS / (width * height));
  const widthBound = MAX_CANVAS_WIDTH / width;
  const bounded = Math.min(targetScale, areaBound, widthBound);

  return Math.max(1, Math.floor(bounded * 100) / 100);
}

/** Computes centered, aspect-preserving millimeter placement on an A4 or A5 PDF page. */
export function calculatePdfPlacement(
  imageWidth: number,
  imageHeight: number,
  paperSize: PdfPaperSize,
): PdfPlacement {
  if (
    !Number.isFinite(imageWidth) ||
    !Number.isFinite(imageHeight) ||
    imageWidth <= 0 ||
    imageHeight <= 0
  ) {
    throw new Error("Captured voucher image must have positive dimensions.");
  }

  const spec = PAPER_SPECS[paperSize];
  const availWidth = Math.min(
    spec.pageWidth - spec.margin * 2,
    spec.maxContentWidth,
  );
  const availHeight = spec.pageHeight - spec.margin * 2;
  const aspectRatio = imageWidth / imageHeight;

  let width = availWidth;
  let height = width / aspectRatio;

  if (height > availHeight) {
    height = availHeight;
    width = height * aspectRatio;
  }

  return {
    pageWidth: spec.pageWidth,
    pageHeight: spec.pageHeight,
    x: (spec.pageWidth - width) / 2,
    y: (spec.pageHeight - height) / 2,
    width,
    height,
  };
}

async function waitForFontsAndImages(element: HTMLElement): Promise<void> {
  if (typeof document !== "undefined" && document.fonts?.ready) {
    await document.fonts.ready;
  }

  const images = Array.from(element.querySelectorAll("img"));
  await Promise.all(
    images.map(async (img) => {
      if (!img.complete) {
        await new Promise<void>((resolve) => {
          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        });
      }
      if (typeof img.decode === "function") {
        await img.decode().catch(() => undefined);
      }
    }),
  );
}

/** Captures the voucher sheet DOM element onto a high-resolution white-backed canvas. */
export async function captureVoucherPngCanvas(
  element: HTMLElement,
): Promise<HTMLCanvasElement> {
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    throw new Error("Voucher preview element is not visible for capture.");
  }

  await waitForFontsAndImages(element);

  const scale = calculateCaptureScale(rect.width, rect.height);
  const { domToCanvas } = await import("modern-screenshot");

  const canvas = await domToCanvas(element, {
    scale,
    backgroundColor: "#ffffff",
    style: {
      margin: "0",
    },
  });

  if (canvas.width <= 0 || canvas.height <= 0) {
    throw new Error("Captured voucher image was empty.");
  }

  return canvas;
}

/** Converts a rendered voucher canvas into a PNG Blob. */
export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (typeof canvas.toBlob === "function") {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("Failed to encode PNG image."));
      }, "image/png");
      return;
    }

    reject(new Error("Canvas PNG encoding is unavailable in this browser."));
  });
}

/** Embeds a captured voucher canvas centered on an A4 or A5 portrait PDF page. */
export async function createVoucherPdfBlob(
  canvas: HTMLCanvasElement,
  paperSize: PdfPaperSize,
): Promise<Blob> {
  const placement = calculatePdfPlacement(
    canvas.width,
    canvas.height,
    paperSize,
  );
  const { jsPDF } = await import("jspdf");

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: paperSize,
    compress: true,
  });

  const pngDataUrl = canvas.toDataURL("image/png");
  pdf.addImage(
    pngDataUrl,
    "PNG",
    placement.x,
    placement.y,
    placement.width,
    placement.height,
    undefined,
    "FAST",
  );

  return pdf.output("blob");
}

/** Triggers a browser file download from a Blob without revoking the URL prematurely. */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.rel = "noopener";
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, OBJECT_URL_REVOKE_DELAY_MS);
}

function delay(ms: number): Promise<void> {
  if (ms <= 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** Captures the voucher preview once and downloads PNG, PDF, or both. */
export async function exportVoucher(
  { element, format, paperSize, order }: ExportVoucherParams,
  deps: ExportVoucherDeps = {},
): Promise<void> {
  if (!element) {
    throw new Error("Voucher preview element is missing.");
  }

  const captureCanvas = deps.captureCanvas ?? captureVoucherPngCanvas;
  const toPngBlob = deps.toPngBlob ?? canvasToPngBlob;
  const toPdfBlob = deps.toPdfBlob ?? createVoucherPdfBlob;
  const downloadBlob = deps.downloadBlob ?? triggerBlobDownload;
  const betweenDownloadsMs =
    deps.betweenDownloadsMs ?? DEFAULT_BETWEEN_DOWNLOADS_MS;

  const canvas = await captureCanvas(element);

  if (format === "png" || format === "both") {
    const pngBlob = await toPngBlob(canvas);
    downloadBlob(pngBlob, buildVoucherFilename(order, "png"));
  }

  if (format === "both") {
    // Give mobile and desktop browsers a brief beat before starting the second download.
    await delay(betweenDownloadsMs);
  }

  if (format === "pdf" || format === "both") {
    const pdfBlob = await toPdfBlob(canvas, paperSize);
    downloadBlob(pdfBlob, buildVoucherFilename(order, "pdf"));
  }
}
