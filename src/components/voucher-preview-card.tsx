"use client";

import * as React from "react";
import { Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Dictionary } from "@/lib/i18n";
import {
  calculateLineTotal,
  calculateVoucherTotals,
  formatCurrency,
} from "@/lib/voucher-calculations";
import {
  DEFAULT_ACCENT_COLOR,
  type Language,
  type ShopProfile,
  type VoucherOrder,
} from "@/types/voucher";

export interface VoucherPreviewCardProps {
  dictionary: Dictionary;
  language: Language;
  shopProfile: ShopProfile;
  order: VoucherOrder;
  previewRef?: React.Ref<HTMLDivElement>;
}

export function VoucherPreviewCard({
  dictionary,
  language,
  shopProfile,
  order,
  previewRef,
}: VoucherPreviewCardProps) {
  const accentColor = shopProfile.accentColor.trim() || DEFAULT_ACCENT_COLOR;
  const totals = calculateVoucherTotals(order);
  const isPaidInFull = totals.grandTotal > 0 && totals.balanceDue === 0;
  const visibleItems = order.items.filter(
    (item) => item.name.trim().length > 0 || item.unitPrice > 0,
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{dictionary.previewTitle}</CardTitle>
          <Badge variant="outline">{dictionary.voucherHeading}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          ref={previewRef}
          data-voucher-sheet="true"
          className="mx-auto w-full max-w-[460px] overflow-hidden rounded-xl border border-neutral-200 bg-white text-neutral-900 shadow-xs"
        >
          <div
            className="h-2 w-full"
            style={{ backgroundColor: accentColor }}
          />

          <div className="space-y-3.5 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                {shopProfile.logoDataUrl ? (
                  <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-white p-1">
                    {/* eslint-disable-next-line @next/next/no-img-element -- Data URL logo preview */}
                    <img
                      src={shopProfile.logoDataUrl}
                      alt={dictionary.shopLogo}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div
                    className="flex size-12 shrink-0 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Store className="size-5" />
                  </div>
                )}

                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="wrap-anywhere text-base font-semibold leading-snug text-neutral-900">
                    {shopProfile.shopName.trim() ||
                      dictionary.shopProfileSummaryEmpty}
                  </p>
                  {shopProfile.phones.trim() ? (
                    <p className="wrap-anywhere text-xs text-neutral-600">
                      {shopProfile.phones}
                    </p>
                  ) : null}
                  {shopProfile.addressOrSocial.trim() ? (
                    <p className="whitespace-pre-line wrap-anywhere text-xs text-neutral-600">
                      {shopProfile.addressOrSocial}
                    </p>
                  ) : null}
                </div>
              </div>

              <Badge
                variant="outline"
                className="shrink-0"
                style={{
                  borderColor: accentColor,
                  color: accentColor,
                  backgroundColor: `${accentColor}10`,
                }}
              >
                {dictionary.voucherHeading}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs">
              <div className="min-w-0 space-y-0.5">
                <p className="text-[11px] text-neutral-500">
                  {dictionary.voucherNoLabel}
                </p>
                <p className="wrap-anywhere font-semibold tabular-nums text-neutral-900">
                  {order.voucherNumber.trim() || "—"}
                </p>
              </div>
              <div className="min-w-0 space-y-0.5 text-right">
                <p className="text-[11px] text-neutral-500">
                  {dictionary.dateLabel}
                </p>
                <p className="wrap-anywhere font-semibold tabular-nums text-neutral-900">
                  {order.date.trim() || "—"}
                </p>
              </div>
            </div>

            <div className="space-y-0.5 text-xs">
              <p
                className="text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: accentColor }}
              >
                {dictionary.billToLabel}
              </p>
              <p className="wrap-anywhere text-sm font-medium text-neutral-900">
                {order.customer.name.trim() || "—"}
              </p>
              {order.customer.phone.trim() ? (
                <p className="wrap-anywhere text-neutral-600">
                  {dictionary.phoneLabel}: {order.customer.phone}
                </p>
              ) : null}
              {order.customer.address.trim() ? (
                <p className="whitespace-pre-line wrap-anywhere text-neutral-600">
                  {dictionary.addressLabel}: {order.customer.address}
                </p>
              ) : null}
            </div>

            <div className="overflow-hidden rounded-lg border border-neutral-200">
              <table className="w-full table-fixed border-collapse text-xs">
                <thead>
                  <tr
                    style={{
                      backgroundColor: `${accentColor}0d`,
                      borderBottom: `1.5px solid ${accentColor}40`,
                    }}
                  >
                    <th className="w-[42%] px-2.5 py-2 text-left font-semibold text-neutral-700">
                      {dictionary.itemCol}
                    </th>
                    <th className="w-[12%] px-1 py-2 text-right font-semibold text-neutral-700">
                      {dictionary.qtyCol}
                    </th>
                    <th className="w-[22%] px-1.5 py-2 text-right font-semibold text-neutral-700">
                      {dictionary.priceCol}
                    </th>
                    <th className="w-[24%] px-2.5 py-2 text-right font-semibold text-neutral-700">
                      {dictionary.amountCol}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-2.5 py-4 text-center text-xs text-neutral-400"
                      >
                        {dictionary.noItemsPlaceholder}
                      </td>
                    </tr>
                  ) : (
                    visibleItems.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-neutral-100 last:border-b-0"
                      >
                        <td className="px-2.5 py-2 align-top wrap-anywhere text-neutral-900">
                          {item.name.trim() || "—"}
                        </td>
                        <td className="px-1 py-2 align-top text-right tabular-nums text-neutral-700">
                          {item.quantity}
                        </td>
                        <td className="px-1.5 py-2 align-top text-right tabular-nums wrap-anywhere text-neutral-700">
                          {formatCurrency(
                            item.unitPrice,
                            order.currency,
                            language,
                          )}
                        </td>
                        <td className="px-2.5 py-2 align-top text-right font-medium tabular-nums wrap-anywhere text-neutral-900">
                          {formatCurrency(
                            calculateLineTotal(item),
                            order.currency,
                            language,
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-3">
                <span className="text-neutral-600">
                  {dictionary.subtotalLabel}
                </span>
                <span className="font-medium tabular-nums text-neutral-900">
                  {formatCurrency(totals.subtotal, order.currency, language)}
                </span>
              </div>

              {totals.discount > 0 ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-neutral-600">
                    {dictionary.discountLabel}
                  </span>
                  <span className="tabular-nums text-red-600">
                    -{formatCurrency(totals.discount, order.currency, language)}
                  </span>
                </div>
              ) : null}

              {totals.deliveryFee > 0 ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-neutral-600">
                    {dictionary.deliveryFeeLabel}
                  </span>
                  <span className="tabular-nums text-neutral-900">
                    +
                    {formatCurrency(
                      totals.deliveryFee,
                      order.currency,
                      language,
                    )}
                  </span>
                </div>
              ) : null}

              <Separator className="my-1 bg-neutral-200" />

              <div className="flex items-center justify-between gap-3 text-sm font-semibold text-neutral-900">
                <span>{dictionary.grandTotalLabel}</span>
                <span className="tabular-nums">
                  {formatCurrency(totals.grandTotal, order.currency, language)}
                </span>
              </div>

              {totals.deposit > 0 ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-neutral-600">
                    {dictionary.depositLabel}
                  </span>
                  <span className="tabular-nums text-neutral-900">
                    -{formatCurrency(totals.deposit, order.currency, language)}
                  </span>
                </div>
              ) : null}

              <div
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
                style={{
                  backgroundColor: `${accentColor}14`,
                  color: accentColor,
                }}
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <span>{dictionary.balanceDueLabel}</span>
                  {isPaidInFull ? (
                    <Badge
                      variant="secondary"
                      className="bg-white/90 text-neutral-800"
                    >
                      {dictionary.paidInFull}
                    </Badge>
                  ) : null}
                </div>
                <span className="tabular-nums">
                  {formatCurrency(totals.balanceDue, order.currency, language)}
                </span>
              </div>
            </div>

            {order.notes.trim() ? (
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs">
                <p className="font-medium text-neutral-700">
                  {dictionary.notesLabel}
                </p>
                <p className="mt-0.5 whitespace-pre-line wrap-anywhere text-neutral-600">
                  {order.notes}
                </p>
              </div>
            ) : null}

            {shopProfile.paymentAccounts.length > 0 ? (
              <>
                <Separator className="bg-neutral-200" />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-neutral-600">
                    {dictionary.paymentMethodsLabel}
                  </p>
                  <div className="space-y-2">
                    {shopProfile.paymentAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between gap-3 rounded-lg bg-neutral-50 p-2 text-xs"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <p className="wrap-anywhere font-medium text-neutral-900">
                            {account.label || dictionary.paymentLabel}
                          </p>
                          <p className="wrap-anywhere text-neutral-600">
                            {[account.accountName, account.accountNumber]
                              .filter((part) => part.trim().length > 0)
                              .join(" · ")}
                          </p>
                        </div>
                        {account.qrImageDataUrl ? (
                          <div className="size-12 shrink-0 overflow-hidden rounded border border-neutral-200 bg-white p-0.5">
                            {/* eslint-disable-next-line @next/next/no-img-element -- Data URL QR preview */}
                            <img
                              src={account.qrImageDataUrl}
                              alt={
                                account.label || dictionary.paymentQrImage
                              }
                              className="h-full w-full object-contain"
                            />
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            <Separator className="bg-neutral-200" />
            <p className="whitespace-pre-line wrap-anywhere text-center text-xs text-neutral-500">
              {shopProfile.defaultFooter.trim() || dictionary.thankYouFallback}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
