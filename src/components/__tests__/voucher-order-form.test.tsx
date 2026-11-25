import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VoucherOrderForm } from "@/components/voucher-order-form";
import { getDictionary } from "@/lib/i18n";
import { createDefaultVoucherOrder } from "@/lib/voucher-calculations";

describe("VoucherOrderForm", () => {
  it("renders metadata, line items before customer details, mobile qty steppers, expandable optional fields, and inline summary ledger", () => {
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

    expect(html).toContain('id="voucher-number"');
    expect(html).toContain('id="voucher-date"');
    expect(html).toContain('id="order-currency"');
    expect(html).toContain('data-line-items-table="true"');
    expect(html).toContain('id="order-discount"');
    expect(html).toContain('id="order-delivery-fee"');
    expect(html).toContain('id="order-deposit"');
    expect(html).toContain("24,000 Ks");
    expect(html).toContain("25,500 Ks");
    expect(html).toContain("20,500 Ks");
    expect(html).not.toContain('data-slot="card"');

    // Line items come before customer details for faster mobile entry
    const itemsIndex = html.indexOf('data-line-items-table="true"');
    const customerIndex = html.indexOf('id="customer-name"');
    expect(itemsIndex).toBeGreaterThan(-1);
    expect(customerIndex).toBeGreaterThan(itemsIndex);

    // Touch-friendly quantity stepper buttons and expandable optional field triggers
    expect(html).toContain(`${enDict.decreaseQty} #1`);
    expect(html).toContain(`${enDict.increaseQty} #1`);
    expect(html).toContain(enDict.addAddress);
    expect(html).toContain(enDict.addNote);
  });
});
