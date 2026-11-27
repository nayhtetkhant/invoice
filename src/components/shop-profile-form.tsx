"use client";

import * as React from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import {
  Check,
  CreditCard,
  Palette,
  PencilLine,
  Plus,
  RotateCcw,
  Store,
  Trash2,
  X,
} from "lucide-react";
import { ImageUploadField } from "@/components/image-upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { Dictionary } from "@/lib/i18n";
import {
  resetShopProfile,
  sanitizeShopProfile,
  saveShopProfile,
} from "@/lib/shop-profile-storage";
import {
  createEmptyPaymentAccount,
  getAccentTokens,
} from "@/lib/voucher-calculations";
import {
  ACCENT_COLOR_PRESETS,
  type ShopProfile,
} from "@/types/voucher";

export type ShopProfileSection = "full" | "payment";

interface ShopProfileFormProps {
  dictionary: Dictionary;
  profile: ShopProfile;
  isHydrated: boolean;
  defaultOpen?: boolean;
  open?: boolean;
  hideTrigger?: boolean;
  section?: ShopProfileSection;
  onOpenChange?: (open: boolean) => void;
  onProfileChange: (profile: ShopProfile) => void;
}

function getShopInitial(shopName: string): string {
  const trimmed = shopName.trim();
  if (!trimmed) {
    return "S";
  }
  return (Array.from(trimmed)[0] ?? "S").toUpperCase();
}

