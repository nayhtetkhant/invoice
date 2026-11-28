import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VoucherOrderForm } from "@/components/voucher-order-form";
import { getDictionary } from "@/lib/i18n";
import { createDefaultVoucherOrder } from "@/lib/voucher-calculations";

describe("VoucherOrderForm", () => {
  it("renders direct-on-paper editor with logo/from/bill-to above line items and notes/ledger below", () => {
    const enDict = getDictionary("en");
    const order = {
      ...createDefaultVoucherOrder("2026-11-25"),
      voucherNumber: "V-101",
      items: [
        { id: "i1", name: "Cotton Tee", quantity: 2, unitPrice: 12000 },
      ],
      discount: 1000,
      deliveryFee: 2500,
      deposit: 5000,
    };

    const html = renderToStaticMarkup(
      <VoucherOrderForm
        dictionary={enDict}
        language="en"
        accentColor="#635bff"
        order={order}
        onOrderChange={() => {}}
      />,
    );

    expect(html).toContain('data-paper-editor="true"');
    expect(html).toContain('id="paper-logo-upload"');
    expect(html).toContain('id="paper-shop-name"');
    expect(html).toContain('id="paper-shop-phones"');
    expect(html).toContain('id="paper-shop-address"');
    expect(html).toContain('id="voucher-number"');
    expect(html).toContain('id="voucher-date"');
    expect(html).toContain('id="order-currency"');
    expect(html).toContain('data-line-items-table="true"');
    expect(html).toContain('id="order-discount"');
    expect(html).toContain('id="order-delivery-fee"');
    expect(html).toContain('id="order-deposit"');
    expect(html).not.toContain('type="number"');
    expect(html).toMatch(/<input[^>]*id="item-qty-0"[^>]*type="text"/);
    expect(html).toMatch(/<input[^>]*id="item-price-0"[^>]*type="text"/);
    expect(html).toMatch(/<input[^>]*id="order-discount"[^>]*type="text"/);
    expect(html).toMatch(/<input[^>]*id="order-delivery-fee"[^>]*type="text"/);
    expect(html).toMatch(/<input[^>]*id="order-deposit"[^>]*type="text"/);
    expect(html).toContain("24,000 Ks");
    expect(html).toContain("25,500 Ks");
    expect(html).toContain("20,500 Ks");
    expect(html).not.toContain('data-slot="card"');

    // invoice-generator.com layout order: From & Bill To sit above Line Items; Notes & Summary sit below
    const fromIndex = html.indexOf('id="paper-shop-name"');
    const customerIndex = html.indexOf('id="customer-name"');
    const itemsIndex = html.indexOf('data-line-items-table="true"');
    const notesIndex = html.indexOf('id="order-notes"');
    const summaryIndex = html.indexOf(enDict.summarySectionTitle);
    expect(fromIndex).toBeGreaterThan(-1);
    expect(customerIndex).toBeGreaterThan(fromIndex);
    expect(itemsIndex).toBeGreaterThan(customerIndex);
    expect(notesIndex).toBeGreaterThan(itemsIndex);
    expect(summaryIndex).toBeGreaterThan(itemsIndex);

    // Touch-friendly quantity stepper buttons and directly visible full-screen sections
    expect(html).toContain(`${enDict.decreaseQty} #1`);
    expect(html).toContain(`${enDict.increaseQty} #1`);
    expect(html).toContain(enDict.addAddress);
    expect(html).not.toContain(enDict.addNote);

    // Only a single Add Item button (at the bottom of the list, not duplicated in header)
    const addItemMatches = html.match(new RegExp(enDict.addItem, "g")) ?? [];
    expect(addItemMatches).toHaveLength(1);

    // No sub-AA text-stone-400, comfortable mobile stepper width, and stacked full-width adjustments with right-edge X cancel
    expect(html).not.toContain("text-stone-400");
    expect(html).toContain("h-10 w-10");
    const discountLabelIdx = html.indexOf('for="order-discount"');
    const discountInputIdx = html.indexOf('id="order-discount"');
    const clearDiscountIdx = html.indexOf(`aria-label="${enDict.discount}"`);
    expect(discountLabelIdx).toBeGreaterThan(-1);
    expect(discountInputIdx).toBeGreaterThan(discountLabelIdx);
    expect(clearDiscountIdx).toBeGreaterThan(discountInputIdx);
    expect(html).toMatch(/<input[^>]*id="order-discount"[^>]*class="[^"]*w-full[^"]*text-left/);
    expect(html).toMatch(/<input[^>]*id="order-delivery-fee"[^>]*class="[^"]*w-full[^"]*text-left/);
    expect(html).toMatch(/<input[^>]*id="order-deposit"[^>]*class="[^"]*w-full[^"]*text-left/);
    expect(html).toContain("absolute -top-2 -right-2 z-10");
    expect(html).toContain("active:not-aria-[haspopup]:translate-y-0");
    expect(html).not.toContain("-translate-y-1/2");
    // Uses Lucide icons instead of raw (+)/(−) or + text symbols
    expect(html).toContain("lucide-circle-minus");
    expect(html).toContain("lucide-circle-plus");
    expect(html).not.toContain(`+ ${enDict.addAddress}`);
    expect(html).not.toContain("(−)");
    expect(html).not.toContain("(+)");
  });

  it("keeps zero-value adjustments collapsed into quick-add chips and offers a Paid in Full shortcut", () => {
    const enDict = getDictionary("en");
    const order = {
      ...createDefaultVoucherOrder("2026-11-25"),
      items: [{ id: "i1", name: "Cotton Tee", quantity: 1, unitPrice: 15000 }],
      discount: 0,
      deliveryFee: 0,
      deposit: 0,
    };

    const html = renderToStaticMarkup(
      <VoucherOrderForm
        dictionary={enDict}
        language="en"
        accentColor="#0f766e"
        order={order}
        onOrderChange={() => {}}
      />,
    );

    expect(html).not.toContain('id="order-discount"');
    expect(html).not.toContain('id="order-delivery-fee"');
    expect(html).not.toContain('id="order-deposit"');
    expect(html).toContain(enDict.addDiscount);
    expect(html).toContain(enDict.addDeliveryFee);
    expect(html).toContain(enDict.addDeposit);
    expect(html).toContain(enDict.markPaidInFull);
    expect(html).toContain("lucide-plus");
    expect(html).not.toContain(`+ ${enDict.addDiscount}`);
    expect(html).not.toContain(`+ ${enDict.addDeliveryFee}`);
    expect(html).not.toContain(`+ ${enDict.addDeposit}`);

    const summaryIdx = html.indexOf(enDict.summarySectionTitle);
    const subtotalIdx = html.indexOf(enDict.subtotal, summaryIdx);
    const discountIdx = html.indexOf(enDict.addDiscount, summaryIdx);
    const deliveryIdx = html.indexOf(enDict.addDeliveryFee, summaryIdx);
    const grandTotalIdx = html.indexOf(enDict.grandTotal, summaryIdx);
    const depositIdx = html.indexOf(enDict.addDeposit, summaryIdx);
    const balanceIdx = html.indexOf(enDict.balanceDueCod, summaryIdx);

    expect(discountIdx).toBeGreaterThan(subtotalIdx);
    expect(deliveryIdx).toBeGreaterThan(discountIdx);
    expect(grandTotalIdx).toBeGreaterThan(deliveryIdx);
    expect(depositIdx).toBeGreaterThan(grandTotalIdx);
    expect(balanceIdx).toBeGreaterThan(depositIdx);
  });

  it("renders selectable payment account toggles when shop payment accounts are provided", () => {
    const enDict = getDictionary("en");
    const order = {
      ...createDefaultVoucherOrder("2026-11-25"),
      selectedPaymentAccountIds: ["pay-1"],
    };

    const html = renderToStaticMarkup(
      <VoucherOrderForm
        dictionary={enDict}
        language="en"
        accentColor="#0f766e"
        order={order}
        paymentAccounts={[
          {
            id: "pay-1",
            label: "KBZPay",
            accountName: "Daw Mya",
            accountNumber: "09-123456789",
          },
          {
            id: "pay-2",
            label: "WavePay",
            accountName: "Daw Mya",
            accountNumber: "09-987654321",
          },
        ]}
        onOrderChange={() => {}}
      />,
    );

    expect(html).toContain("KBZPay");
    expect(html).toContain("WavePay");
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-pressed="false"');
  });

  it("stacks totals ledger, order notes, and payment methods vertically line by line", () => {
    const enDict = getDictionary("en");
    const order = {
      ...createDefaultVoucherOrder("2026-11-25"),
      notes: "Call before delivery",
    };

    const html = renderToStaticMarkup(
      <VoucherOrderForm
        dictionary={enDict}
        language="en"
        accentColor="#0f766e"
        order={order}
        paymentAccounts={[
          {
            id: "pay-1",
            label: "KBZPay",
            accountName: "Daw Mya",
            accountNumber: "09-123456789",
          },
        ]}
        onOrderChange={() => {}}
      />,
    );

    expect(html).not.toContain("md:grid-cols-12");
    expect(html).not.toContain("md:col-span-6");

    const itemsIdx = html.indexOf('data-line-items-table="true"');
    const summaryIdx = html.indexOf(enDict.summarySectionTitle);
    const notesIdx = html.indexOf('id="order-notes"');
    const paymentMethodsIdx = html.indexOf(enDict.paymentMethodsLabel);

    expect(summaryIdx).toBeGreaterThan(itemsIdx);
    expect(notesIdx).toBeGreaterThan(summaryIdx);
    expect(paymentMethodsIdx).toBeGreaterThan(notesIdx);
  });

  it("uses responsive mobile-first grids for voucher meta, customer fields, line-item table, and mobile payment access", () => {
    const enDict = getDictionary("en");
    const order = {
      ...createDefaultVoucherOrder("2026-11-25"),
      items: [{ id: "i1", name: "Cotton Tee", quantity: 1, unitPrice: 12000 }],
      discount: 500,
    };

    const html = renderToStaticMarkup(
      <VoucherOrderForm
        dictionary={enDict}
        language="en"
        accentColor="#0f766e"
        order={order}
        paymentAccounts={[]}
        onOrderChange={() => {}}
        onOpenPaymentSettings={() => {}}
      />,
    );

    // Narrow phone responsiveness: meta and customer grids stack on xs and go 2-col at sm+
    expect(html).toContain("grid-cols-1 gap-2 sm:grid-cols-2");
    // Desktop 5-col line items table activates at md: instead of cramping 640px screens
    expect(html).toContain(
      "md:grid md:grid-cols-[minmax(0,1fr)_76px_112px_minmax(92px,auto)_36px]",
    );
    expect(html).not.toContain(
      "sm:grid sm:grid-cols-[minmax(0,1fr)_80px_116px_100px_36px]",
    );
    // Mobile/tablet users can reach payment settings directly in Edit mode even with 0 accounts
    expect(html).toContain("Payment Accounts &amp; QR");
    // Totals rows wrap safely on narrow viewports
    expect(html).toContain("flex flex-wrap items-center justify-between gap-2");
    // Add address renders as a clearly styled colored button with transition, and full-screen sections stay unhidden
    expect(html).toContain("border-teal-300 bg-teal-50");
    expect(html).toContain("text-teal-600");
    expect(html).not.toContain("hidden md:block md:w-44");
    expect(html).not.toContain("hidden space-y-2 md:block");
    expect(html).not.toContain("hidden space-y-1 lg:block");
  });

  it("renders the delivery address button and expanded textarea at full paper width below From and Bill To", () => {
    const enDict = getDictionary("en");
    const collapsedOrder = createDefaultVoucherOrder("2026-11-25");
    const collapsedHtml = renderToStaticMarkup(
      <VoucherOrderForm
        dictionary={enDict}
        language="en"
        accentColor="#0f766e"
        order={collapsedOrder}
        onOrderChange={() => {}}
      />,
    );

    expect(collapsedHtml).toContain('class="w-full md:col-span-2"');
    expect(collapsedHtml).toMatch(
      new RegExp(
        `<div class="w-full md:col-span-2">\\s*<button[^>]*flex[^>]*w-full[^>]*justify-center[^>]*>.*?${enDict.addAddress}`,
      ),
    );
    const phoneIdx = collapsedHtml.indexOf('id="customer-phone"');
    const addAddrIdx = collapsedHtml.indexOf(enDict.addAddress);
    const itemsIdx = collapsedHtml.indexOf('data-line-items-table="true"');
    expect(addAddrIdx).toBeGreaterThan(phoneIdx);
    expect(itemsIdx).toBeGreaterThan(addAddrIdx);

    const expandedOrder = {
      ...createDefaultVoucherOrder("2026-11-25"),
      customer: {
        name: "Ma Su",
        phone: "09-123456789",
        address: "Kamayut Township, Yangon",
      },
    };
    const expandedHtml = renderToStaticMarkup(
      <VoucherOrderForm
        dictionary={enDict}
        language="en"
        accentColor="#0f766e"
        order={expandedOrder}
        onOrderChange={() => {}}
      />,
    );

    expect(expandedHtml).toContain('class="w-full md:col-span-2"');
    expect(expandedHtml).toMatch(
      /<div class="w-full md:col-span-2">.*?<textarea[^>]*w-full[^>]*id="customer-address"/,
    );
  });
});
