export type Language = "my" | "en";

export type Currency = "MMK" | "THB" | "USD";

export type ExportFormat = "png" | "pdf" | "both";

export type PdfPaperSize = "a4" | "a5";

export const CURRENCIES: readonly Currency[] = ["MMK", "THB", "USD"];

export const DEFAULT_ACCENT_COLOR = "#0f766e";

export const ACCENT_COLOR_PRESETS: readonly string[] = [
  "#0f766e",
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#dc2626",
  "#ea580c",
  "#1f2937",
];

export interface PaymentAccount {
  id: string;
  label: string;
  accountName: string;
  accountNumber: string;
  qrImageDataUrl?: string;
}

export interface ShopProfile {
  shopName: string;
  phones: string;
  addressOrSocial: string;
  logoDataUrl?: string;
  paymentAccounts: PaymentAccount[];
  defaultFooter: string;
  accentColor: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
}

export interface VoucherLineItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface VoucherOrder {
  voucherNumber: string;
  date: string;
  customer: CustomerInfo;
  items: VoucherLineItem[];
  currency: Currency;
  discount: number;
  deliveryFee: number;
  deposit: number;
  notes: string;
}

export interface VoucherTotals {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  grandTotal: number;
  deposit: number;
  balanceDue: number;
}
