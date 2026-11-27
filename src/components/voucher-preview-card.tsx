"use client";

import * as React from "react";
import { Check, Store } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";
import {
  calculateLineTotal,
  calculateVoucherTotals,
  formatCurrency,
  getAccentTokens,
} from "@/lib/voucher-calculations";
import type { Language, ShopProfile, VoucherOrder } from "@/types/voucher";

export interface VoucherPreviewCardProps {
  dictionary: Dictionary;
  language: Language;
  shopProfile: ShopProfile;
  order: VoucherOrder;
  previewRef?: React.Ref<HTMLDivElement>;
}

function getShopMonogram(shopName: string): string {
  const trimmed = shopName.trim();
  return (Array.from(trimmed)[0] ?? "").toUpperCase();
}

export function VoucherPreviewCard({
  dictionary,
  language,
  shopProfile,
  order,
  previewRef,
}: VoucherPreviewCardProps) {
  const accent = getAccentTokens(shopProfile.accentColor);
  const totals = calculateVoucherTotals(order);
  const isPaidInFull = totals.grandTotal > 0 && totals.balanceDue === 0;
  const visibleItems = order.items.filter(
    (item) => item.name.trim().length > 0 || item.unitPrice > 0,
  );

  const hasShopName = shopProfile.shopName.trim().length > 0;
  const hasVoucherNumber = order.voucherNumber.trim().length > 0;
  const hasDate = order.date.trim().length > 0;
  const hasCustomer =
    order.customer.name.trim().length > 0 ||
    order.customer.phone.trim().length > 0 ||
    order.customer.address.trim().length > 0;
  const displayedPaymentAccounts =
    order.selectedPaymentAccountIds === undefined
      ? shopProfile.paymentAccounts
      : shopProfile.paymentAccounts.filter((account) =>
          order.selectedPaymentAccountIds?.includes(account.id),
        );

  const headingClass =
    language === "en"
      ? "text-[11px] font-bold uppercase tracking-[0.12em]"
      : "text-xs font-bold leading-relaxed";
  const subLabelClass =
    language === "en"
      ? "text-[10px] font-bold uppercase tracking-[0.1em]"
      : "text-[11px] font-semibold leading-relaxed";
  const tableHeaderClass =
    language === "en"
      ? "text-[10px] font-semibold uppercase tracking-wider"
      : "text-[11px] font-semibold leading-relaxed";

  return (
    <div className="space-y-2">
      <div className="mx-auto flex w-full max-w-[460px] items-center justify-between px-0.5">
        <span className="text-xs font-medium text-stone-500">
          {dictionary.previewTitle}
        </span>
        <span className="text-[11px] font-medium tabular-nums text-stone-500">
          {order.currency}
        </span>
      </div>

      <div
        ref={previewRef}
        data-voucher-sheet="true"
        className="mx-auto w-full max-w-[460px] overflow-hidden rounded-sm border border-stone-200/90 bg-white text-stone-900 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_12px_32px_-12px_rgba(0,0,0,0.1)]"
      >
        <div className="space-y-5 p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap sm:gap-4">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              {shopProfile.logoDataUrl ? (
                <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-stone-200/90 bg-white p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element -- Data URL logo preview */}
                  <img
                    src={shopProfile.logoDataUrl}
                    alt={dictionary.shopLogo}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : hasShopName ? (
                <div
                  className="flex size-11 shrink-0 items-center justify-center rounded-md text-base font-bold"
                  style={{
                    backgroundColor: accent.tint,
                    color: accent.ink,
                  }}
                >
                  {getShopMonogram(shopProfile.shopName)}
                </div>
              ) : (
                <div
                  className="flex size-11 shrink-0 items-center justify-center rounded-md"
                  style={{
                    backgroundColor: accent.tint,
                    color: accent.ink,
                  }}
                >
                  <Store className="size-5" />
                </div>
              )}

              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="wrap-anywhere text-base font-bold leading-snug tracking-tight text-stone-900">
                  {hasShopName
                    ? shopProfile.shopName
                    : dictionary.shopProfileSummaryEmpty}
                </p>
                {shopProfile.phones.trim() ? (
                  <p className="wrap-anywhere text-xs text-stone-600">
                    {shopProfile.phones}
                  </p>
                ) : null}
                {shopProfile.addressOrSocial.trim() ? (
                  <p className="whitespace-pre-line wrap-anywhere text-xs text-stone-500">
                    {shopProfile.addressOrSocial}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="shrink-0 space-y-1 text-right">
              <p
                className={`${headingClass} leading-snug`}
                style={{ color: accent.ink }}
              >
                {dictionary.voucherHeading}
              </p>
              {hasVoucherNumber || hasDate ? (
                <div className="space-y-0.5 text-xs">
                  {hasVoucherNumber ? (
                    <p className="wrap-anywhere font-semibold tabular-nums text-stone-900">
                      <span className="font-normal text-stone-500">
                        {dictionary.voucherNoLabel}:{" "}
                      </span>
                      {order.voucherNumber}
                    </p>
                  ) : null}
                  {hasDate ? (
                    <p className="wrap-anywhere tabular-nums text-stone-600">
                      <span className="text-stone-500">
                        {dictionary.dateLabel}:{" "}
                      </span>
                      {order.date}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          {hasCustomer ? (
            <div className="space-y-0.5 border-t border-stone-200/80 pt-3.5 text-xs">
              <p className={subLabelClass} style={{ color: accent.ink }}>
                {dictionary.billToLabel}
              </p>
              {order.customer.name.trim() ? (
                <p className="wrap-anywhere text-sm font-semibold text-stone-900">
                  {order.customer.name}
                </p>
              ) : null}
              {order.customer.phone.trim() ? (
                <p className="wrap-anywhere text-stone-600">
                  {dictionary.phoneLabel}: {order.customer.phone}
                </p>
              ) : null}
              {order.customer.address.trim() ? (
                <p className="whitespace-pre-line wrap-anywhere text-stone-500">
                  {dictionary.addressLabel}: {order.customer.address}
                </p>
              ) : null}
            </div>
          ) : null}

          <div>
            <table className="w-full table-fixed border-collapse text-xs">
              <thead>
                <tr
                  style={{
                    backgroundColor: accent.base,
                    color: accent.onAccent,
                  }}
                >
                  <th
                    className={`w-[38%] py-2 pr-1.5 pl-2.5 text-left ${tableHeaderClass}`}
                  >
                    {dictionary.itemCol}
                  </th>
                  <th
                    className={`w-[18%] px-1.5 py-2 text-right whitespace-nowrap ${tableHeaderClass}`}
                  >
                    {dictionary.qtyCol}
                  </th>
                  <th
                    className={`w-[21%] px-1.5 py-2 text-right ${tableHeaderClass}`}
                  >
                    {dictionary.priceCol}
                  </th>
                  <th
                    className={`w-[23%] py-2 pr-2.5 pl-1.5 text-right ${tableHeaderClass}`}
                  >
                    {dictionary.amountCol}
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.length === 0 ? (
                  <tr className="border-b border-stone-100">
                    <td
                      colSpan={4}
                      className="px-2.5 py-5 text-center text-xs text-stone-500"
                    >
                      {dictionary.noItemsPlaceholder}
                    </td>
                  </tr>
                ) : (
                  visibleItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-stone-100 last:border-stone-200"
                    >
                      <td className="py-2.5 pr-1.5 pl-2.5 align-top wrap-anywhere font-medium text-stone-900">
                        {item.name.trim()}
                      </td>
                      <td className="px-1.5 py-2.5 align-top text-right tabular-nums text-stone-600">
                        {item.quantity}
                      </td>
                      <td className="px-1.5 py-2.5 align-top text-right tabular-nums wrap-anywhere text-stone-600">
                        {formatCurrency(
                          item.unitPrice,
                          order.currency,
                          language,
                        )}
                      </td>
                      <td className="py-2.5 pr-2.5 pl-1.5 align-top text-right font-semibold tabular-nums wrap-anywhere text-stone-900">
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

          <div data-totals-ledger="true" className="w-full space-y-1.5 text-xs">
            <div className="flex items-center justify-between gap-3 px-2.5">
              <span className="text-stone-500">
                {dictionary.subtotalLabel}
              </span>
              <span className="whitespace-nowrap font-medium tabular-nums text-stone-900">
                {formatCurrency(totals.subtotal, order.currency, language)}
              </span>
            </div>

            {totals.discount > 0 ? (
              <div className="flex items-center justify-between gap-3 px-2.5">
                <span className="text-stone-500">
                  {dictionary.discountLabel}
                </span>
                <span className="whitespace-nowrap tabular-nums text-rose-700">
                  -{formatCurrency(totals.discount, order.currency, language)}
                </span>
              </div>
            ) : null}

            {totals.deliveryFee > 0 ? (
              <div className="flex items-center justify-between gap-3 px-2.5">
                <span className="text-stone-500">
                  {dictionary.deliveryFeeLabel}
                </span>
                <span className="whitespace-nowrap tabular-nums text-stone-900">
                  +
                  {formatCurrency(
                    totals.deliveryFee,
                    order.currency,
                    language,
                  )}
                </span>
              </div>
            ) : null}

            <div className="border-t border-stone-200 pt-2">
              <div className="flex items-center justify-between gap-3 px-2.5 text-sm font-semibold text-stone-900">
                <span>{dictionary.grandTotalLabel}</span>
                <span className="whitespace-nowrap tabular-nums">
                  {formatCurrency(totals.grandTotal, order.currency, language)}
                </span>
              </div>
            </div>

            {totals.deposit > 0 ? (
              <div className="flex items-center justify-between gap-3 px-2.5">
                <span className="text-stone-500">
                  {dictionary.depositLabel}
                </span>
                <span className="whitespace-nowrap tabular-nums text-stone-900">
                  -{formatCurrency(totals.deposit, order.currency, language)}
                </span>
              </div>
            ) : null}

            <div
              className="mt-1.5 flex items-center justify-between gap-3 rounded-md px-2.5 py-2.5 text-sm font-bold"
              style={{
                backgroundColor: accent.tint,
                color: accent.ink,
              }}
            >
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span>{dictionary.balanceDueLabel}</span>
                {isPaidInFull ? (
                  <span
                    data-paid-stamp="true"
                    className="inline-flex items-center gap-1 rounded border border-emerald-700/70 bg-white px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-emerald-800"
                  >
                    <Check className="size-2.5" />
                    <span>{dictionary.paidInFull}</span>
                  </span>
                ) : null}
              </div>
              <span className="shrink-0 whitespace-nowrap tabular-nums">
                {formatCurrency(totals.balanceDue, order.currency, language)}
              </span>
            </div>
          </div>

          {order.notes.trim() ? (
            <div className="rounded-md border border-stone-200/75 bg-[#FAF8F4] px-2.5 py-2 text-xs">
              <p className="font-semibold text-stone-700">
                {dictionary.notesLabel}
              </p>
              <p className="mt-0.5 whitespace-pre-line wrap-anywhere text-stone-600">
                {order.notes}
              </p>
            </div>
          ) : null}

          {displayedPaymentAccounts.length > 0 ? (
            <div className="space-y-2.5 border-t border-dashed border-stone-300 pt-4">
              <p className={`${subLabelClass} text-stone-500`}>
                {dictionary.paymentMethodsLabel}
              </p>
              <div
                className={
                  displayedPaymentAccounts.length > 1
                    ? "grid grid-cols-1 gap-2.5 sm:grid-cols-2"
                    : "space-y-2.5"
                }
              >
                {displayedPaymentAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-stone-200/80 bg-[#FAF8F4] p-2.5 text-xs"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="wrap-anywhere font-semibold text-stone-900">
                        {account.label || dictionary.paymentLabel}
                      </p>
                      <p className="wrap-anywhere text-stone-600">
                        {[account.accountName, account.accountNumber]
                          .filter((part) => part.trim().length > 0)
                          .join(" · ")}
                      </p>
                    </div>
                    {account.qrImageDataUrl ? (
                      <div className="size-20 shrink-0 overflow-hidden rounded border border-stone-200 bg-white p-1">
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
          ) : null}

          <div className="border-t border-dashed border-stone-300 pt-3.5">
            <p className="whitespace-pre-line wrap-anywhere text-center text-xs text-stone-500">
              {shopProfile.defaultFooter.trim() || dictionary.thankYouFallback}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
