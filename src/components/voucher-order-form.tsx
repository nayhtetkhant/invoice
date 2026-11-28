"use client";

import * as React from "react";
import {
  type Control,
  Controller,
  type FieldPath,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import {
  Calendar,
  Check,
  CircleMinus,
  CirclePlus,
  Coins,
  CreditCard,
  Hash,
  MapPin,
  Minus,
  Plus,
  Receipt,
  ShoppingBag,
  Store,
  Trash2,
  User,
  Wallet,
  X,
} from "lucide-react";
import { ImageUploadField } from "@/components/image-upload-field";
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
import { Textarea } from "@/components/ui/textarea";
import type { Dictionary } from "@/lib/i18n";
import {
  sanitizeShopProfile,
  saveShopProfile,
} from "@/lib/shop-profile-storage";
import {
  calculateLineTotal,
  calculateVoucherTotals,
  createDefaultShopProfile,
  createEmptyLineItem,
  formatCurrency,
  getAccentTokens,
  sanitizeNumericText,
  sanitizeVoucherOrder,
} from "@/lib/voucher-calculations";
import {
  CURRENCIES,
  type Currency,
  type Language,
  type PaymentAccount,
  type ShopProfile,
  type VoucherOrder,
} from "@/types/voucher";

const CURRENCY_LABELS: Record<Currency, string> = {
  MMK: "MMK (Ks / ကျပ်)",
  THB: "THB (฿)",
  USD: "USD ($)",
};

const PAPER_INPUT_CLASS =
  "border-stone-200/80 bg-[#FAFBFD] transition-colors hover:border-stone-300 focus-visible:border-stone-400 focus-visible:bg-white";

function parseNonNegativeInput(value: unknown): number {
  if (value === "" || value === null || value === undefined) {
    return 0;
  }
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

interface NumericTextInputProps {
  control: Control<VoucherOrder>;
  name: FieldPath<VoucherOrder>;
  id: string;
  placeholder?: string;
  className?: string;
  emptyWhenZero?: boolean;
}

function NumericTextInput({
  control,
  name,
  id,
  placeholder = "0",
  className,
  emptyWhenZero = true,
}: NumericTextInputProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [draft, setDraft] = React.useState("");

  function formatValue(val: unknown): string {
    const num = parseNonNegativeInput(val);
    if (num === 0 && emptyWhenZero) {
      return "";
    }
    return String(num);
  }

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Input
          id={id}
          name={field.name}
          ref={field.ref}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder={placeholder}
          className={className}
          value={isFocused ? draft : formatValue(field.value)}
          onFocus={(event) => {
            const formatted = formatValue(field.value);
            setIsFocused(true);
            setDraft(formatted);
            if (formatted === "0") {
              event.currentTarget.select();
            }
          }}
          onChange={(event) => {
            const sanitized = sanitizeNumericText(event.target.value);
            setDraft(sanitized);
            field.onChange(parseNonNegativeInput(sanitized));
          }}
          onBlur={() => {
            setIsFocused(false);
            field.onBlur();
          }}
        />
      )}
    />
  );
}

interface AdjustmentFieldRowProps {
  control: Control<VoucherOrder>;
  name: "discount" | "deliveryFee" | "deposit";
  id: string;
  label: string;
  addLabel: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onOpen: () => void;
  onClear: () => void;
}

