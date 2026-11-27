"use client";

import * as React from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ImageProcessingError,
  processImageFile,
  type ImagePreset,
} from "@/lib/image-helper";
import type { Dictionary } from "@/lib/i18n";

interface ImageUploadFieldProps {
  id: string;
  label: string;
  uploadLabel: string;
  removeLabel: string;
  value?: string;
  preset: ImagePreset;
  dictionary: Pick<Dictionary, "invalidImageType" | "imageProcessError">;
  hideLabel?: boolean;
  onChange: (dataUrl: string | undefined) => void;
}

export function ImageUploadField({
  id,
  label,
  uploadLabel,
  removeLabel,
  value,
  preset,
  dictionary,
  hideLabel = false,
  onChange,
}: ImageUploadFieldProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Clear input value so re-selecting the same file after an error or removal still fires onChange.
    event.target.value = "";
    if (!file) {
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const dataUrl = await processImageFile(file, { preset });
      onChange(dataUrl);
    } catch (error) {
      if (
        error instanceof ImageProcessingError &&
        error.code === "INVALID_TYPE"
      ) {
        setErrorMessage(dictionary.invalidImageType);
      } else {
        setErrorMessage(dictionary.imageProcessError);
      }
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-1.5">
      {!hideLabel ? (
        <Label htmlFor={id} className="text-xs font-medium text-stone-700">
          {label}
        </Label>
      ) : null}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={handleFileChange}
      />

      {value ? (
        <div className="relative inline-block">
          <button
            type="button"
            data-upload-tile="true"
            disabled={isProcessing}
            aria-label={uploadLabel}
            onClick={() => inputRef.current?.click()}
            className="group relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-stone-200 bg-white p-1.5 transition-colors hover:border-stone-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- Data URLs from localStorage must render as raw <img> for DOM capture */}
            <img
              src={value}
              alt={label}
              className="max-h-full max-w-full object-contain"
            />
            {isProcessing ? (
              <span className="absolute inset-0 flex items-center justify-center bg-white/80">
                <Loader2 className="size-4 animate-spin text-stone-700" />
              </span>
            ) : null}
          </button>

          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            aria-label={removeLabel}
            title={removeLabel}
            onClick={() => {
              setErrorMessage(null);
              onChange(undefined);
            }}
            className="absolute -top-2 -right-2 z-10 size-6 rounded-full border-rose-200 bg-white text-rose-600 shadow-sm transition-all duration-150 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 active:not-aria-[haspopup]:translate-y-0 active:scale-95"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          data-upload-tile="true"
          disabled={isProcessing}
          onClick={() => inputRef.current?.click()}
          className="flex h-20 w-full items-center justify-center gap-2 rounded-lg border border-stone-300/90 bg-[#FAF8F4] px-3 text-xs font-medium text-stone-600 transition-colors hover:border-stone-400 hover:bg-[#F3EFE6] hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {isProcessing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ImagePlus className="size-4 text-stone-500" />
          )}
          <span>{uploadLabel}</span>
        </button>
      )}

      {errorMessage ? (
        <p className="text-xs text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
