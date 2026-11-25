"use client";

import * as React from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
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
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={handleFileChange}
      />

      <div className="flex flex-wrap items-center gap-3">
        {value ? (
          <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-background p-1">
            {/* eslint-disable-next-line @next/next/no-img-element -- Data URLs from localStorage must render as raw <img> for DOM capture */}
            <img
              src={value}
              alt={label}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="min-h-10 px-3"
            disabled={isProcessing}
            onClick={() => inputRef.current?.click()}
          >
            {isProcessing ? (
              <Loader2 className="animate-spin" />
            ) : (
              <ImagePlus />
            )}
            <span>{uploadLabel}</span>
          </Button>

          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="min-h-10 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                setErrorMessage(null);
                onChange(undefined);
              }}
            >
              <Trash2 />
              <span>{removeLabel}</span>
            </Button>
          ) : null}
        </div>
      </div>

      {errorMessage ? (
        <p className="text-xs text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
