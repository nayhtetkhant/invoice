import {
  CURRENCIES,
  DEFAULT_ACCENT_COLOR,
  type Currency,
  type Language,
  type PaymentAccount,
  type ShopProfile,
  type VoucherLineItem,
  type VoucherOrder,
  type VoucherTotals,
} from "@/types/voucher";

function roundAmount(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function sanitizeNonNegative(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }
  return value;
}

function generateId(prefix: string): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Computes the rounded line total for a single item, treating invalid or negative inputs as 0. */
export function calculateLineTotal(
  item: Pick<VoucherLineItem, "quantity" | "unitPrice">,
): number {
  const quantity = sanitizeNonNegative(item.quantity);
  const unitPrice = sanitizeNonNegative(item.unitPrice);
  return roundAmount(quantity * unitPrice);
}

/** Sums line totals across all items in an order. */
export function calculateSubtotal(
  items: ReadonlyArray<Pick<VoucherLineItem, "quantity" | "unitPrice">>,
): number {
  const total = items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
  return roundAmount(total);
}

/**
 * Computes subtotal, grand total (clamped at 0), and COD / remaining balance due (clamped at 0).
 */
export function calculateVoucherTotals(
  order: Pick<VoucherOrder, "items" | "discount" | "deliveryFee" | "deposit">,
): VoucherTotals {
  const subtotal = calculateSubtotal(order.items);
  const discount = roundAmount(sanitizeNonNegative(order.discount));
  const deliveryFee = roundAmount(sanitizeNonNegative(order.deliveryFee));
  const deposit = roundAmount(sanitizeNonNegative(order.deposit));

  const grandTotal = Math.max(0, roundAmount(subtotal - discount + deliveryFee));
  const balanceDue = Math.max(0, roundAmount(grandTotal - deposit));

  return {
    subtotal,
    discount,
    deliveryFee,
    grandTotal,
    deposit,
    balanceDue,
  };
}

/** Formats a numeric amount in MMK, THB, or USD using Western digits for mobile readability. */
export function formatCurrency(
  amount: number,
  currency: Currency,
  language: Language = "my",
): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const isNegative = safeAmount < 0;
  const absAmount = Math.abs(safeAmount);

  if (currency === "MMK") {
    const rounded = Math.round(absAmount);
    const formatted = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(rounded);
    const sign = isNegative && rounded > 0 ? "-" : "";
    const unit = language === "my" ? "ကျပ်" : "Ks";
    return `${sign}${formatted} ${unit}`;
  }

  const rounded = roundAmount(absAmount);
  const hasDecimals = !Number.isInteger(rounded);
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(rounded);
  const sign = isNegative && rounded > 0 ? "-" : "";
  const symbol = currency === "THB" ? "฿" : "$";
  return `${sign}${symbol}${formatted}`;
}

export function createEmptyLineItem(): VoucherLineItem {
  return {
    id: generateId("item"),
    name: "",
    quantity: 1,
    unitPrice: 0,
  };
}

export function createEmptyPaymentAccount(): PaymentAccount {
  return {
    id: generateId("payment"),
    label: "",
    accountName: "",
    accountNumber: "",
    qrImageDataUrl: undefined,
  };
}

export function createDefaultShopProfile(): ShopProfile {
  return {
    shopName: "",
    phones: "",
    addressOrSocial: "",
    logoDataUrl: undefined,
    paymentAccounts: [],
    defaultFooter: "",
    accentColor: DEFAULT_ACCENT_COLOR,
  };
}

export function createDefaultVoucherOrder(
  date = getTodayIsoDate(),
  voucherNumber = "",
): VoucherOrder {
  return {
    voucherNumber,
    date,
    customer: {
      name: "",
      phone: "",
      address: "",
    },
    items: [createEmptyLineItem()],
    currency: "MMK",
    discount: 0,
    deliveryFee: 0,
    deposit: 0,
    notes: "",
  };
}

function sanitizeString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function sanitizeCurrency(value: unknown): Currency {
  return typeof value === "string" &&
    (CURRENCIES as readonly string[]).includes(value)
    ? (value as Currency)
    : "MMK";
}

function sanitizeLineItem(item: Partial<VoucherLineItem> | undefined): VoucherLineItem {
  const id =
    typeof item?.id === "string" && item.id.trim().length > 0
      ? item.id
      : generateId("item");

  return {
    id,
    name: sanitizeString(item?.name),
    quantity: sanitizeNonNegative(Number(item?.quantity)),
    unitPrice: sanitizeNonNegative(Number(item?.unitPrice)),
  };
}

export interface AccentTokens {
  base: string;
  ink: string;
  onAccent: string;
  tint: string;
}

function normalizeHexColor(value: string | undefined): string {
  const trimmed = value?.trim() ?? "";
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const [, r, g, b] = trimmed.toLowerCase();
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return DEFAULT_ACCENT_COLOR;
}

function getRelativeLuminance(hex: string): number {
  const toLinear = (channelHex: string) => {
    const srgb = Number.parseInt(channelHex, 16) / 255;
    return srgb <= 0.03928
      ? srgb / 12.92
      : ((srgb + 0.055) / 1.055) ** 2.4;
  };
  const r = toLinear(hex.slice(1, 3));
  const g = toLinear(hex.slice(3, 5));
  const b = toLinear(hex.slice(5, 7));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Derives contrast-safe ink, foreground, and soft tint colors from any shop accent hex. */
export function getAccentTokens(accentColor?: string): AccentTokens {
  const base = normalizeHexColor(accentColor);
  const isLight = getRelativeLuminance(base) > 0.45;
  return {
    base,
    ink: isLight ? "#1c1917" : base,
    onAccent: isLight ? "#1c1917" : "#ffffff",
    tint: isLight ? `${base}33` : `${base}14`,
  };
}

/** Strips non-numeric characters from text input, preserving digits and at most one decimal point. */
export function sanitizeNumericText(raw: string): string {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const dotIndex = cleaned.indexOf(".");
  if (dotIndex === -1) {
    return cleaned;
  }
  return `${cleaned.slice(0, dotIndex + 1)}${cleaned.slice(dotIndex + 1).replace(/\./g, "")}`;
}

/** Normalizes form or partial order values into a valid, non-negative VoucherOrder. */
export function sanitizeVoucherOrder(
  order: Partial<VoucherOrder> | undefined,
): VoucherOrder {
  const items = Array.isArray(order?.items)
    ? order.items.map((item) => sanitizeLineItem(item))
    : [createEmptyLineItem()];

  const selectedPaymentAccountIds = Array.isArray(
    order?.selectedPaymentAccountIds,
  )
    ? order.selectedPaymentAccountIds.filter(
        (id): id is string => typeof id === "string",
      )
    : undefined;

  return {
    voucherNumber: sanitizeString(order?.voucherNumber),
    date: sanitizeString(order?.date),
    customer: {
      name: sanitizeString(order?.customer?.name),
      phone: sanitizeString(order?.customer?.phone),
      address: sanitizeString(order?.customer?.address),
    },
    items,
    currency: sanitizeCurrency(order?.currency),
    discount: sanitizeNonNegative(Number(order?.discount)),
    deliveryFee: sanitizeNonNegative(Number(order?.deliveryFee)),
    deposit: sanitizeNonNegative(Number(order?.deposit)),
    notes: sanitizeString(order?.notes),
    ...(selectedPaymentAccountIds !== undefined
      ? { selectedPaymentAccountIds }
      : {}),
  };
}
