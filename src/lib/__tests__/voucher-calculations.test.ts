import { describe, expect, it } from "vitest";
import {
  calculateLineTotal,
  calculateSubtotal,
  calculateVoucherTotals,
  createDefaultShopProfile,
  createDefaultVoucherOrder,
  createEmptyPaymentAccount,
  formatCurrency,
} from "@/lib/voucher-calculations";
import type { VoucherLineItem, VoucherOrder } from "@/types/voucher";

describe("voucher calculations", () => {
  it("computes line total and sanitizes negative or non-finite inputs", () => {
    expect(calculateLineTotal({ quantity: 3, unitPrice: 4500 })).toBe(13500);
    expect(calculateLineTotal({ quantity: 2, unitPrice: 12.55 })).toBe(25.1);
    expect(calculateLineTotal({ quantity: 0.1 + 0.2, unitPrice: 10 })).toBe(3);
    expect(calculateLineTotal({ quantity: -2, unitPrice: 1000 })).toBe(0);
    expect(calculateLineTotal({ quantity: Number.NaN, unitPrice: 1000 })).toBe(0);
    expect(calculateLineTotal({ quantity: 2, unitPrice: Number.POSITIVE_INFINITY })).toBe(0);
  });

  it("computes subtotal across line items", () => {
    const items: VoucherLineItem[] = [
      { id: "1", name: "Longyi", quantity: 2, unitPrice: 15000 },
      { id: "2", name: "T-shirt", quantity: 1, unitPrice: 8500 },
    ];

    expect(calculateSubtotal(items)).toBe(38500);
    expect(calculateSubtotal([])).toBe(0);
  });

  it("computes grandTotal and balanceDue for standard MMK order", () => {
    const order: VoucherOrder = {
      ...createDefaultVoucherOrder("2026-11-25"),
      items: [
        { id: "1", name: "Skincare Set", quantity: 2, unitPrice: 18000 },
        { id: "2", name: "Lipstick", quantity: 1, unitPrice: 9000 },
      ],
      discount: 2000,
      deliveryFee: 3000,
      deposit: 15000,
    };

    expect(calculateVoucherTotals(order)).toEqual({
      subtotal: 45000,
      discount: 2000,
      deliveryFee: 3000,
      grandTotal: 46000,
      deposit: 15000,
      balanceDue: 31000,
    });
  });

  it("clamps grandTotal at 0 when discount exceeds subtotal plus delivery", () => {
    const order: VoucherOrder = {
      ...createDefaultVoucherOrder("2026-11-25"),
      items: [{ id: "1", name: "Scarf", quantity: 1, unitPrice: 5000 }],
      discount: 10000,
      deliveryFee: 2000,
      deposit: 0,
    };

    const totals = calculateVoucherTotals(order);
    expect(totals.subtotal).toBe(5000);
    expect(totals.grandTotal).toBe(0);
    expect(totals.balanceDue).toBe(0);
  });

  it("clamps balanceDue at 0 when deposit meets or exceeds grandTotal", () => {
    const order: VoucherOrder = {
      ...createDefaultVoucherOrder("2026-11-25"),
      items: [{ id: "1", name: "Bag", quantity: 1, unitPrice: 25000 }],
      discount: 0,
      deliveryFee: 3000,
      deposit: 30000,
    };

    const totals = calculateVoucherTotals(order);
    expect(totals.grandTotal).toBe(28000);
    expect(totals.balanceDue).toBe(0);
  });

  it("handles decimal currencies cleanly without floating-point drift", () => {
    const order: VoucherOrder = {
      ...createDefaultVoucherOrder("2026-11-25"),
      currency: "USD",
      items: [
        { id: "1", name: "Serum", quantity: 3, unitPrice: 12.1 },
        { id: "2", name: "Cream", quantity: 1, unitPrice: 8.25 },
      ],
      discount: 0.55,
      deliveryFee: 2.5,
      deposit: 10.2,
    };

    expect(calculateVoucherTotals(order)).toEqual({
      subtotal: 44.55,
      discount: 0.55,
      deliveryFee: 2.5,
      grandTotal: 46.5,
      deposit: 10.2,
      balanceDue: 36.3,
    });
  });

  it("provides sensible defaults for shop profile and voucher order", () => {
    const profile = createDefaultShopProfile();
    expect(profile.paymentAccounts).toEqual([]);
    expect(profile.accentColor).toMatch(/^#[0-9a-fA-F]{6}$/);

    const order = createDefaultVoucherOrder("2026-11-25");
    expect(order.currency).toBe("MMK");
    expect(order.date).toBe("2026-11-25");
    expect(order.items.length).toBe(1);

    const payment = createEmptyPaymentAccount();
    expect(payment.id).toBeTruthy();
    expect(payment.label).toBe("");
    expect(payment.qrImageDataUrl).toBeUndefined();
  });
});

describe("currency formatting", () => {
  it("formats MMK cleanly in Burmese and English", () => {
    expect(formatCurrency(15000, "MMK", "my")).toBe("15,000 ကျပ်");
    expect(formatCurrency(15000, "MMK", "en")).toBe("15,000 Ks");
    expect(formatCurrency(0, "MMK", "my")).toBe("0 ကျပ်");
    expect(formatCurrency(1234.6, "MMK", "en")).toBe("1,235 Ks");
  });

  it("formats THB cleanly with whole and fractional amounts", () => {
    expect(formatCurrency(1250, "THB", "my")).toBe("฿1,250");
    expect(formatCurrency(1250.5, "THB", "en")).toBe("฿1,250.50");
  });

  it("formats USD cleanly with whole and fractional amounts", () => {
    expect(formatCurrency(45, "USD", "en")).toBe("$45");
    expect(formatCurrency(45.5, "USD", "my")).toBe("$45.50");
  });

  it("handles negative or non-finite values safely when formatting", () => {
    expect(formatCurrency(-500, "MMK", "en")).toBe("-500 Ks");
    expect(formatCurrency(-12.5, "USD", "en")).toBe("-$12.50");
    expect(formatCurrency(Number.NaN, "MMK", "my")).toBe("0 ကျပ်");
  });
});
