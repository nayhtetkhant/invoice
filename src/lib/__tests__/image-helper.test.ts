import { afterEach, describe, expect, it, vi } from "vitest";
import {
  IMAGE_PRESETS,
  ImageProcessingError,
  MAX_INPUT_FILE_BYTES,
  calculateScaledDimensions,
  processImageFile,
  validateImageFile,
} from "@/lib/image-helper";

function createFakeFile(
  name: string,
  type: string,
  size: number,
): File {
  return {
    name,
    type,
    size,
  } as unknown as File;
}

describe("image-helper", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("validateImageFile", () => {
    it("accepts PNG, JPEG, and WebP files within size limit", () => {
      expect(() =>
        validateImageFile(createFakeFile("logo.png", "image/png", 1024)),
      ).not.toThrow();
      expect(() =>
        validateImageFile(createFakeFile("qr.jpg", "image/jpeg", 2048)),
      ).not.toThrow();
      expect(() =>
        validateImageFile(createFakeFile("banner.webp", "image/webp", 4096)),
      ).not.toThrow();
    });

    it("accepts empty MIME type when file extension is a supported image", () => {
      expect(() =>
        validateImageFile(createFakeFile("photo.JPG", "", 1024)),
      ).not.toThrow();
      expect(() =>
        validateImageFile(createFakeFile("qr.png", "", 1024)),
      ).not.toThrow();
    });

    it("rejects unsupported types such as SVG, PDF, and unknown extensions", () => {
      expect(() =>
        validateImageFile(createFakeFile("vector.svg", "image/svg+xml", 500)),
      ).toThrowError(ImageProcessingError);

      try {
        validateImageFile(createFakeFile("doc.pdf", "application/pdf", 500));
      } catch (error) {
        expect(error).toBeInstanceOf(ImageProcessingError);
        expect((error as ImageProcessingError).code).toBe("INVALID_TYPE");
      }

      expect(() =>
        validateImageFile(createFakeFile("notes.txt", "", 500)),
      ).toThrowError(ImageProcessingError);
    });

    it("rejects empty and oversized files", () => {
      try {
        validateImageFile(createFakeFile("empty.png", "image/png", 0));
        expect.unreachable("Expected empty file to throw");
      } catch (error) {
        expect(error).toBeInstanceOf(ImageProcessingError);
        expect((error as ImageProcessingError).code).toBe("EMPTY_FILE");
      }

      try {
        validateImageFile(
          createFakeFile("huge.jpg", "image/jpeg", MAX_INPUT_FILE_BYTES + 1),
        );
        expect.unreachable("Expected oversized file to throw");
      } catch (error) {
        expect(error).toBeInstanceOf(ImageProcessingError);
        expect((error as ImageProcessingError).code).toBe("FILE_TOO_LARGE");
      }
    });
  });

  describe("calculateScaledDimensions", () => {
    it("preserves dimensions already within maxDimension", () => {
      expect(calculateScaledDimensions(240, 180, 400)).toEqual({
        width: 240,
        height: 180,
      });
      expect(calculateScaledDimensions(400, 400, 400)).toEqual({
        width: 400,
        height: 400,
      });
    });

    it("scales landscape and portrait images proportionally", () => {
      expect(calculateScaledDimensions(1600, 800, 400)).toEqual({
        width: 400,
        height: 200,
      });
      expect(calculateScaledDimensions(600, 1200, 360)).toEqual({
        width: 180,
        height: 360,
      });
    });

    it("clamps scaled smaller dimension to at least 1 pixel", () => {
      expect(calculateScaledDimensions(10000, 2, 400)).toEqual({
        width: 400,
        height: 1,
      });
    });

    it("throws on non-positive or non-finite dimensions", () => {
      expect(() => calculateScaledDimensions(0, 100, 400)).toThrow(
        ImageProcessingError,
      );
      expect(() => calculateScaledDimensions(100, -5, 400)).toThrow(
        ImageProcessingError,
      );
      expect(() =>
        calculateScaledDimensions(Number.NaN, 100, 400),
      ).toThrow(ImageProcessingError);
    });
  });

  describe("processImageFile", () => {
    function setupMockBrowser({
      naturalWidth = 1200,
      naturalHeight = 600,
      failDecode = false,
      toDataUrlImpl,
    }: {
      naturalWidth?: number;
      naturalHeight?: number;
      failDecode?: boolean;
      toDataUrlImpl?: (mimeType?: string, quality?: number) => string;
    } = {}) {
      const drawImage = vi.fn();
      const fillRect = vi.fn();
      const clearRect = vi.fn();
      const revokeObjectURL = vi.fn();
      const createObjectURL = vi.fn(() => "blob:mock-image");

      const canvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          fillStyle: "",
          fillRect,
          clearRect,
          drawImage,
        })),
        toDataURL: vi.fn((mimeType?: string, quality?: number) => {
          if (toDataUrlImpl) {
            return toDataUrlImpl(mimeType, quality);
          }
          return `data:${mimeType ?? "image/png"};base64,small`;
        }),
      };

      class MockImage {
        naturalWidth = naturalWidth;
        naturalHeight = naturalHeight;
        width = naturalWidth;
        height = naturalHeight;
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;

        set src(_value: string) {
          queueMicrotask(() => {
            if (failDecode) {
              this.onerror?.();
            } else {
              this.onload?.();
            }
          });
        }
      }

      vi.stubGlobal("window", {});
      vi.stubGlobal("document", {
        createElement: vi.fn((tag: string) => {
          if (tag === "canvas") {
            return canvas;
          }
          throw new Error(`Unexpected tag: ${tag}`);
        }),
      });
      vi.stubGlobal("Image", MockImage);
      vi.stubGlobal("URL", {
        createObjectURL,
        revokeObjectURL,
      });

      return { canvas, drawImage, fillRect, revokeObjectURL };
    }

    it("throws UNSUPPORTED_ENV when called outside a browser", async () => {
      vi.stubGlobal("window", undefined);
      const file = createFakeFile("logo.png", "image/png", 1024);

      await expect(processImageFile(file)).rejects.toMatchObject({
        code: "UNSUPPORTED_ENV",
      });
    });

    it("resizes a large image using preset bounds and revokes object URL", async () => {
      const { canvas, drawImage, revokeObjectURL } = setupMockBrowser({
        naturalWidth: 1200,
        naturalHeight: 600,
      });
      const file = createFakeFile("logo.png", "image/png", 2048);

      const dataUrl = await processImageFile(file, { preset: "logo" });

      expect(canvas.width).toBe(IMAGE_PRESETS.logo.maxDimension);
      expect(canvas.height).toBe(200);
      expect(drawImage).toHaveBeenCalledTimes(1);
      expect(dataUrl).toBe("data:image/png;base64,small");
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-image");
    });

    it("compresses and downscales until output fits within maxDataUrlLength", async () => {
      const { canvas } = setupMockBrowser({
        naturalWidth: 1000,
        naturalHeight: 1000,
        toDataUrlImpl: (mimeType, quality) => {
          if (mimeType === "image/jpeg" && (quality ?? 1) <= 0.55) {
            return "data:image/jpeg;base64,compressed";
          }
          return `data:${mimeType ?? "image/jpeg"};base64,${"x".repeat(500)}`;
        },
      });
      const file = createFakeFile("qr.jpg", "image/jpeg", 4096);

      const result = await processImageFile(file, {
        preset: "qr",
        maxDataUrlLength: 100,
      });

      expect(result).toBe("data:image/jpeg;base64,compressed");
      expect(canvas.width).toBe(IMAGE_PRESETS.qr.maxDimension);
    });

    it("throws PROCESSING_FAILED when image decoding fails", async () => {
      const { revokeObjectURL } = setupMockBrowser({ failDecode: true });
      const file = createFakeFile("corrupt.png", "image/png", 1024);

      await expect(processImageFile(file)).rejects.toMatchObject({
        code: "PROCESSING_FAILED",
      });
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-image");
    });

    it("throws PROCESSING_FAILED when output cannot fit maxDataUrlLength", async () => {
      setupMockBrowser({
        naturalWidth: 800,
        naturalHeight: 800,
        toDataUrlImpl: () => `data:image/jpeg;base64,${"x".repeat(500)}`,
      });
      const file = createFakeFile("qr.jpg", "image/jpeg", 4096);

      await expect(
        processImageFile(file, { maxDataUrlLength: 50 }),
      ).rejects.toMatchObject({
        code: "PROCESSING_FAILED",
      });
    });
  });
});
