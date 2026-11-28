"use client";

import * as React from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Download,
  File,
  Image as ImageIcon,
  Layers,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n";
import { copyVoucherImage, exportVoucher } from "@/lib/voucher-export";
import type { ExportFormat, PdfPaperSize, VoucherOrder } from "@/types/voucher";

const EXPORT_FORMATS: readonly ExportFormat[] = ["png", "pdf", "both"];
const PDF_PAPER_SIZES: readonly PdfPaperSize[] = ["a4", "a5"];

const FORMAT_BUTTON_STYLES: Record<
  ExportFormat,
  { icon: string; active: string; inactive: string }
> = {
  png: {
    icon: "text-sky-600",
    active:
      "border-sky-500 bg-sky-50 text-sky-950 shadow-xs ring-1 ring-sky-500/25",
    inactive:
      "border-stone-200 bg-stone-50/70 text-stone-700 hover:border-sky-300 hover:bg-sky-50/50 hover:text-sky-950",
  },
  pdf: {
    icon: "text-rose-600",
    active:
      "border-rose-500 bg-rose-50 text-rose-950 shadow-xs ring-1 ring-rose-500/25",
    inactive:
      "border-stone-200 bg-stone-50/70 text-stone-700 hover:border-rose-300 hover:bg-rose-50/50 hover:text-rose-950",
  },
  both: {
    icon: "text-violet-600",
    active:
      "border-violet-500 bg-violet-50 text-violet-950 shadow-xs ring-1 ring-violet-500/25",
    inactive:
      "border-stone-200 bg-stone-50/70 text-stone-700 hover:border-violet-300 hover:bg-violet-50/50 hover:text-violet-950",
  },
};

export type ExportStatus = "idle" | "exporting" | "success" | "error";
export type CopyStatus = "idle" | "copying" | "success" | "error";

export interface VoucherExportCardProps {
  dictionary: Dictionary;
  accentColor: string;
  order: Pick<VoucherOrder, "voucherNumber" | "date">;
  previewRef: React.RefObject<HTMLDivElement | null>;
  initialFormat?: ExportFormat;
  initialPaperSize?: PdfPaperSize;
  format?: ExportFormat;
  paperSize?: PdfPaperSize;
  status?: ExportStatus;
  copyStatus?: CopyStatus;
  hideMobileDownload?: boolean;
  onFormatChange?: (format: ExportFormat) => void;
  onPaperSizeChange?: (paperSize: PdfPaperSize) => void;
  onExport?: () => Promise<void> | void;
  onCopyImage?: () => Promise<void> | void;
}