/** Stacked full-width adjustment input with label above and right-edge cancel button. */
function AdjustmentFieldRow({
  control,
  name,
  id,
  label,
  addLabel,
  icon,
  isOpen,
  onOpen,
  onClear,
}: AdjustmentFieldRowProps) {
  if (!isOpen) {
    return (
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-9 w-full justify-start gap-1.5 border-stone-300/90 bg-white px-2.5 text-xs font-medium text-stone-600 hover:bg-stone-100"
          onClick={onOpen}
        >
          <Plus className="size-3.5" />
          <span>{addLabel}</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600"
      >
        {icon}
        <span>{label}</span>
      </Label>
      <div className="relative w-full">
        <NumericTextInput
          control={control}
          name={name}
          id={id}
          placeholder="0"
          className="h-10 w-full border-stone-200 bg-white pr-8 text-left tabular-nums sm:h-9"
        />
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          aria-label={label}
          title={label}
          className="absolute -top-2 -right-2 z-10 size-6 rounded-full border-rose-200 bg-white text-rose-600 shadow-sm transition-all duration-150 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 active:not-aria-[haspopup]:translate-y-0 active:scale-95"
          onClick={onClear}
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

interface VoucherOrderFormProps {
  dictionary: Dictionary;
  language: Language;
  accentColor: string;
  order: VoucherOrder;
  shopProfile?: ShopProfile;
  paymentAccounts?: PaymentAccount[];
  onOrderChange: (order: VoucherOrder) => void;
  onProfileChange?: (profile: ShopProfile) => void;
  onOpenShopSettings?: () => void;
  onOpenPaymentSettings?: () => void;
}

export function VoucherOrderForm({
  dictionary,
  language,
  accentColor,
  order,
  shopProfile,
  paymentAccounts,
  onOrderChange,
  onProfileChange,
  onOpenShopSettings,
  onOpenPaymentSettings,
}: VoucherOrderFormProps) {
  const resolvedProfile = shopProfile ?? createDefaultShopProfile();
  const resolvedPaymentAccounts =
    paymentAccounts ?? resolvedProfile.paymentAccounts;

  const [hasShopSavedNotice, setHasShopSavedNotice] = React.useState(false);
  const [showAddress, setShowAddress] = React.useState(
    () => order.customer.address.trim().length > 0,
  );
  const [showDiscount, setShowDiscount] = React.useState(
    () => order.discount > 0,
  );
  const [showDelivery, setShowDelivery] = React.useState(
    () => order.deliveryFee > 0,
  );
  const [showDeposit, setShowDeposit] = React.useState(
    () => order.deposit > 0,
  );

  const lastOrderJsonRef = React.useRef(
    JSON.stringify(sanitizeVoucherOrder(order)),
  );

  const form = useForm<VoucherOrder>({
    defaultValues: order,
  });

  // Sync external order updates (e.g. sidebar currency change or New Voucher reset).
  React.useEffect(() => {
    const sanitized = sanitizeVoucherOrder(order);
    const serialized = JSON.stringify(sanitized);
    if (serialized !== lastOrderJsonRef.current) {
      lastOrderJsonRef.current = serialized;
      form.reset(sanitized);
      setShowAddress(sanitized.customer.address.trim().length > 0);
      setShowDiscount(sanitized.discount > 0);
      setShowDelivery(sanitized.deliveryFee > 0);
      setShowDeposit(sanitized.deposit > 0);
    }
  }, [form, order]);

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
  const watchedSelectedPaymentIds = useWatch({
    control: form.control,
    name: "selectedPaymentAccountIds",
  });

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

  function updateShopField(patch: Partial<ShopProfile>) {
    if (!onProfileChange) {
      return;
    }
    const nextProfile = sanitizeShopProfile({
      ...resolvedProfile,
      ...patch,
    });
    const saved = saveShopProfile(nextProfile);
    setHasShopSavedNotice(saved);
    onProfileChange(nextProfile);
  }

  function handleStepQuantity(index: number, delta: number) {
    const currentQty = parseNonNegativeInput(watchedItems?.[index]?.quantity);
    const nextQty = Math.max(0, Math.round((currentQty + delta) * 100) / 100);
    form.setValue(`items.${index}.quantity`, nextQty, {
      shouldDirty: true,
      shouldTouch: true,
    });
  }

  function handleTogglePaymentAccount(accountId: string) {
    const allIds = resolvedPaymentAccounts.map((account) => account.id);
    const currentSelected =
      watchedSelectedPaymentIds === undefined
        ? allIds
        : watchedSelectedPaymentIds.filter((id) => allIds.includes(id));

    const nextSelected = currentSelected.includes(accountId)
      ? currentSelected.filter((id) => id !== accountId)
      : [...currentSelected, accountId];

    form.setValue("selectedPaymentAccountIds", nextSelected, {
      shouldDirty: true,
      shouldTouch: true,
    });
  }

  const accentTokens = getAccentTokens(accentColor);
  const currency: Currency =
    watchedCurrency === "THB" || watchedCurrency === "USD"
      ? watchedCurrency
      : "MMK";

  const isAddressExpanded =
    showAddress || (watchedAddress?.trim().length ?? 0) > 0;
  const isDiscountOpen =
    showDiscount || parseNonNegativeInput(watchedDiscount) > 0;
  const isDeliveryOpen =
    showDelivery || parseNonNegativeInput(watchedDeliveryFee) > 0;
  const isDepositOpen =
    showDeposit || parseNonNegativeInput(watchedDeposit) > 0;

  const totals = calculateVoucherTotals({
    items: watchedItems ?? [],
    discount: watchedDiscount ?? 0,
    deliveryFee: watchedDeliveryFee ?? 0,
    deposit: watchedDeposit ?? 0,
  });

  const isPaidInFull = totals.grandTotal > 0 && totals.balanceDue === 0;
  const sectionLabelClass =
    language === "en"
      ? "text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500"
      : "text-xs font-semibold leading-relaxed text-stone-600";

  function handleTogglePaidInFull() {
    if (totals.grandTotal <= 0) {
      return;
    }
    const nextDeposit = isPaidInFull ? 0 : totals.grandTotal;
    setShowDeposit(nextDeposit > 0);
    form.setValue("deposit", nextDeposit, {
      shouldDirty: true,
      shouldTouch: true,
    });
  }

  return (
    <div
      data-paper-editor="true"
      className="mx-auto w-full rounded-sm border border-stone-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_12px_32px_-12px_rgba(0,0,0,0.1)] sm:p-7 lg:p-8"
    >
      <div className="space-y-6">
        {/* Top Paper Header: Logo (left) + Heading, Voucher #, Date (right) */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="w-44 max-w-full">
            <ImageUploadField
              id="paper-logo-upload"
              label={dictionary.shopLogo}
              uploadLabel={dictionary.uploadLogo}
              removeLabel={dictionary.removeLogo}
              value={resolvedProfile.logoDataUrl}
              preset="logo"
              dictionary={dictionary}
              hideLabel
              onChange={(dataUrl) => updateShopField({ logoDataUrl: dataUrl })}
            />
          </div>

          <div className="flex flex-col gap-2.5 sm:items-end">
            <h2
              className={
                language === "en"
                  ? "text-2xl font-light tracking-wider text-stone-900 uppercase sm:text-3xl"
                  : "text-xl font-bold leading-snug text-stone-900 sm:text-2xl"
              }
            >
              {dictionary.voucherHeading}
            </h2>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:flex md:flex-col md:items-end">
              <div className="flex min-w-0 items-center">
                <Label htmlFor="voucher-number" className="sr-only">
                  {dictionary.voucherNumber}
                </Label>
                <span
                  aria-hidden="true"
                  className="inline-flex h-9 items-center rounded-l-md border border-r-0 border-stone-200 bg-[#F8F9FA] px-2.5 text-stone-500"
                >
                  <Hash className="size-3.5" />
                </span>
                <Input
                  id="voucher-number"
                  className="h-9 w-full rounded-l-none border-stone-200 bg-white text-right font-mono tabular-nums md:w-44"
                  placeholder={dictionary.voucherNumberPlaceholder}
                  {...form.register("voucherNumber")}
                />
              </div>

              <div className="flex items-center">
                <Label htmlFor="voucher-date" className="sr-only">
                  {dictionary.voucherDate}
                </Label>
                <span
                  aria-hidden="true"
                  className="inline-flex h-9 items-center rounded-l-md border border-r-0 border-stone-200 bg-[#F8F9FA] px-2.5 text-stone-500"
                >
                  <Calendar className="size-3.5" />
                </span>
                <Input
                  id="voucher-date"
                  type="date"
                  className="h-9 w-full rounded-l-none border-stone-200 bg-white tabular-nums md:w-44"
                  {...form.register("date")}
                />
              </div>
            </div>

            {/* Mobile-only compact Currency selector (desktop uses right sidebar rail) */}
            <div className="flex items-center gap-2 lg:hidden">
              <Label
                htmlFor="order-currency"
                className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-stone-600"
              >
                <Coins className="size-3.5 text-stone-500" />
                <span>{dictionary.currency}</span>
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
                      className="h-9 flex-1 border-stone-200 bg-white data-[size=default]:h-9"
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
          </div>
        </div>

        {/* Side-by-Side From (Shop) & Bill To (Customer) */}
        <div className="grid grid-cols-1 gap-4 border-t border-stone-200/80 pt-5 md:grid-cols-2 md:gap-x-6 md:gap-y-4">
          {/* From: Shop Details */}
          <section className="space-y-2">
            <div className="flex min-h-7 flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3
                  className={`inline-flex items-center gap-1.5 ${sectionLabelClass}`}
                >
                  <Store className="size-3.5 text-stone-500" />
                  <span>{dictionary.fromLabel}</span>
                </h3>
                {hasShopSavedNotice ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                    <Check className="size-3" />
                    <span>{dictionary.shopProfileSavedNotice}</span>
                  </span>
                ) : null}
              </div>

              {onOpenPaymentSettings || onOpenShopSettings ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onOpenPaymentSettings ?? onOpenShopSettings}
                  className="hidden h-7 gap-1 px-2 text-[11px] font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900 md:inline-flex lg:hidden"
                >
                  <CreditCard className="size-3" />
                  <span>{dictionary.managePaymentAccounts}</span>
                </Button>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <Label htmlFor="paper-shop-name" className="sr-only">
                    {dictionary.shopName}
                  </Label>
                  <Input
                    id="paper-shop-name"
                    value={resolvedProfile.shopName}
                    onChange={(event) =>
                      updateShopField({ shopName: event.target.value })
                    }
                    className={`h-10 font-medium sm:h-9 ${PAPER_INPUT_CLASS}`}
                    placeholder={dictionary.shopNamePlaceholder}
                  />
                </div>
                <div>
                  <Label htmlFor="paper-shop-phones" className="sr-only">
                    {dictionary.shopPhones}
                  </Label>
                  <Input
                    id="paper-shop-phones"
                    type="tel"
                    inputMode="tel"
                    value={resolvedProfile.phones}
                    onChange={(event) =>
                      updateShopField({ phones: event.target.value })
                    }
                    className={`h-10 sm:h-9 ${PAPER_INPUT_CLASS}`}
                    placeholder={dictionary.shopPhonesPlaceholder}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="paper-shop-address" className="sr-only">
                  {dictionary.shopAddressOrSocial}
                </Label>
                <Input
                  id="paper-shop-address"
                  value={resolvedProfile.addressOrSocial}
                  onChange={(event) =>
                    updateShopField({ addressOrSocial: event.target.value })
                  }
                  className={`h-10 text-sm sm:h-9 ${PAPER_INPUT_CLASS}`}
                  placeholder={dictionary.shopAddressOrSocialPlaceholder}
                />
              </div>
            </div>
          </section>

          {/* Bill To: Customer Details */}
          <section className="space-y-2">
            <div className="flex min-h-7 items-center">
              <h3
                className={`inline-flex items-center gap-1.5 ${sectionLabelClass}`}
              >
                <User className="size-3.5 text-stone-500" />
                <span>{dictionary.billToLabel}</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="min-w-0">
                <Label htmlFor="customer-name" className="sr-only">
                  {dictionary.customerName}
                </Label>
                <Input
                  id="customer-name"
                  className={`h-10 sm:h-9 ${PAPER_INPUT_CLASS}`}
                  placeholder={dictionary.customerNamePlaceholder}
                  {...form.register("customer.name")}
                />
              </div>

              <div>
                <Label htmlFor="customer-phone" className="sr-only">
                  {dictionary.customerPhone}
                </Label>
                <Input
                  id="customer-phone"
                  type="tel"
                  inputMode="tel"
                  className={`h-10 sm:h-9 ${PAPER_INPUT_CLASS}`}
                  placeholder={dictionary.customerPhonePlaceholder}
                  {...form.register("customer.phone")}
                />
              </div>
            </div>
          </section>

          <div className="w-full md:col-span-2">
            {!isAddressExpanded ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex min-h-9 w-full justify-center gap-1.5 border-teal-300 bg-teal-50 px-3 text-xs font-medium text-teal-900 shadow-2xs transition-all duration-150 hover:border-teal-400 hover:bg-teal-100/80 active:scale-[0.99]"
                onClick={() => setShowAddress(true)}
              >
                <MapPin className="size-3.5 text-teal-600" />
                <span>{dictionary.addAddress}</span>
              </Button>
            ) : (
              <div>
                <Label htmlFor="customer-address" className="sr-only">
                  {dictionary.customerAddress}
                </Label>
                <Textarea
                  id="customer-address"
                  rows={2}
                  className={`w-full ${PAPER_INPUT_CLASS}`}
                  placeholder={dictionary.customerAddressPlaceholder}
                  {...form.register("customer.address")}
                />
              </div>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <section className="space-y-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <h3
              className={`inline-flex items-center gap-1.5 ${sectionLabelClass}`}
            >
              <ShoppingBag className="size-3.5 text-stone-500" />
              <span>{dictionary.itemsSectionTitle}</span>
            </h3>
            <span className="text-xs font-medium tabular-nums text-stone-500">
              {fields.length}
            </span>
          </div>

          <div
            data-line-items-table="true"
            className="overflow-hidden rounded-md border border-stone-200 bg-white"
          >
            <div
              className={`hidden px-3 py-2.5 md:grid md:grid-cols-[minmax(0,1fr)_76px_112px_minmax(92px,auto)_36px] md:items-center md:gap-2.5 ${
                language === "en"
                  ? "text-[11px] font-semibold uppercase tracking-wider"
                  : "text-xs font-semibold leading-relaxed"
              }`}
              style={{
                backgroundColor: accentTokens.base,
                color: accentTokens.onAccent,
              }}
            >
              <span>{dictionary.itemName}</span>
              <span className="text-right">{dictionary.quantity}</span>
              <span className="text-right">{dictionary.unitPrice}</span>
              <span className="text-right">{dictionary.lineTotal}</span>
              <span className="sr-only">{dictionary.removeItem}</span>
            </div>

            {fields.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-stone-500">
                {dictionary.noItemsPlaceholder}
              </div>
            ) : (
              <div className="divide-y divide-stone-200/75">
                {fields.map((field, index) => {
                  const currentItem = watchedItems?.[index];
                  const lineTotal = calculateLineTotal({
                    quantity: currentItem?.quantity ?? 0,
                    unitPrice: currentItem?.unitPrice ?? 0,
                  });

                  return (
                    <div
                      key={field.fieldKey}
                      className="flex flex-col gap-2.5 px-3 py-3 md:grid md:grid-cols-[minmax(0,1fr)_76px_112px_minmax(92px,auto)_36px] md:items-center md:gap-2.5 md:py-2"
                    >
                      <div className="flex items-center gap-2 md:contents">
                        <div className="min-w-0 flex-1 md:order-1">
                          <Label
                            htmlFor={`item-name-${index}`}
                            className="sr-only"
                          >
                            {dictionary.itemName} #{index + 1}
                          </Label>
                          <Input
                            id={`item-name-${index}`}
                            className={`h-10 md:h-9 ${PAPER_INPUT_CLASS}`}
                            placeholder={dictionary.itemNamePlaceholder}
                            {...form.register(`items.${index}.name`)}
                          />
                        </div>

                        <div className="flex shrink-0 justify-end md:order-5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`${dictionary.removeItem} #${index + 1}`}
                            className="size-9 text-stone-500 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-end justify-between gap-2.5 md:contents">
                        <div className="w-[128px] shrink-0 md:order-2 md:w-auto">
                          <Label
                            htmlFor={`item-qty-${index}`}
                            className="mb-1 block text-[11px] font-medium text-stone-500 md:sr-only"
                          >
                            {dictionary.quantity}
                          </Label>
                          <div className="flex items-center overflow-hidden rounded-lg border border-stone-200 bg-white md:border-0">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`${dictionary.decreaseQty} #${index + 1}`}
                              className="h-10 w-10 shrink-0 rounded-none border-r border-stone-200/80 text-stone-600 hover:bg-stone-100 md:hidden"
                              onClick={() => handleStepQuantity(index, -1)}
                            >
                              <Minus className="size-3.5" />
                            </Button>
                            <NumericTextInput
                              control={form.control}
                              name={`items.${index}.quantity`}
                              id={`item-qty-${index}`}
                              placeholder="1"
                              emptyWhenZero={false}
                              className="h-10 min-w-0 rounded-none border-0 bg-white px-1 text-center tabular-nums focus-visible:ring-0 md:h-9 md:rounded-md md:border md:border-stone-200/80 md:bg-[#FAFBFD] md:px-2.5 md:text-right md:focus-visible:bg-white md:focus-visible:ring-3"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`${dictionary.increaseQty} #${index + 1}`}
                              className="h-10 w-10 shrink-0 rounded-none border-l border-stone-200/80 text-stone-600 hover:bg-stone-100 md:hidden"
                              onClick={() => handleStepQuantity(index, 1)}
                            >
                              <Plus className="size-3.5" />
                            </Button>
                          </div>
                        </div>

                        <div className="min-w-[120px] flex-1 md:order-3 md:min-w-0">
                          <Label
                            htmlFor={`item-price-${index}`}
                            className="mb-1 block text-[11px] font-medium text-stone-500 md:sr-only"
                          >
                            {dictionary.unitPrice}
                          </Label>
                          <NumericTextInput
                            control={form.control}
                            name={`items.${index}.unitPrice`}
                            id={`item-price-${index}`}
                            placeholder="0"
                            className={`h-10 text-right tabular-nums md:h-9 ${PAPER_INPUT_CLASS}`}
                          />
                        </div>

                        <div className="flex w-full items-center justify-between border-t border-stone-100 pt-2 text-right sm:block sm:w-auto sm:shrink-0 sm:border-t-0 sm:pt-0 md:order-4">
                          <span className="text-[11px] font-medium text-stone-500 sm:mb-1 sm:block md:hidden">
                            {dictionary.lineTotal}
                          </span>
                          <span className="inline-flex items-center justify-end text-xs font-semibold tabular-nums text-stone-900 sm:h-10 md:h-9 md:text-sm">
                            {formatCurrency(lineTotal, currency, language)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-9 gap-1.5 border-[#009E74]/50 bg-white px-3 text-xs font-semibold text-[#007B5A] hover:border-[#009E74] hover:bg-[#009E74]/5 hover:text-[#00664B]"
              onClick={() => append(createEmptyLineItem())}
            >
              <Plus className="size-3.5" />
              <span>{dictionary.addItem}</span>
            </Button>
          </div>
        </section>

        {/* Bottom Vertical Stack: Totals Ledger, then Order Notes, then Payment Accounts */}
        <div className="space-y-5 border-t border-stone-200/80 pt-5">
          <section className="space-y-3 rounded-md border border-stone-200/90 bg-[#F9FAFB] p-3.5 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3
                className={`inline-flex items-center gap-1.5 ${sectionLabelClass}`}
              >
                <Receipt className="size-3.5 text-stone-500" />
                <span>{dictionary.summarySectionTitle}</span>
              </h3>

              {totals.grandTotal > 0 ? (
                <Button
                  type="button"
                  variant={isPaidInFull ? "default" : "outline"}
                  size="sm"
                  aria-pressed={isPaidInFull}
                  onClick={handleTogglePaidInFull}
                  className="min-h-8 gap-1.5 px-2.5 text-xs font-medium"
                  style={
                    isPaidInFull
                      ? {
                          backgroundColor: accentTokens.base,
                          color: accentTokens.onAccent,
                        }
                      : undefined
                  }
                >
                  <Check className="size-3.5" />
                  <span>{dictionary.markPaidInFull}</span>
                </Button>
              ) : null}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3 py-0.5">
                <span className="min-w-0 text-stone-600">
                  {dictionary.subtotal}
                </span>
                <span className="shrink-0 font-medium tabular-nums text-stone-900">
                  {formatCurrency(totals.subtotal, currency, language)}
                </span>
              </div>

              <AdjustmentFieldRow
                control={form.control}
                name="discount"
                id="order-discount"
                label={dictionary.discount}
                addLabel={dictionary.addDiscount}
                icon={
                  <CircleMinus className="size-3.5 shrink-0 text-rose-600/80" />
                }
                isOpen={isDiscountOpen}
                onOpen={() => setShowDiscount(true)}
                onClear={() => {
                  form.setValue("discount", 0, { shouldDirty: true });
                  setShowDiscount(false);
                }}
              />

              <AdjustmentFieldRow
                control={form.control}
                name="deliveryFee"
                id="order-delivery-fee"
                label={dictionary.deliveryFee}
                addLabel={dictionary.addDeliveryFee}
                icon={<CirclePlus className="size-3.5 shrink-0 text-stone-500" />}
                isOpen={isDeliveryOpen}
                onOpen={() => setShowDelivery(true)}
                onClear={() => {
                  form.setValue("deliveryFee", 0, { shouldDirty: true });
                  setShowDelivery(false);
                }}
              />

              <div className="flex items-center justify-between gap-3 border-t border-stone-200/90 pt-2.5 font-semibold text-stone-900">
                <span className="min-w-0">{dictionary.grandTotal}</span>
                <span className="shrink-0 tabular-nums">
                  {formatCurrency(totals.grandTotal, currency, language)}
                </span>
              </div>

              <AdjustmentFieldRow
                control={form.control}
                name="deposit"
                id="order-deposit"
                label={dictionary.deposit}
                addLabel={dictionary.addDeposit}
                icon={<CircleMinus className="size-3.5 shrink-0 text-stone-500" />}
                isOpen={isDepositOpen}
                onOpen={() => setShowDeposit(true)}
                onClear={() => {
                  form.setValue("deposit", 0, { shouldDirty: true });
                  setShowDeposit(false);
                }}
              />

              <div
                className="flex flex-wrap items-center justify-between gap-2 rounded-md px-3 py-2.5 text-base font-semibold"
                style={{
                  backgroundColor: accentTokens.tint,
                  color: accentTokens.ink,
                }}
              >
                <span className="min-w-0">{dictionary.balanceDueCod}</span>
                <span className="shrink-0 tabular-nums">
                  {formatCurrency(totals.balanceDue, currency, language)}
                </span>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <Label
              htmlFor="order-notes"
              className="text-xs font-medium text-stone-600"
            >
              {dictionary.notes}
            </Label>
            <Textarea
              id="order-notes"
              rows={3}
              className={PAPER_INPUT_CLASS}
              placeholder={dictionary.notesPlaceholder}
              {...form.register("notes")}
            />
          </section>

          {resolvedPaymentAccounts.length > 0 || onOpenPaymentSettings ? (
            <section className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3
                  className={`inline-flex items-center gap-1.5 ${sectionLabelClass}`}
                >
                  <Wallet className="size-3.5 text-stone-500" />
                  <span>{dictionary.paymentMethodsLabel}</span>
                </h3>
                {onOpenPaymentSettings ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onOpenPaymentSettings}
                    className="h-8 gap-1.5 border-emerald-200 bg-emerald-50/60 px-2.5 text-xs font-medium text-emerald-950 hover:border-emerald-300 hover:bg-emerald-50 lg:hidden"
                  >
                    <CreditCard className="size-3.5 text-emerald-600" />
                    <span>{dictionary.managePaymentAccounts}</span>
                  </Button>
                ) : null}
              </div>

              {resolvedPaymentAccounts.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {resolvedPaymentAccounts.map((account) => {
                    const isSelected =
                      watchedSelectedPaymentIds === undefined
                        ? true
                        : watchedSelectedPaymentIds.includes(account.id);
                    const label =
                      account.label.trim() ||
                      account.accountNumber.trim() ||
                      dictionary.paymentLabel;
                    return (
                      <Button
                        key={account.id}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        aria-pressed={isSelected}
                        onClick={() => handleTogglePaymentAccount(account.id)}
                        className="min-h-9 gap-1.5 px-3 text-xs leading-relaxed font-medium"
                        style={
                          isSelected
                            ? {
                                backgroundColor: accentTokens.base,
                                color: accentTokens.onAccent,
                              }
                            : undefined
                        }
                      >
                        {isSelected ? <Check className="size-3.5" /> : null}
                        <span>{label}</span>
                      </Button>
                    );
                  })}
                </div>
              ) : null}
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
