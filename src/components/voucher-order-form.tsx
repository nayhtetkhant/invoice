"use client";

import * as React from "react";
import {
  Controller,
  type FieldPath,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import {
  MapPin,
  Minus,
  Plus,
  ReceiptText,
  RotateCcw,
  StickyNote,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { Dictionary } from "@/lib/i18n";
import {
  calculateLineTotal,
  calculateVoucherTotals,
  createDefaultVoucherOrder,
  createEmptyLineItem,
  formatCurrency,
  sanitizeVoucherOrder,
} from "@/lib/voucher-calculations";
import {
  CURRENCIES,
  DEFAULT_ACCENT_COLOR,
  type Currency,
  type Language,
  type VoucherOrder,
} from "@/types/voucher";

const CURRENCY_LABELS: Record<Currency, string> = {
  MMK: "MMK (Ks / ကျပ်)",
  THB: "THB (฿)",
  USD: "USD ($)",
};

function selectIfZero(event: React.FocusEvent<HTMLInputElement>) {
  if (event.currentTarget.value === "0") {
    event.currentTarget.select();
  }
}

function parseNonNegativeInput(value: unknown): number {
  if (value === "" || value === null || value === undefined) {
    return 0;
  }
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

interface VoucherOrderFormProps {
  dictionary: Dictionary;
  language: Language;
  accentColor: string;
  order: VoucherOrder;
  onOrderChange: (order: VoucherOrder) => void;
}

export function VoucherOrderForm({
  dictionary,
  language,
  accentColor,
  order,
  onOrderChange,
}: VoucherOrderFormProps) {
  const [showAddress, setShowAddress] = React.useState(
    () => order.customer.address.trim().length > 0,
  );
  const [showNotes, setShowNotes] = React.useState(
    () => order.notes.trim().length > 0,
  );

  const lastOrderJsonRef = React.useRef(
    JSON.stringify(sanitizeVoucherOrder(order)),
  );

  const form = useForm<VoucherOrder>({
    defaultValues: order,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
    keyName: "fieldKey",
  });

  const watchedItems = useWatch({ control: form.control, name: "items" });
  const watchedCurrency = useWatch({ control: form.control, name: "currency" });
  const watchedDiscount = useWatch({ control: form.control, name: "discount" });
  const watchedDeliveryFee = useWatch({
    control: form.control,
    name: "deliveryFee",
  });
  const watchedDeposit = useWatch({ control: form.control, name: "deposit" });
  const watchedAddress = useWatch({
    control: form.control,
    name: "customer.address",
  });
  const watchedNotes = useWatch({ control: form.control, name: "notes" });

  React.useEffect(() => {
    const unsubscribe = form.subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        const sanitized = sanitizeVoucherOrder(values);
        const serialized = JSON.stringify(sanitized);
        if (serialized === lastOrderJsonRef.current) {
          return;
        }
        lastOrderJsonRef.current = serialized;
        onOrderChange(sanitized);
      },
    });

    return unsubscribe;
  }, [form, onOrderChange]);

  function registerNumeric<TName extends FieldPath<VoucherOrder>>(name: TName) {
    return form.register(name, {
      setValueAs: parseNonNegativeInput,
    });
  }

  function handleStepQuantity(index: number, delta: number) {
    const currentQty = parseNonNegativeInput(watchedItems?.[index]?.quantity);
    const nextQty = Math.max(0, Math.round((currentQty + delta) * 100) / 100);
    form.setValue(`items.${index}.quantity`, nextQty, {
      shouldDirty: true,
      shouldTouch: true,
    });
  }

  function handleClearVoucher() {
    const fresh = createDefaultVoucherOrder();
    lastOrderJsonRef.current = JSON.stringify(fresh);
    form.reset(fresh);
    setShowAddress(false);
    setShowNotes(false);
    onOrderChange(fresh);
  }

  const safeAccent = accentColor.trim() || DEFAULT_ACCENT_COLOR;
  const currency: Currency =
    watchedCurrency === "THB" || watchedCurrency === "USD"
      ? watchedCurrency
      : "MMK";

  const isAddressExpanded =
    showAddress || (watchedAddress?.trim().length ?? 0) > 0;
  const isNotesExpanded =
    showNotes || (watchedNotes?.trim().length ?? 0) > 0;

  const totals = calculateVoucherTotals({
    items: watchedItems ?? [],
    discount: watchedDiscount ?? 0,
    deliveryFee: watchedDeliveryFee ?? 0,
    deposit: watchedDeposit ?? 0,
  });

  const isPaidInFull = totals.grandTotal > 0 && totals.balanceDue === 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ReceiptText
            className="size-4 shrink-0"
            style={{ color: safeAccent }}
          />
          <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
            {dictionary.voucherOrderTitle}
          </h2>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="min-h-9 shrink-0 gap-1.5 px-2.5 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          onClick={handleClearVoucher}
        >
          <RotateCcw className="size-3.5" />
          <span>{dictionary.newClearVoucher}</span>
        </Button>
      </div>

      <section className="grid grid-cols-12 gap-2.5 sm:grid-cols-3 sm:gap-3.5">
        <div className="col-span-5 space-y-1 sm:col-span-1">
          <Label
            htmlFor="voucher-number"
            className="text-xs font-medium text-slate-600"
          >
            {dictionary.voucherNumber}
          </Label>
          <Input
            id="voucher-number"
            className="h-10 font-mono tabular-nums"
            placeholder={dictionary.voucherNumberPlaceholder}
            {...form.register("voucherNumber")}
          />
        </div>

        <div className="col-span-7 space-y-1 sm:col-span-1">
          <Label
            htmlFor="voucher-date"
            className="text-xs font-medium text-slate-600"
          >
            {dictionary.voucherDate}
          </Label>
          <Input
            id="voucher-date"
            type="date"
            className="h-10 tabular-nums"
            {...form.register("date")}
          />
        </div>

        <div className="col-span-12 space-y-1 sm:col-span-1">
          <Label
            htmlFor="order-currency"
            className="text-xs font-medium text-slate-600"
          >
            {dictionary.currency}
          </Label>
          <Controller
            control={form.control}
            name="currency"
            render={({ field }) => (
              <Select
                value={field.value}
                items={CURRENCY_LABELS}
                onValueChange={(nextValue) => {
                  if (
                    nextValue === "MMK" ||
                    nextValue === "THB" ||
                    nextValue === "USD"
                  ) {
                    field.onChange(nextValue);
                  }
                }}
              >
                <SelectTrigger
                  id="order-currency"
                  className="w-full bg-background data-[size=default]:h-10"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((code) => (
                    <SelectItem key={code} value={code}>
                      {CURRENCY_LABELS[code]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </section>

      <Separator className="bg-slate-200/80" />

      <section className="space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {dictionary.itemsSectionTitle}
            </h3>
            <Badge variant="secondary" className="h-5 px-1.5 text-[11px]">
              {fields.length}
            </Badge>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-9 gap-1 px-2.5 text-xs"
            onClick={() => append(createEmptyLineItem())}
          >
            <Plus className="size-3.5" />
            <span>{dictionary.addItem}</span>
          </Button>
        </div>

        <div
          data-line-items-table="true"
          className="overflow-hidden rounded-xl border border-slate-200/90 bg-white"
        >
          <div className="hidden border-b border-slate-200/80 bg-slate-50/80 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 sm:grid sm:grid-cols-[minmax(0,1fr)_72px_112px_96px_36px] sm:gap-2.5">
            <span>{dictionary.itemName}</span>
            <span className="text-right">{dictionary.quantity}</span>
            <span className="text-right">{dictionary.unitPrice}</span>
            <span className="text-right">{dictionary.lineTotal}</span>
            <span className="sr-only">{dictionary.removeItem}</span>
          </div>

          {fields.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-slate-400">
              {dictionary.noItemsPlaceholder}
            </div>
          ) : (
            <div className="divide-y divide-slate-200/70">
              {fields.map((field, index) => {
                const currentItem = watchedItems?.[index];
                const lineTotal = calculateLineTotal({
                  quantity: currentItem?.quantity ?? 0,
                  unitPrice: currentItem?.unitPrice ?? 0,
                });

                return (
                  <div
                    key={field.fieldKey}
                    className="grid grid-cols-12 items-center gap-2 px-3 py-3 sm:grid-cols-[minmax(0,1fr)_72px_112px_96px_36px] sm:gap-2.5 sm:py-2"
                  >
                    <div className="col-span-10 sm:col-span-1">
                      <Label
                        htmlFor={`item-name-${index}`}
                        className="sr-only"
                      >
                        {dictionary.itemName} #{index + 1}
                      </Label>
                      <Input
                        id={`item-name-${index}`}
                        className="h-10 border-slate-200/80 bg-white sm:h-9"
                        placeholder={dictionary.itemNamePlaceholder}
                        {...form.register(`items.${index}.name`)}
                      />
                    </div>

                    <div className="col-span-2 flex justify-end sm:order-5 sm:col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`${dictionary.removeItem} #${index + 1}`}
                        className="size-10 text-slate-400 hover:bg-destructive/10 hover:text-destructive sm:size-9"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    <div className="col-span-5 sm:order-2 sm:col-span-1">
                      <Label
                        htmlFor={`item-qty-${index}`}
                        className="mb-1 block text-[11px] font-medium text-slate-500 sm:sr-only"
                      >
                        {dictionary.quantity}
                      </Label>
                      <div className="flex items-center overflow-hidden rounded-lg border border-slate-200/90 bg-white sm:border-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`${dictionary.decreaseQty} #${index + 1}`}
                          className="h-10 w-9 shrink-0 rounded-none border-r border-slate-200/80 text-slate-600 hover:bg-slate-100 sm:hidden"
                          onClick={() => handleStepQuantity(index, -1)}
                        >
                          <Minus className="size-3.5" />
                        </Button>
                        <Input
                          id={`item-qty-${index}`}
                          type="number"
                          inputMode="numeric"
                          min={0}
                          step="any"
                          className="h-10 min-w-0 rounded-none border-0 bg-white px-1 text-center tabular-nums focus-visible:ring-0 sm:h-9 sm:rounded-lg sm:border sm:border-slate-200/80 sm:px-2.5 sm:text-right sm:focus-visible:ring-3"
                          onFocus={selectIfZero}
                          {...registerNumeric(`items.${index}.quantity`)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`${dictionary.increaseQty} #${index + 1}`}
                          className="h-10 w-9 shrink-0 rounded-none border-l border-slate-200/80 text-slate-600 hover:bg-slate-100 sm:hidden"
                          onClick={() => handleStepQuantity(index, 1)}
                        >
                          <Plus className="size-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="col-span-4 sm:order-3 sm:col-span-1">
                      <Label
                        htmlFor={`item-price-${index}`}
                        className="mb-1 block text-[11px] font-medium text-slate-500 sm:sr-only"
                      >
                        {dictionary.unitPrice}
                      </Label>
                      <Input
                        id={`item-price-${index}`}
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="any"
                        className="h-10 border-slate-200/80 bg-white text-right tabular-nums sm:h-9"
                        onFocus={selectIfZero}
                        {...registerNumeric(`items.${index}.unitPrice`)}
                      />
                    </div>

                    <div className="col-span-3 text-right sm:order-4 sm:col-span-1">
                      <span className="mb-1 block text-[11px] font-medium text-slate-500 sm:hidden">
                        {dictionary.lineTotal}
                      </span>
                      <span className="inline-flex h-10 items-center justify-end text-xs font-semibold tabular-nums text-slate-900 sm:h-9 sm:text-sm">
                        {formatCurrency(lineTotal, currency, language)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="border-t border-slate-200/70 bg-slate-50/40 px-3 py-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="min-h-9 gap-1.5 px-2 text-xs font-medium hover:bg-slate-100"
              style={{ color: safeAccent }}
              onClick={() => append(createEmptyLineItem())}
            >
              <Plus className="size-3.5" />
              <span>{dictionary.addItem}</span>
            </Button>
          </div>
        </div>
      </section>

      <Separator className="bg-slate-200/80" />

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {dictionary.customerSectionTitle}
        </h3>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
          <div className="space-y-1">
            <Label
              htmlFor="customer-name"
              className="text-xs font-medium text-slate-600"
            >
              {dictionary.customerName}
            </Label>
            <Input
              id="customer-name"
              className="h-10"
              placeholder={dictionary.customerNamePlaceholder}
              {...form.register("customer.name")}
            />
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="customer-phone"
              className="text-xs font-medium text-slate-600"
            >
              {dictionary.customerPhone}
            </Label>
            <Input
              id="customer-phone"
              type="tel"
              inputMode="tel"
              className="h-10"
              placeholder={dictionary.customerPhonePlaceholder}
              {...form.register("customer.phone")}
            />
          </div>
        </div>

        {!isAddressExpanded ? (
          <div className="lg:hidden">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5 px-2.5 text-xs text-slate-600 hover:bg-slate-100"
              onClick={() => setShowAddress(true)}
            >
              <MapPin className="size-3.5" />
              <span>+ {dictionary.addAddress}</span>
            </Button>
          </div>
        ) : null}

        <div
          className={
            isAddressExpanded ? "space-y-1" : "hidden space-y-1 lg:block"
          }
        >
          <Label
            htmlFor="customer-address"
            className="text-xs font-medium text-slate-600"
          >
            {dictionary.customerAddress}
          </Label>
          <Textarea
            id="customer-address"
            rows={2}
            placeholder={dictionary.customerAddressPlaceholder}
            {...form.register("customer.address")}
          />
        </div>
      </section>

      <Separator className="bg-slate-200/80" />

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start lg:gap-6">
        <div className="lg:col-span-5">
          {!isNotesExpanded ? (
            <div className="lg:hidden">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 px-2.5 text-xs text-slate-600 hover:bg-slate-100"
                onClick={() => setShowNotes(true)}
              >
                <StickyNote className="size-3.5" />
                <span>+ {dictionary.addNote}</span>
              </Button>
            </div>
          ) : null}

          <div
            className={
              isNotesExpanded ? "space-y-1" : "hidden space-y-1 lg:block"
            }
          >
            <Label
              htmlFor="order-notes"
              className="text-xs font-medium text-slate-600"
            >
              {dictionary.notes}
            </Label>
            <Textarea
              id="order-notes"
              rows={4}
              placeholder={dictionary.notesPlaceholder}
              {...form.register("notes")}
            />
          </div>
        </div>

        <div className="space-y-2.5 rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 lg:col-span-7">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {dictionary.summarySectionTitle}
            </h3>
            {isPaidInFull ? (
              <Badge variant="secondary">{dictionary.paidInFull}</Badge>
            ) : null}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3 py-0.5">
              <span className="text-slate-600">{dictionary.subtotal}</span>
              <span className="font-medium tabular-nums text-slate-900">
                {formatCurrency(totals.subtotal, currency, language)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <Label
                htmlFor="order-discount"
                className="text-sm font-normal text-slate-600"
              >
                {dictionary.discount} (−)
              </Label>
              <Input
                id="order-discount"
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                className="h-10 w-32 bg-white text-right tabular-nums sm:h-9 sm:w-36"
                onFocus={selectIfZero}
                {...registerNumeric("discount")}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <Label
                htmlFor="order-delivery-fee"
                className="text-sm font-normal text-slate-600"
              >
                {dictionary.deliveryFee} (+)
              </Label>
              <Input
                id="order-delivery-fee"
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                className="h-10 w-32 bg-white text-right tabular-nums sm:h-9 sm:w-36"
                onFocus={selectIfZero}
                {...registerNumeric("deliveryFee")}
              />
            </div>

            <Separator className="my-1 bg-slate-200" />

            <div className="flex items-center justify-between gap-3 py-0.5 font-semibold text-slate-900">
              <span>{dictionary.grandTotal}</span>
              <span className="tabular-nums">
                {formatCurrency(totals.grandTotal, currency, language)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <Label
                htmlFor="order-deposit"
                className="text-sm font-normal text-slate-600"
              >
                {dictionary.deposit} (−)
              </Label>
              <Input
                id="order-deposit"
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                className="h-10 w-32 bg-white text-right tabular-nums sm:h-9 sm:w-36"
                onFocus={selectIfZero}
                {...registerNumeric("deposit")}
              />
            </div>

            <div
              className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-base font-semibold"
              style={{
                backgroundColor: `${safeAccent}14`,
                color: safeAccent,
              }}
            >
              <span>{dictionary.balanceDueCod}</span>
              <span className="tabular-nums">
                {formatCurrency(totals.balanceDue, currency, language)}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
