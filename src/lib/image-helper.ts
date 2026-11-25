export const MAX_INPUT_FILE_BYTES = 10 * 1024 * 1024;

export const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export const IMAGE_PRESETS = {
  logo: {
    maxDimension: 400,
    maxDataUrlLength: 160_000,
  },
  qr: {
    maxDimension: 360,
    maxDataUrlLength: 140_000,
  },
} as const;

export type ImagePreset = keyof typeof IMAGE_PRESETS;

export type ImageHelperErrorCode =
  | "INVALID_TYPE"
  | "EMPTY_FILE"
  | "FILE_TOO_LARGE"
  | "UNSUPPORTED_ENV"
  | "PROCESSING_FAILED";

export class ImageProcessingError extends Error {
  readonly code: ImageHelperErrorCode;

  constructor(code: ImageHelperErrorCode, message: string) {
    super(message);
    this.name = "ImageProcessingError";
    this.code = code;
  }
}

export interface ProcessImageOptions {
  preset?: ImagePreset;
  maxDimension?: number;
  maxDataUrlLength?: number;
}

const EXTENSION_MIME_PATTERN = /\.(png|jpe?g|webp)$/i;
const DIMENSION_SCALE_STEPS = [1, 0.75, 0.55] as const;
const JPEG_QUALITY_STEPS = [0.85, 0.7, 0.55, 0.4] as const;

function normalizeMimeType(mimeType: string): string {
  const normalized = mimeType.toLowerCase().trim();
  return normalized === "image/jpg" ? "image/jpeg" : normalized;
}

function isPngFile(file: Pick<File, "name" | "type">): boolean {
  const normalizedType = normalizeMimeType(file.type);
  if (normalizedType === "image/png") {
    return true;
  }
  return normalizedType === "" && /\.png$/i.test(file.name);
}

/** Validates image file type (PNG, JPG, WebP) and byte size before decoding. */
export function validateImageFile(
  file: Pick<File, "name" | "type" | "size">,
): void {
  if (!Number.isFinite(file.size) || file.size <= 0) {
    throw new ImageProcessingError("EMPTY_FILE", "Selected image file is empty.");
  }

  if (file.size > MAX_INPUT_FILE_BYTES) {
    throw new ImageProcessingError(
      "FILE_TOO_LARGE",
      "Selected image file exceeds the maximum allowed size.",
    );
  }

  const normalizedType = normalizeMimeType(file.type);
  if (normalizedType !== "") {
    if (
      !ACCEPTED_IMAGE_MIME_TYPES.includes(
        normalizedType as (typeof ACCEPTED_IMAGE_MIME_TYPES)[number],
      )
    ) {
      throw new ImageProcessingError(
        "INVALID_TYPE",
        "Unsupported image type. Choose a PNG, JPG, or WebP file.",
      );
    }
    return;
  }

  if (!EXTENSION_MIME_PATTERN.test(file.name)) {
    throw new ImageProcessingError(
      "INVALID_TYPE",
      "Unsupported image file extension. Choose a PNG, JPG, or WebP file.",
    );
  }
}

/** Calculates aspect-preserving target dimensions bounded by maxDimension. */
export function calculateScaledDimensions(
  width: number,
  height: number,
  maxDimension: number,
): { width: number; height: number } {
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    !Number.isFinite(maxDimension) ||
    width <= 0 ||
    height <= 0 ||
    maxDimension <= 0
  ) {
    throw new ImageProcessingError(
      "PROCESSING_FAILED",
      "Image dimensions and maxDimension must be positive finite numbers.",
    );
  }

  if (width <= maxDimension && height <= maxDimension) {
    return {
      width: Math.round(width),
      height: Math.round(height),
    };
  }

  const scale = maxDimension / Math.max(width, height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function loadImageElement(file: File): Promise<{
  image: HTMLImageElement;
  cleanup: () => void;
}> {
  const objectUrl = URL.createObjectURL(file);
  const cleanup = () => {
    URL.revokeObjectURL(objectUrl);
  };

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve({ image, cleanup });
    };
    image.onerror = () => {
      cleanup();
      reject(
        new ImageProcessingError(
          "PROCESSING_FAILED",
          "Could not decode the selected image.",
        ),
      );
    };
    image.src = objectUrl;
  });
}

function renderCanvasDataUrl(
  image: HTMLImageElement,
  width: number,
  height: number,
  mimeType: "image/png" | "image/jpeg",
  quality?: number,
): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new ImageProcessingError(
      "PROCESSING_FAILED",
      "Canvas 2D context is unavailable.",
    );
  }

  if (mimeType === "image/jpeg") {
    // Fill white behind transparent sources so JPEG conversion avoids black backgrounds.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
  } else {
    context.clearRect(0, 0, width, height);
  }

  context.drawImage(image, 0, 0, width, height);

  return quality !== undefined
    ? canvas.toDataURL(mimeType, quality)
    : canvas.toDataURL(mimeType);
}

/**
 * Validates, resizes, and compresses a browser image File into a bounded data URL
 * suitable for localStorage persistence and DOM capture.
 */
export async function processImageFile(
  file: File,
  options: ProcessImageOptions = {},
): Promise<string> {
  validateImageFile(file);

  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    typeof Image === "undefined" ||
    typeof URL?.createObjectURL !== "function"
  ) {
    throw new ImageProcessingError(
      "UNSUPPORTED_ENV",
      "Image processing requires a browser environment.",
    );
  }

  const presetConfig = IMAGE_PRESETS[options.preset ?? "logo"];
  const maxDimension = options.maxDimension ?? presetConfig.maxDimension;
  const maxDataUrlLength =
    options.maxDataUrlLength ?? presetConfig.maxDataUrlLength;

  const { image, cleanup } = await loadImageElement(file);

  try {
    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;
    const baseSize = calculateScaledDimensions(
      sourceWidth,
      sourceHeight,
      maxDimension,
    );
    const preferPng = isPngFile(file);

    for (const scaleFactor of DIMENSION_SCALE_STEPS) {
      const targetWidth = Math.max(1, Math.round(baseSize.width * scaleFactor));
      const targetHeight = Math.max(1, Math.round(baseSize.height * scaleFactor));

      if (preferPng) {
        const pngDataUrl = renderCanvasDataUrl(
          image,
          targetWidth,
          targetHeight,
          "image/png",
        );
        if (
          pngDataUrl.startsWith("data:image/") &&
          pngDataUrl.length <= maxDataUrlLength
        ) {
          return pngDataUrl;
        }
      }

      for (const quality of JPEG_QUALITY_STEPS) {
        const jpegDataUrl = renderCanvasDataUrl(
          image,
          targetWidth,
          targetHeight,
          "image/jpeg",
          quality,
        );
        if (
          jpegDataUrl.startsWith("data:image/") &&
          jpegDataUrl.length <= maxDataUrlLength
        ) {
          return jpegDataUrl;
        }
      }
    }

    throw new ImageProcessingError(
      "PROCESSING_FAILED",
      "Processed image exceeds the maximum storage size.",
    );
  } finally {
    cleanup();
  }
}