export function VoucherExportCard({
  dictionary,
  order,
  previewRef,
  initialFormat = "png",
  initialPaperSize = "a4",
  format: controlledFormat,
  paperSize: controlledPaperSize,
  status: controlledStatus,
  copyStatus: controlledCopyStatus,
  hideMobileDownload = false,
  onFormatChange,
  onPaperSizeChange,
  onExport,
  onCopyImage,
}: VoucherExportCardProps) {
  const [uncontrolledFormat, setUncontrolledFormat] =
    React.useState<ExportFormat>(initialFormat);
  const [uncontrolledPaperSize, setUncontrolledPaperSize] =
    React.useState<PdfPaperSize>(initialPaperSize);
  const [uncontrolledStatus, setUncontrolledStatus] =
    React.useState<ExportStatus>("idle");
  const [uncontrolledCopyStatus, setUncontrolledCopyStatus] =
    React.useState<CopyStatus>("idle");

  const format = controlledFormat ?? uncontrolledFormat;
  const paperSize = controlledPaperSize ?? uncontrolledPaperSize;
  const status = controlledStatus ?? uncontrolledStatus;
  const copyStatus = controlledCopyStatus ?? uncontrolledCopyStatus;

  const includesPdf = format === "pdf" || format === "both";

  const formatLabels: Record<ExportFormat, string> = {
    png: dictionary.formatPng,
    pdf: dictionary.formatPdf,
    both: dictionary.formatBoth,
  };

  const formatIcons: Record<
    ExportFormat,
    React.ComponentType<{ className?: string }>
  > = {
    png: ImageIcon,
    pdf: File,
    both: Layers,
  };

  const paperSizeLabels: Record<PdfPaperSize, string> = {
    a4: dictionary.paperA4,
    a5: dictionary.paperA5,
  };

  function handleFormatChange(nextFormat: ExportFormat) {
    if (onFormatChange) {
      onFormatChange(nextFormat);
    } else {
      setUncontrolledFormat(nextFormat);
      setUncontrolledStatus("idle");
    }
  }

  function handlePaperSizeChange(nextPaperSize: PdfPaperSize) {
    if (onPaperSizeChange) {
      onPaperSizeChange(nextPaperSize);
    } else {
      setUncontrolledPaperSize(nextPaperSize);
      setUncontrolledStatus("idle");
    }
  }

  async function handleExport() {
    if (onExport) {
      await onExport();
      return;
    }

    setUncontrolledStatus("exporting");
    try {
      await exportVoucher({
        element: previewRef.current,
        format,
        paperSize,
        order,
      });
      setUncontrolledStatus("success");
    } catch {
      setUncontrolledStatus("error");
    }
  }

  async function handleCopyImage() {
    if (onCopyImage) {
      await onCopyImage();
      return;
    }

    setUncontrolledCopyStatus("copying");
    try {
      await copyVoucherImage({ element: previewRef.current });
      setUncontrolledCopyStatus("success");
    } catch {
      setUncontrolledCopyStatus("error");
    }
  }

  return (
    <div className="w-full space-y-2">
      <div className="space-y-2.5 rounded-md border border-stone-200/90 bg-white p-3 shadow-xs">
        <Button
          type="button"
          size="lg"
          disabled={status === "exporting"}
          className={`${
            hideMobileDownload ? "hidden w-full lg:flex" : "flex w-full"
          } min-h-11 gap-1.5 bg-[#009E74] px-3 text-sm font-semibold text-white shadow-xs hover:bg-[#008763]`}
          onClick={handleExport}
        >
          {status === "exporting" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>{dictionary.exportingButton}</span>
            </>
          ) : (
            <>
              <Download className="size-4" />
              <span>{dictionary.downloadButton}</span>
            </>
          )}
        </Button>

        <div
          role="group"
          aria-label={dictionary.exportFormatLabel}
          className="grid w-full grid-cols-3 gap-1.5"
        >
          {EXPORT_FORMATS.map((option) => {
            const isSelected = format === option;
            const FormatIcon = formatIcons[option];
            const styleTokens = FORMAT_BUTTON_STYLES[option];
            return (
              <button
                key={option}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleFormatChange(option)}
                className={`inline-flex min-h-9 min-w-0 items-center justify-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-1.5 text-center text-[11px] leading-snug font-semibold transition-colors sm:gap-1.5 sm:px-2 sm:text-xs ${
                  isSelected ? styleTokens.active : styleTokens.inactive
                }`}
              >
                <FormatIcon className={`size-3.5 shrink-0 ${styleTokens.icon}`} />
                <span>{formatLabels[option]}</span>
              </button>
            );
          })}
        </div>

        {includesPdf ? (
          <div
            role="group"
            aria-label={dictionary.pdfPaperSizeLabel}
            className="grid w-full grid-cols-2 gap-1.5"
          >
            {PDF_PAPER_SIZES.map((size) => {
              const isSelected = paperSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handlePaperSizeChange(size)}
                  className={`inline-flex min-h-8 items-center justify-center whitespace-nowrap rounded-md border px-2 text-center text-xs font-semibold transition-colors ${
                    isSelected
                      ? "border-amber-500 bg-amber-50 text-amber-950 shadow-xs ring-1 ring-amber-500/25"
                      : "border-stone-200 bg-stone-50/70 text-stone-700 hover:border-amber-300 hover:bg-amber-50/50 hover:text-amber-950"
                  }`}
                >
                  {paperSizeLabels[size]}
                </button>
              );
            })}
          </div>
        ) : null}

        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={copyStatus === "copying"}
          className="flex min-h-10 w-full gap-1.5 border-indigo-200 bg-indigo-50/50 px-3 text-sm font-medium text-indigo-950 hover:border-indigo-300 hover:bg-indigo-50"
          onClick={handleCopyImage}
        >
          {copyStatus === "copying" ? (
            <>
              <Loader2 className="size-4 animate-spin text-indigo-600" />
              <span>{dictionary.copyingImageButton}</span>
            </>
          ) : copyStatus === "success" ? (
            <>
              <Check className="size-4 text-emerald-600" />
              <span className="text-emerald-800">
                {dictionary.copyImageSuccess}
              </span>
            </>
          ) : (
            <>
              <Copy className="size-4 text-indigo-600" />
              <span>{dictionary.copyImageButton}</span>
            </>
          )}
        </Button>
      </div>

      {status === "success" ? (
        <p
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800"
        >
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{dictionary.exportSuccess}</span>
        </p>
      ) : null}

      {status === "error" ? (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          <AlertCircle className="size-4 shrink-0" />
          <span>{dictionary.exportError}</span>
        </p>
      ) : null}

      {copyStatus === "error" ? (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          <AlertCircle className="size-4 shrink-0" />
          <span>{dictionary.copyImageError}</span>
        </p>
      ) : null}
    </div>
  );
}
