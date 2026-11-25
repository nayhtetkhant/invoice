import {
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

export function createDefaultVoucherOrder(date = getTodayIsoDate()): VoucherOrder {
  return {
    voucherNumber: "",
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
