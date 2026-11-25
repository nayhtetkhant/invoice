import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VoucherPreviewCard } from "@/components/voucher-preview-card";
import { getDictionary } from "@/lib/i18n";
import {
  createDefaultShopProfile,
  createDefaultVoucherOrder,
} from "@/lib/voucher-calculations";
import type { ShopProfile, VoucherOrder } from "@/types/voucher";

const sampleProfile: ShopProfile = {
  shopName: "မမလေး ဖက်ရှင်",
  phones: "09-123456789, 09-987654321",
  addressOrSocial: "Yangon\nfb.com/mamalay",
  logoDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==",
  paymentAccounts: [
    {
      id: "pay-1",
      label: "KBZPay",
      accountName: "Daw Mya Mya",
      accountNumber: "09-123456789",
      qrImageDataUrl: "data:image/png;base64,QRDATA==",
    },
  ],
  defaultFooter: "ဝယ်ယူအားပေးမှုအတွက် ကျေးဇူးတင်ပါသည်။",
  accentColor: "#2563eb",
};

const sampleOrder: VoucherOrder = {
  voucherNumber: "V-2026-001",
  date: "2026-11-25",
  customer: {
    name: "Ma Su",
    phone: "09-555111222",
    address: "Hledan, Kamayut Township",
  },
  items: [
    { id: "item-1", name: "Silk Longyi", quantity: 2, unitPrice: 15000 },
    { id: "item-2", name: "Cotton Scarf", quantity: 1, unitPrice: 5000 },
  ],
  currency: "MMK",
  discount: 2000,
  deliveryFee: 3000,
  deposit: 10000,
  notes: "Deliver after 3 PM",
};

describe("VoucherPreviewCard", () => {
  it("renders shop profile, order details, line items, totals, payment QR, notes, and accent color", () => {
    const html = renderToStaticMarkup(
      <VoucherPreviewCard
        dictionary={getDictionary("en")}
        language="en"
        shopProfile={sampleProfile}
        order={sampleOrder}
      />,
    );

    expect(html).toContain('data-voucher-sheet="true"');
    expect(html).not.toContain('data-slot="card"');
    expect(html).toContain("#2563eb");
    expect(html).toContain(sampleProfile.logoDataUrl);
    expect(html).toContain(sampleProfile.shopName);
    expect(html).toContain(sampleProfile.phones);
    expect(html).toContain("fb.com/mamalay");
    expect(html).toContain("V-2026-001");
    expect(html).toContain("2026-11-25");
    expect(html).toContain("Ma Su");
    expect(html).toContain("09-555111222");
    expect(html).toContain("Hledan, Kamayut Township");
    expect(html).toContain("Silk Longyi");
    expect(html).toContain("30,000 Ks");
    expect(html).toContain("Cotton Scarf");
    expect(html).toContain("5,000 Ks");
    expect(html).toContain("35,000 Ks");
    expect(html).toContain("-2,000 Ks");
    expect(html).toContain("+3,000 Ks");
    expect(html).toContain("36,000 Ks");
    expect(html).toContain("-10,000 Ks");
    expect(html).toContain("26,000 Ks");
    expect(html).toContain("KBZPay");
    expect(html).toContain("Daw Mya Mya · 09-123456789");
    expect(html).toContain("data:image/png;base64,QRDATA==");
    expect(html).toContain("Deliver after 3 PM");
    expect(html).toContain(sampleProfile.defaultFooter);
  });

  it("switches all labels and currency formatting between Burmese and English", () => {
    const myDict = getDictionary("my");
    const myHtml = renderToStaticMarkup(
      <VoucherPreviewCard
        dictionary={myDict}
        language="my"
        shopProfile={sampleProfile}
        order={{ ...sampleOrder, deposit: 50000 }}
      />,
    );

    expect(myHtml).toContain(myDict.voucherHeading);
    expect(myHtml).toContain(myDict.voucherNoLabel);
    expect(myHtml).toContain(myDict.billToLabel);
    expect(myHtml).toContain(myDict.itemCol);
    expect(myHtml).toContain(myDict.grandTotalLabel);
    expect(myHtml).toContain(myDict.balanceDueLabel);
    expect(myHtml).toContain(myDict.paidInFull);
    expect(myHtml).toContain("36,000 ကျပ်");
    expect(myHtml).toContain("0 ကျပ်");
  });

  it("renders fallbacks cleanly for empty profile/order and applies overflow-safe table wrapping", () => {
    const enDict = getDictionary("en");
    const emptyProfile = createDefaultShopProfile();
    const emptyOrder = createDefaultVoucherOrder("2026-11-25");

    const html = renderToStaticMarkup(
      <VoucherPreviewCard
        dictionary={enDict}
        language="en"
        shopProfile={emptyProfile}
        order={emptyOrder}
      />,
    );

    expect(html).toContain(enDict.shopProfileSummaryEmpty);
    expect(html).toContain(enDict.noItemsPlaceholder);
    expect(html).toContain(enDict.thankYouFallback);
    expect(html).toContain("table-fixed");
    expect(html).toContain("wrap-anywhere");
    expect(html).not.toContain(enDict.discountLabel);
    expect(html).not.toContain(enDict.deliveryFeeLabel);
    expect(html).not.toContain(enDict.depositLabel);
    expect(html).not.toContain(enDict.notesLabel);
  });
});
