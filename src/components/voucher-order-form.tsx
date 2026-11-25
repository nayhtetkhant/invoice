"use client";

import * as React from "react";
import {
  Controller,
  type FieldPath,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { Plus, ReceiptText, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  function handleClearVoucher() {
    const fresh = createDefaultVoucherOrder();
    lastOrderJsonRef.current = JSON.stringify(fresh);
    form.reset(fresh);
    onOrderChange(fresh);
  }

  const currency: Currency =
    watchedCurrency === "THB" || watchedCurrency === "USD"
      ? watchedCurrency
      : "MMK";

  const totals = calculateVoucherTotals({
    items: watchedItems ?? [],
    discount: watchedDiscount ?? 0,
    deliveryFee: watchedDeliveryFee ?? 0,
    deposit: watchedDeposit ?? 0,
  });

  const isPaidInFull = totals.grandTotal > 0 && totals.balanceDue === 0;

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ReceiptText
              className="size-4 shrink-0"
              style={{ color: accentColor }}
            />
            <CardTitle>{dictionary.voucherOrderTitle}</CardTitle>
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="min-h-10 shrink-0 px-3"
            onClick={handleClearVoucher}
          >
            <RotateCcw />
            <span>{dictionary.newClearVoucher}</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="voucher-number">{dictionary.voucherNumber}</Label>
            <Input
              id="voucher-number"
              className="h-10"
              placeholder={dictionary.voucherNumberPlaceholder}
              {...form.register("voucherNumber")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="voucher-date">{dictionary.voucherDate}</Label>
            <Input
              id="voucher-date"
              type="date"
              className="h-10"
              {...form.register("date")}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="text-sm font-medium">
            {dictionary.customerSectionTitle}
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customer-name">{dictionary.customerName}</Label>
              <Input
                id="customer-name"
                className="h-10"
                placeholder={dictionary.customerNamePlaceholder}
                {...form.register("customer.name")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-phone">{dictionary.customerPhone}</Label>
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

          <div className="space-y-2">
            <Label htmlFor="customer-address">
              {dictionary.customerAddress}
            </Label>
            <Textarea
              id="customer-address"
              rows={2}
              placeholder={dictionary.customerAddressPlaceholder}
              {...form.register("customer.address")}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">
                {dictionary.itemsSectionTitle}
              </h3>
              <Badge variant="secondary">{fields.length}</Badge>
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="min-h-10 px-3"
              onClick={() => append(createEmptyLineItem())}
            >
              <Plus />
              <span>{dictionary.addItem}</span>
            </Button>
          </div>

          {fields.length === 0 ? (
            <div className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
              {dictionary.noItemsPlaceholder}
            </div>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => {
                const currentItem = watchedItems?.[index];
                const lineTotal = calculateLineTotal({
                  quantity: currentItem?.quantity ?? 0,
                  unitPrice: currentItem?.unitPrice ?? 0,
                });

                return (
                  <div
                    key={field.fieldKey}
                    className="space-y-3 rounded-xl border bg-muted/30 p-3.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="min-h-10 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => remove(index)}
                      >
                        <Trash2 />
                        <span>{dictionary.removeItem}</span>
                      </Button>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor={`item-name-${index}`}>
                        {dictionary.itemName}
                      </Label>
                      <Input
                        id={`item-name-${index}`}
                        className="h-10 bg-background"
                        placeholder={dictionary.itemNamePlaceholder}
                        {...form.register(`items.${index}.name`)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <div className="space-y-1.5">
                        <Label htmlFor={`item-qty-${index}`}>
                          {dictionary.quantity}
                        </Label>
                        <Input
                          id={`item-qty-${index}`}
                          type="number"
                          inputMode="numeric"
                          min={0}
                          step="any"
                          className="h-10 bg-background"
                          onFocus={selectIfZero}
                          {...registerNumeric(`items.${index}.quantity`)}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor={`item-price-${index}`}>
                          {dictionary.unitPrice}
                        </Label>
                        <Input
                          id={`item-price-${index}`}
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step="any"
                          className="h-10 bg-background"
                          onFocus={selectIfZero}
                          {...registerNumeric(`items.${index}.unitPrice`)}
                        />
                      </div>

                      <div className="col-span-2 space-y-1.5 sm:col-span-1">
                        <Label>{dictionary.lineTotal}</Label>
                        <div className="flex h-10 items-center justify-between rounded-lg border bg-background px-3 text-sm font-medium tabular-nums sm:justify-end">
                          <span className="text-xs text-muted-foreground sm:hidden">
                            {dictionary.lineTotal}
                          </span>
                          <span>
                            {formatCurrency(lineTotal, currency, language)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="text-sm font-medium">
            {dictionary.adjustmentsSectionTitle}
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="order-currency">{dictionary.currency}</Label>
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

            <div className="space-y-2">
              <Label htmlFor="order-discount">{dictionary.discount}</Label>
              <Input
                id="order-discount"
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                className="h-10"
                onFocus={selectIfZero}
                {...registerNumeric("discount")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order-delivery-fee">
                {dictionary.deliveryFee}
              </Label>
              <Input
                id="order-delivery-fee"
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                className="h-10"
                onFocus={selectIfZero}
                {...registerNumeric("deliveryFee")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order-deposit">{dictionary.deposit}</Label>
              <Input
                id="order-deposit"
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                className="h-10"
                onFocus={selectIfZero}
                {...registerNumeric("deposit")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order-notes">{dictionary.notes}</Label>
            <Textarea
              id="order-notes"
              rows={2}
              placeholder={dictionary.notesPlaceholder}
              {...form.register("notes")}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-2.5 rounded-xl border bg-muted/40 p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">
              {dictionary.summarySectionTitle}
            </h3>
            {isPaidInFull ? (
              <Badge variant="secondary">{dictionary.paidInFull}</Badge>
            ) : null}
          </div>

          <div className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">
                {dictionary.subtotal}
              </span>
              <span className="font-medium tabular-nums">
                {formatCurrency(totals.subtotal, currency, language)}
              </span>
            </div>

            {totals.discount > 0 ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">
                  {dictionary.discount}
                </span>
                <span className="tabular-nums text-destructive">
                  -{formatCurrency(totals.discount, currency, language)}
                </span>
              </div>
            ) : null}

            {totals.deliveryFee > 0 ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">
                  {dictionary.deliveryFee}
                </span>
                <span className="tabular-nums">
                  +{formatCurrency(totals.deliveryFee, currency, language)}
                </span>
              </div>
            ) : null}

            <Separator className="my-1" />

            <div className="flex items-center justify-between gap-3 font-semibold">
              <span>{dictionary.grandTotal}</span>
              <span className="tabular-nums">
                {formatCurrency(totals.grandTotal, currency, language)}
              </span>
            </div>

            {totals.deposit > 0 ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">
                  {dictionary.deposit}
                </span>
                <span className="tabular-nums">
                  -{formatCurrency(totals.deposit, currency, language)}
                </span>
              </div>
            ) : null}

            <div
              className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-base font-semibold"
              style={{
                backgroundColor: `${accentColor}14`,
                color: accentColor,
              }}
            >
              <span>{dictionary.balanceDueCod}</span>
              <span className="tabular-nums">
                {formatCurrency(totals.balanceDue, currency, language)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
