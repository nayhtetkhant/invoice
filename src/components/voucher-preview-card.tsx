"use client";

import * as React from "react";
import { Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    <div className="space-y-2">
      <div className="mx-auto flex w-full max-w-[460px] items-center justify-between px-1">
        <span className="text-xs font-medium tracking-wide text-slate-500">
          {dictionary.previewTitle}
        </span>
        <span className="text-[11px] font-medium text-slate-400">
          {order.currency}
        </span>
      </div>

      <div
        ref={previewRef}
        data-voucher-sheet="true"
        className="mx-auto w-full max-w-[460px] overflow-hidden rounded-xl border border-neutral-200/90 bg-white text-neutral-900 shadow-[0_14px_36px_-12px_rgba(15,23,42,0.12),0_4px_12px_-2px_rgba(15,23,42,0.05)]"
      >
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: accentColor }}
        />

        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              {shopProfile.logoDataUrl ? (
                <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-white p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element -- Data URL logo preview */}
                  <img
                    src={shopProfile.logoDataUrl}
                    alt={dictionary.shopLogo}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : (
                <div
                  className="flex size-11 shrink-0 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  <Store className="size-5" />
                </div>
              )}

              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="wrap-anywhere text-base font-bold leading-snug tracking-tight text-neutral-900">
                  {shopProfile.shopName.trim() ||
                    dictionary.shopProfileSummaryEmpty}
                </p>
                {shopProfile.phones.trim() ? (
                  <p className="wrap-anywhere text-xs text-neutral-600">
                    {shopProfile.phones}
                  </p>
                ) : null}
                {shopProfile.addressOrSocial.trim() ? (
                  <p className="whitespace-pre-line wrap-anywhere text-xs text-neutral-500">
                    {shopProfile.addressOrSocial}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="shrink-0 space-y-1 text-right">
              <p
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: accentColor }}
              >
                {dictionary.voucherHeading}
              </p>
              <div className="space-y-0.5 text-xs">
                <p className="wrap-anywhere font-semibold tabular-nums text-neutral-900">
                  <span className="font-normal text-neutral-500">
                    {dictionary.voucherNoLabel}:{" "}
                  </span>
                  {order.voucherNumber.trim() || "—"}
                </p>
                <p className="wrap-anywhere tabular-nums text-neutral-600">
                  <span className="text-neutral-500">
                    {dictionary.dateLabel}:{" "}
                  </span>
                  {order.date.trim() || "—"}
                </p>
              </div>
            </div>
          </div>

          <Separator className="bg-neutral-200/80" />

          <div className="space-y-0.5 text-xs">
            <p
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: accentColor }}
            >
              {dictionary.billToLabel}
            </p>
            <p className="wrap-anywhere text-sm font-semibold text-neutral-900">
              {order.customer.name.trim() || "—"}
            </p>
            {order.customer.phone.trim() ? (
              <p className="wrap-anywhere text-neutral-600">
                {dictionary.phoneLabel}: {order.customer.phone}
              </p>
            ) : null}
            {order.customer.address.trim() ? (
              <p className="whitespace-pre-line wrap-anywhere text-neutral-500">
                {dictionary.addressLabel}: {order.customer.address}
              </p>
            ) : null}
          </div>

          <div>
            <table className="w-full table-fixed border-collapse text-xs">
              <thead>
                <tr className="border-y border-neutral-200 bg-neutral-50/80">
                  <th className="w-[42%] px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                    {dictionary.itemCol}
                  </th>
                  <th className="w-[12%] px-1 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                    {dictionary.qtyCol}
                  </th>
                  <th className="w-[22%] px-1.5 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                    {dictionary.priceCol}
                  </th>
                  <th className="w-[24%] px-2 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                    {dictionary.amountCol}
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.length === 0 ? (
                  <tr className="border-b border-neutral-100">
                    <td
                      colSpan={4}
                      className="px-2 py-5 text-center text-xs text-neutral-400"
                    >
                      {dictionary.noItemsPlaceholder}
                    </td>
                  </tr>
                ) : (
                  visibleItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-neutral-100 last:border-neutral-200"
                    >
                      <td className="px-2 py-2.5 align-top wrap-anywhere font-medium text-neutral-900">
                        {item.name.trim() || "—"}
                      </td>
                      <td className="px-1 py-2.5 align-top text-right tabular-nums text-neutral-600">
                        {item.quantity}
                      </td>
                      <td className="px-1.5 py-2.5 align-top text-right tabular-nums wrap-anywhere text-neutral-600">
                        {formatCurrency(
                          item.unitPrice,
                          order.currency,
                          language,
                        )}
                      </td>
                      <td className="px-2 py-2.5 align-top text-right font-semibold tabular-nums wrap-anywhere text-neutral-900">
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

          <div className="ml-auto w-full space-y-1.5 text-xs sm:w-[82%]">
            <div className="flex items-center justify-between gap-3">
              <span className="text-neutral-500">
                {dictionary.subtotalLabel}
              </span>
              <span className="font-medium tabular-nums text-neutral-900">
                {formatCurrency(totals.subtotal, order.currency, language)}
              </span>
            </div>

            {totals.discount > 0 ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-neutral-500">
                  {dictionary.discountLabel}
                </span>
                <span className="tabular-nums text-red-600">
                  -{formatCurrency(totals.discount, order.currency, language)}
                </span>
              </div>
            ) : null}

            {totals.deliveryFee > 0 ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-neutral-500">
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

            <Separator className="my-1.5 bg-neutral-200" />

            <div className="flex items-center justify-between gap-3 text-sm font-semibold text-neutral-900">
              <span>{dictionary.grandTotalLabel}</span>
              <span className="tabular-nums">
                {formatCurrency(totals.grandTotal, order.currency, language)}
              </span>
            </div>

            {totals.deposit > 0 ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-neutral-500">
                  {dictionary.depositLabel}
                </span>
                <span className="tabular-nums text-neutral-900">
                  -{formatCurrency(totals.deposit, order.currency, language)}
                </span>
              </div>
            ) : null}

            <div
              className="mt-1 flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-bold"
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
            <div className="rounded-lg bg-neutral-50 px-3 py-2 text-xs">
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
              <Separator className="bg-neutral-200/80" />
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                  {dictionary.paymentMethodsLabel}
                </p>
                <div className="space-y-2">
                  {shopProfile.paymentAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200/70 bg-neutral-50/70 p-2.5 text-xs"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <p className="wrap-anywhere font-semibold text-neutral-900">
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
                            alt={account.label || dictionary.paymentQrImage}
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

          <Separator className="bg-neutral-200/80" />
          <p className="whitespace-pre-line wrap-anywhere text-center text-xs text-neutral-500">
            {shopProfile.defaultFooter.trim() || dictionary.thankYouFallback}
          </p>
        </div>
      </div>
    </div>
  );
}
