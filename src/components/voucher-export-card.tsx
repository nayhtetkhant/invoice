"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Dictionary } from "@/lib/i18n";
import { exportVoucher } from "@/lib/voucher-export";
import {
  DEFAULT_ACCENT_COLOR,
  type ExportFormat,
  type PdfPaperSize,
  type VoucherOrder,
} from "@/types/voucher";

const EXPORT_FORMATS: readonly ExportFormat[] = ["png", "pdf", "both"];
const PDF_PAPER_SIZES: readonly PdfPaperSize[] = ["a4", "a5"];

export type ExportStatus = "idle" | "exporting" | "success" | "error";

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
  onFormatChange?: (format: ExportFormat) => void;
  onPaperSizeChange?: (paperSize: PdfPaperSize) => void;
  onExport?: () => Promise<void> | void;
}

export function VoucherExportCard({
  dictionary,
  accentColor,
  order,
  previewRef,
  initialFormat = "png",
  initialPaperSize = "a4",
  format: controlledFormat,
  paperSize: controlledPaperSize,
  status: controlledStatus,
  onFormatChange,
  onPaperSizeChange,
  onExport,
}: VoucherExportCardProps) {
  const [uncontrolledFormat, setUncontrolledFormat] =
    React.useState<ExportFormat>(initialFormat);
  const [uncontrolledPaperSize, setUncontrolledPaperSize] =
    React.useState<PdfPaperSize>(initialPaperSize);
  const [uncontrolledStatus, setUncontrolledStatus] =
    React.useState<ExportStatus>("idle");

  const format = controlledFormat ?? uncontrolledFormat;
  const paperSize = controlledPaperSize ?? uncontrolledPaperSize;
  const status = controlledStatus ?? uncontrolledStatus;

  const safeAccentColor = accentColor.trim() || DEFAULT_ACCENT_COLOR;
  const includesPdf = format === "pdf" || format === "both";

  const formatLabels: Record<ExportFormat, string> = {
    png: dictionary.formatPng,
    pdf: dictionary.formatPdf,
    both: dictionary.formatBoth,
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

  return (
    <div className="mx-auto w-full max-w-[460px] space-y-3 rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          {dictionary.exportTitle}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div
          className={
            includesPdf ? "space-y-1" : "space-y-1 sm:col-span-2"
          }
        >
          <Label
            htmlFor="voucher-export-format"
            className="text-[11px] font-medium text-slate-500"
          >
            {dictionary.exportFormatLabel}
          </Label>
          <Select
            value={format}
            items={formatLabels}
            onValueChange={(nextValue) => {
              if (
                nextValue === "png" ||
                nextValue === "pdf" ||
                nextValue === "both"
              ) {
                handleFormatChange(nextValue);
              }
            }}
          >
            <SelectTrigger
              id="voucher-export-format"
              className="w-full bg-white data-[size=default]:h-10 sm:data-[size=default]:h-9"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPORT_FORMATS.map((option) => (
                <SelectItem key={option} value={option}>
                  {formatLabels[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {includesPdf ? (
          <div className="space-y-1">
            <Label
              htmlFor="voucher-pdf-paper-size"
              className="text-[11px] font-medium text-slate-500"
            >
              {dictionary.pdfPaperSizeLabel}
            </Label>
            <Select
              value={paperSize}
              items={paperSizeLabels}
              onValueChange={(nextValue) => {
                if (nextValue === "a4" || nextValue === "a5") {
                  handlePaperSizeChange(nextValue);
                }
              }}
            >
              <SelectTrigger
                id="voucher-pdf-paper-size"
                className="w-full bg-white data-[size=default]:h-10 sm:data-[size=default]:h-9"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PDF_PAPER_SIZES.map((size) => (
                  <SelectItem key={size} value={size}>
                    {paperSizeLabels[size]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>

      <Button
        type="button"
        size="lg"
        disabled={status === "exporting"}
        className="min-h-10 w-full text-sm font-medium text-white shadow-xs hover:opacity-95"
        style={{ backgroundColor: safeAccentColor }}
        onClick={handleExport}
      >
        {status === "exporting" ? (
          <>
            <Loader2 className="animate-spin" />
            <span>{dictionary.exportingButton}</span>
          </>
        ) : (
          <>
            <Download />
            <span>{dictionary.downloadButton}</span>
          </>
        )}
      </Button>

      {status === "success" ? (
        <p
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800"
        >
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{dictionary.exportSuccess}</span>
        </p>
      ) : null}

      {status === "error" ? (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          <AlertCircle className="size-4 shrink-0" />
          <span>{dictionary.exportError}</span>
        </p>
      ) : null}
    </div>
  );
}