export function ShopProfileForm({
  dictionary,
  profile,
  isHydrated,
  defaultOpen = false,
  open: controlledOpen,
  hideTrigger = false,
  section = "full",
  onOpenChange,
  onProfileChange,
}: ShopProfileFormProps) {
  const isPaymentOnly = section === "payment";
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const [isConfirmingReset, setIsConfirmingReset] = React.useState(false);
  const [hasSavedNotice, setHasSavedNotice] = React.useState(false);
  const isOpen = controlledOpen ?? uncontrolledOpen;
  const setIsOpen = onOpenChange ?? setUncontrolledOpen;

  const lastSavedJsonRef = React.useRef(
    JSON.stringify(sanitizeShopProfile(profile)),
  );

  const form = useForm<ShopProfile>({
    defaultValues: profile,
  });

  React.useEffect(() => {
    const sanitized = sanitizeShopProfile(profile);
    const serialized = JSON.stringify(sanitized);
    if (serialized !== lastSavedJsonRef.current) {
      lastSavedJsonRef.current = serialized;
      form.reset(sanitized);
    }
  }, [form, profile]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "paymentAccounts",
    keyName: "fieldKey",
  });

  const logoDataUrl = useWatch({
    control: form.control,
    name: "logoDataUrl",
  });
  const accentColor = useWatch({
    control: form.control,
    name: "accentColor",
  });
  const paymentAccounts = useWatch({
    control: form.control,
    name: "paymentAccounts",
  });
  const shopName = useWatch({
    control: form.control,
    name: "shopName",
  });
  const phones = useWatch({
    control: form.control,
    name: "phones",
  });

  // Auto-save form edits to localStorage once client hydration has completed.
  React.useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const unsubscribe = form.subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        const sanitized = sanitizeShopProfile(values);
        const serialized = JSON.stringify(sanitized);
        if (serialized === lastSavedJsonRef.current) {
          return;
        }

        lastSavedJsonRef.current = serialized;
        const saved = saveShopProfile(sanitized);
        setHasSavedNotice(saved);
        onProfileChange(sanitized);
      },
    });

    return unsubscribe;
  }, [form, isHydrated, onProfileChange]);

  function handleConfirmReset() {
    const fresh = resetShopProfile();
    lastSavedJsonRef.current = JSON.stringify(fresh);
    form.reset(fresh);
    setHasSavedNotice(false);
    setIsConfirmingReset(false);
    onProfileChange(fresh);
  }

  const accentTokens = getAccentTokens(accentColor);
  const trimmedShopName = shopName?.trim() ?? "";
  const trimmedPhones = phones?.trim() ?? "";
  const paymentCount = paymentAccounts?.length ?? 0;
  const isUnconfigured = trimmedShopName.length === 0 && paymentCount === 0;
  const isCustomColorSelected = !ACCENT_COLOR_PRESETS.some(
    (preset) => preset.toLowerCase() === accentTokens.base.toLowerCase(),
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {!hideTrigger ? (
        <SheetTrigger
          render={
            <button
              type="button"
              data-shop-strip="true"
              className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-stone-200/90 bg-[#FAF8F4] px-3.5 py-2.5 text-left transition-colors hover:border-stone-300 hover:bg-[#F3EFE6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.995]"
            />
          }
        >
          <span className="flex min-w-0 items-center gap-3">
            {logoDataUrl ? (
              <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-stone-200/80 bg-white p-1">
                {/* eslint-disable-next-line @next/next/no-img-element -- Data URL logo preview */}
                <img
                  src={logoDataUrl}
                  alt={dictionary.shopLogo}
                  className="max-h-full max-w-full object-contain"
                />
              </span>
            ) : (
              <span
                data-shop-monogram="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-md text-sm font-bold tracking-tight"
                style={{
                  backgroundColor: isUnconfigured ? "#EFEAE0" : accentTokens.tint,
                  color: isUnconfigured ? "#57534E" : accentTokens.ink,
                }}
              >
                {trimmedShopName.length > 0 ? (
                  getShopInitial(trimmedShopName)
                ) : (
                  <Store className="size-4" />
                )}
              </span>
            )}

            <span className="min-w-0 space-y-0.5">
              <span className="flex flex-wrap items-center gap-2">
                <span className="truncate text-sm font-semibold text-stone-900">
                  {trimmedShopName.length > 0
                    ? trimmedShopName
                    : dictionary.shopProfileTitle}
                </span>
                {hasSavedNotice ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-500">
                    <Check className="size-3 text-emerald-700" />
                    <span>{dictionary.shopProfileSavedNotice}</span>
                  </span>
                ) : null}
              </span>

              <span className="block truncate text-xs text-stone-500">
                {trimmedPhones.length > 0
                  ? trimmedPhones
                  : dictionary.shopProfileSummaryEmpty}
              </span>
            </span>
          </span>

          <span
            className={
              isUnconfigured
                ? "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-md px-3 text-xs font-medium shadow-xs"
                : "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-stone-700 transition-colors group-hover:bg-stone-200/60 group-hover:text-stone-900"
            }
            style={
              isUnconfigured
                ? {
                    backgroundColor: accentTokens.base,
                    color: accentTokens.onAccent,
                  }
                : undefined
            }
          >
            <PencilLine className="size-3.5" />
            <span>{dictionary.editShopProfile}</span>
          </span>
        </SheetTrigger>
      ) : null}

      <SheetContent
        side="right"
        className="flex flex-col gap-0 bg-[#FFFEFB] p-0 data-[side=right]:w-full data-[side=right]:border-l-0 data-[side=right]:sm:max-w-lg data-[side=right]:sm:border-l data-[side=right]:sm:border-stone-200"
      >
        <SheetHeader className="border-b border-stone-200/90 px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="flex items-center gap-2 pr-8">
            <SheetTitle className="text-stone-900">
              {isPaymentOnly
                ? dictionary.paymentAccounts
                : dictionary.shopProfileTitle}
            </SheetTitle>
            {hasSavedNotice ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-500">
                <Check className="size-3 text-emerald-700" />
                <span>{dictionary.shopProfileSavedNotice}</span>
              </span>
            ) : null}
          </div>
          <SheetDescription className="text-xs text-stone-500">
            {isPaymentOnly
              ? dictionary.paymentAccountsHint
              : dictionary.shopProfileDescription}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
          {!isPaymentOnly ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="shop-name"
                className="text-xs font-medium text-stone-700"
              >
                {dictionary.shopName}
              </Label>
              <Input
                id="shop-name"
                className="h-10 bg-white"
                placeholder={dictionary.shopNamePlaceholder}
                {...form.register("shopName")}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="shop-phones"
                className="text-xs font-medium text-stone-700"
              >
                {dictionary.shopPhones}
              </Label>
              <Input
                id="shop-phones"
                type="tel"
                inputMode="tel"
                className="h-10 bg-white"
                placeholder={dictionary.shopPhonesPlaceholder}
                {...form.register("phones")}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="shop-address-social"
              className="text-xs font-medium text-stone-700"
            >
              {dictionary.shopAddressOrSocial}
            </Label>
            <Textarea
              id="shop-address-social"
              rows={2}
              className="bg-white"
              placeholder={dictionary.shopAddressOrSocialPlaceholder}
              {...form.register("addressOrSocial")}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <ImageUploadField
              id="shop-logo-upload"
              label={dictionary.shopLogo}
              uploadLabel={dictionary.uploadLogo}
              removeLabel={dictionary.removeLogo}
              value={logoDataUrl}
              preset="logo"
              dictionary={dictionary}
              onChange={(dataUrl) =>
                form.setValue("logoDataUrl", dataUrl, {
                  shouldDirty: true,
                  shouldTouch: true,
                })
              }
            />

            <div className="space-y-2">
              <Label className="text-xs font-medium text-stone-700">
                {dictionary.accentColor}
              </Label>
              <div className="flex flex-wrap items-center gap-2">
                {ACCENT_COLOR_PRESETS.map((color) => {
                  const isSelected =
                    accentTokens.base.toLowerCase() === color.toLowerCase();
                  const colorTokens = getAccentTokens(color);
                  return (
                    <button
                      key={color}
                      type="button"
                      aria-label={`${dictionary.accentColor} ${color}`}
                      aria-pressed={isSelected}
                      onClick={() =>
                        form.setValue("accentColor", color, {
                          shouldDirty: true,
                          shouldTouch: true,
                        })
                      }
                      className="flex size-8 items-center justify-center rounded-full border border-black/10 transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      style={{
                        backgroundColor: color,
                        boxShadow: isSelected
                          ? `0 0 0 2px #FFFEFB, 0 0 0 4px ${color}`
                          : undefined,
                      }}
                    >
                      {isSelected ? (
                        <Check
                          className="size-3.5"
                          style={{ color: colorTokens.onAccent }}
                        />
                      ) : null}
                    </button>
                  );
                })}

                <label
                  htmlFor="shop-accent-custom"
                  className="relative inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border border-stone-300 bg-white px-2.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100"
                  style={
                    isCustomColorSelected
                      ? {
                          boxShadow: `0 0 0 2px #FFFEFB, 0 0 0 4px ${accentTokens.ink}`,
                        }
                      : undefined
                  }
                >
                  <input
                    id="shop-accent-custom"
                    type="color"
                    value={accentTokens.base}
                    onChange={(event) =>
                      form.setValue("accentColor", event.target.value, {
                        shouldDirty: true,
                        shouldTouch: true,
                      })
                    }
                    className="sr-only"
                  />
                  <span
                    className="flex size-4 items-center justify-center rounded-full border border-black/15"
                    style={{ backgroundColor: accentTokens.base }}
                  >
                    {isCustomColorSelected ? (
                      <Check
                        data-custom-color-check="true"
                        className="size-2.5"
                        style={{ color: accentTokens.onAccent }}
                      />
                    ) : null}
                  </span>
                  <Palette className="size-3.5 text-stone-500" />
                  <span>{dictionary.customColor}</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="shop-default-footer"
              className="text-xs font-medium text-stone-700"
            >
              {dictionary.defaultFooter}
            </Label>
              <Textarea
                id="shop-default-footer"
                rows={2}
                className="bg-white"
                placeholder={dictionary.defaultFooterPlaceholder}
                {...form.register("defaultFooter")}
              />
            </div>

            <Separator className="bg-stone-200/80" />
            </>
          ) : null}

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="text-sm font-medium text-stone-900">
                {dictionary.paymentAccounts}
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-9 border-stone-300 bg-white px-3 text-xs"
                onClick={() => append(createEmptyPaymentAccount())}
              >
                <Plus className="size-3.5" />
                <span>{dictionary.addPaymentAccount}</span>
              </Button>
            </div>

            {fields.length > 0 ? (
              <div className="space-y-3">
                {fields.map((field, index) => {
                  const qrValue = paymentAccounts?.[index]?.qrImageDataUrl;
                  return (
                    <div
                      key={field.fieldKey}
                      className="space-y-3 rounded-lg border border-stone-200/90 bg-[#FAF8F4] p-3.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold tabular-nums text-stone-500">
                          <CreditCard className="size-3.5" />
                          <span>#{index + 1}</span>
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="min-h-9 px-2.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="size-3.5" />
                          <span>{dictionary.removePaymentAccount}</span>
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <div className="space-y-1">
                          <Label
                            htmlFor={`payment-label-${index}`}
                            className="text-xs font-medium text-stone-700"
                          >
                            {dictionary.paymentLabel}
                          </Label>
                          <Input
                            id={`payment-label-${index}`}
                            className="h-10 bg-white"
                            placeholder={dictionary.paymentLabelPlaceholder}
                            {...form.register(
                              `paymentAccounts.${index}.label`,
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="space-y-1">
                            <Label
                              htmlFor={`payment-account-name-${index}`}
                              className="text-xs font-medium text-stone-700"
                            >
                              {dictionary.paymentAccountName}
                            </Label>
                            <Input
                              id={`payment-account-name-${index}`}
                              className="h-10 bg-white"
                              placeholder={
                                dictionary.paymentAccountNamePlaceholder
                              }
                              {...form.register(
                                `paymentAccounts.${index}.accountName`,
                              )}
                            />
                          </div>

                          <div className="space-y-1">
                            <Label
                              htmlFor={`payment-account-number-${index}`}
                              className="text-xs font-medium text-stone-700"
                            >
                              {dictionary.paymentAccountNumber}
                            </Label>
                            <Input
                              id={`payment-account-number-${index}`}
                              inputMode="tel"
                              className="h-10 bg-white"
                              placeholder={
                                dictionary.paymentAccountNumberPlaceholder
                              }
                              {...form.register(
                                `paymentAccounts.${index}.accountNumber`,
                              )}
                            />
                          </div>
                        </div>
                      </div>

                      <ImageUploadField
                        id={`payment-qr-upload-${index}`}
                        label={dictionary.paymentQrImage}
                        uploadLabel={dictionary.uploadQr}
                        removeLabel={dictionary.removeQr}
                        value={qrValue}
                        preset="qr"
                        dictionary={dictionary}
                        onChange={(dataUrl) =>
                          form.setValue(
                            `paymentAccounts.${index}.qrImageDataUrl`,
                            dataUrl,
                            {
                              shouldDirty: true,
                              shouldTouch: true,
                            },
                          )
                        }
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-lg border border-stone-200/80 bg-[#FAF8F4] px-3.5 py-3 text-xs text-stone-600">
                {dictionary.paymentAccountsHint}
              </p>
            )}
          </div>

          {!isPaymentOnly ? (
            <>
              <Separator className="bg-stone-200/80" />

              <div>
                {isConfirmingReset ? (
                  <div className="flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <p className="text-xs font-medium text-destructive">
                      {dictionary.resetShopProfileConfirm}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="min-h-9 gap-1.5 px-3"
                        onClick={handleConfirmReset}
                      >
                        <Trash2 className="size-3.5" />
                        <span>{dictionary.resetShopProfile}</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="min-h-9 gap-1.5 px-3"
                        onClick={() => setIsConfirmingReset(false)}
                      >
                        <X className="size-3.5" />
                        <span>{dictionary.cancelAction}</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="min-h-9 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setIsConfirmingReset(true)}
                  >
                    <RotateCcw className="size-3.5" />
                    <span>{dictionary.resetShopProfile}</span>
                  </Button>
                )}
              </div>
            </>
          ) : null}
        </div>

        <SheetFooter className="flex-row items-center justify-between gap-3 border-t border-stone-200/90 bg-[#FAF8F4] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
          <span className="text-[11px] text-stone-500">
            {dictionary.shopProfileSavedNotice}
          </span>
          <SheetClose
            render={
              <Button
                type="button"
                className="min-h-10 shrink-0 gap-1.5 px-5 sm:w-auto"
                style={{
                  backgroundColor: accentTokens.base,
                  color: accentTokens.onAccent,
                }}
              />
            }
          >
            <Check className="size-4" />
            <span>{dictionary.collapseShopProfile}</span>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
