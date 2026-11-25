import { createDefaultShopProfile } from "@/lib/voucher-calculations";
import {
  DEFAULT_ACCENT_COLOR,
  type PaymentAccount,
  type ShopProfile,
} from "@/types/voucher";

export const SHOP_PROFILE_STORAGE_KEY = "mm-voucher-shop-profile-v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asOptionalNonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function createFallbackPaymentId(index: number): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `payment-${index + 1}`;
}

function sanitizeAccentColor(value: unknown): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
      return trimmed;
    }
  }
  return DEFAULT_ACCENT_COLOR;
}

function sanitizePaymentAccount(
  value: unknown,
  index: number,
): PaymentAccount | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    id: asOptionalNonEmptyString(value.id) ?? createFallbackPaymentId(index),
    label: asString(value.label),
    accountName: asString(value.accountName),
    accountNumber: asString(value.accountNumber),
    qrImageDataUrl: asOptionalNonEmptyString(value.qrImageDataUrl),
  };
}

/** Normalizes arbitrary parsed data into a schema-safe ShopProfile with defaults. */
export function sanitizeShopProfile(input: unknown): ShopProfile {
  if (!isRecord(input)) {
    return createDefaultShopProfile();
  }

  const paymentAccounts = Array.isArray(input.paymentAccounts)
    ? input.paymentAccounts
        .map((entry, index) => sanitizePaymentAccount(entry, index))
        .filter((entry): entry is PaymentAccount => entry !== null)
    : [];

  return {
    shopName: asString(input.shopName),
    phones: asString(input.phones),
    addressOrSocial: asString(input.addressOrSocial),
    logoDataUrl: asOptionalNonEmptyString(input.logoDataUrl),
    paymentAccounts,
    defaultFooter: asString(input.defaultFooter),
    accentColor: sanitizeAccentColor(input.accentColor),
  };
}

function getBrowserStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

/** Loads the saved ShopProfile from localStorage, returning defaults on SSR, missing data, or errors. */
export function loadShopProfile(): ShopProfile {
  const storage = getBrowserStorage();
  if (!storage) {
    return createDefaultShopProfile();
  }

  try {
    const raw = storage.getItem(SHOP_PROFILE_STORAGE_KEY);
    if (!raw) {
      return createDefaultShopProfile();
    }
    return sanitizeShopProfile(JSON.parse(raw));
  } catch {
    return createDefaultShopProfile();
  }
}

/** Persists the ShopProfile to localStorage; returns false on SSR or storage errors without throwing. */
export function saveShopProfile(profile: ShopProfile): boolean {
  const storage = getBrowserStorage();
  if (!storage) {
    return false;
  }

  try {
    const sanitized = sanitizeShopProfile(profile);
    storage.setItem(SHOP_PROFILE_STORAGE_KEY, JSON.stringify(sanitized));
    return true;
  } catch {
    return false;
  }
}

/** Clears the stored ShopProfile from localStorage and returns a fresh default profile. */
export function resetShopProfile(): ShopProfile {
  const storage = getBrowserStorage();
  if (storage) {
    try {
      storage.removeItem(SHOP_PROFILE_STORAGE_KEY);
    } catch {
      // Ignore storage access errors during reset so callers still receive clean defaults.
    }
  }
  return createDefaultShopProfile();
}
