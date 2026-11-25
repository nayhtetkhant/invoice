"use client";

import * as React from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import {
  Check,
  PencilLine,
  Plus,
  RotateCcw,
  Store,
  Trash2,
} from "lucide-react";
import { ImageUploadField } from "@/components/image-upload-field";
import { Badge } from "@/components/ui/badge";
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
import { createEmptyPaymentAccount } from "@/lib/voucher-calculations";
import {
  ACCENT_COLOR_PRESETS,
  DEFAULT_ACCENT_COLOR,
  type ShopProfile,
} from "@/types/voucher";

interface ShopProfileFormProps {
  dictionary: Dictionary;
  profile: ShopProfile;
  isHydrated: boolean;
  defaultOpen?: boolean;
  onProfileChange: (profile: ShopProfile) => void;
}

export function ShopProfileForm({
  dictionary,
  profile,
  isHydrated,
  defaultOpen = false,
  onProfileChange,
}: ShopProfileFormProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const [isConfirmingReset, setIsConfirmingReset] = React.useState(false);
  const [hasSavedNotice, setHasSavedNotice] = React.useState(false);

  const lastSavedJsonRef = React.useRef(
    JSON.stringify(sanitizeShopProfile(profile)),
  );

  const form = useForm<ShopProfile>({
    defaultValues: profile,
  });

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

  const safeAccent = accentColor?.trim() || DEFAULT_ACCENT_COLOR;
  const trimmedShopName = shopName?.trim() ?? "";
  const trimmedPhones = phones?.trim() ?? "";
  const paymentCount = paymentAccounts?.length ?? 0;
  const isUnconfigured = trimmedShopName.length === 0 && paymentCount === 0;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <div
        data-shop-strip="true"
        className={`flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 transition-colors ${
          isUnconfigured
            ? "border-dashed border-slate-300 bg-slate-50/80"
            : "border-slate-200/90 bg-slate-50/50"
        }`}
      >
        <div className="flex min-w-0 items-center gap-3">
          {logoDataUrl ? (
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white p-1">
              {/* eslint-disable-next-line @next/next/no-img-element -- Data URL logo preview */}
              <img
                src={logoDataUrl}
                alt={dictionary.shopLogo}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-lg text-white shadow-xs"
              style={{ backgroundColor: safeAccent }}
            >
              <Store className="size-4" />
            </div>
          )}

          <div className="min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="truncate text-sm font-semibold text-slate-900">
                {trimmedShopName.length > 0
                  ? trimmedShopName
                  : dictionary.shopProfileTitle}
              </p>
              {paymentCount > 0 ? (
                <Badge variant="secondary" className="h-5 px-1.5 text-[11px]">
                  {paymentCount}
                </Badge>
              ) : null}
              {hasSavedNotice ? (
                <Badge
                  variant="outline"
                  className="h-5 border-emerald-200 bg-emerald-50 px-1.5 text-[10px] text-emerald-700"
                >
                  {dictionary.shopProfileSavedNotice}
                </Badge>
              ) : null}
            </div>

            <p className="truncate text-xs text-slate-500">
              {trimmedPhones.length > 0
                ? trimmedPhones
                : dictionary.shopProfileSummaryEmpty}
            </p>
          </div>
        </div>

        <SheetTrigger
          render={
            <Button
              type="button"
              variant={isUnconfigured ? "default" : "outline"}
              size="sm"
              className="min-h-9 shrink-0 gap-1.5 px-3 text-xs font-medium"
              style={
                isUnconfigured
                  ? { backgroundColor: safeAccent, color: "#ffffff" }
                  : undefined
              }
            />
          }
        >
          <PencilLine className="size-3.5" />
          <span>{dictionary.editShopProfile}</span>
        </SheetTrigger>
      </div>

      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:border-l-0 data-[side=right]:sm:max-w-lg data-[side=right]:sm:border-l"
      >
        <SheetHeader className="border-b border-slate-200 px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="flex items-center gap-2 pr-8">
            <Store
              className="size-4 shrink-0"
              style={{ color: safeAccent }}
            />
            <SheetTitle>{dictionary.shopProfileTitle}</SheetTitle>
            {hasSavedNotice ? (
              <Badge
                variant="outline"
                className="border-emerald-200 bg-emerald-50 text-[11px] text-emerald-700"
              >
                {dictionary.shopProfileSavedNotice}
              </Badge>
            ) : null}
          </div>
          <SheetDescription className="text-xs">
            {dictionary.shopProfileDescription}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="shop-name">{dictionary.shopName}</Label>
              <Input
                id="shop-name"
                className="h-10"
                placeholder={dictionary.shopNamePlaceholder}
                {...form.register("shopName")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="shop-phones">{dictionary.shopPhones}</Label>
              <Input
                id="shop-phones"
                type="tel"
                inputMode="tel"
                className="h-10"
                placeholder={dictionary.shopPhonesPlaceholder}
                {...form.register("phones")}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="shop-address-social">
              {dictionary.shopAddressOrSocial}
            </Label>
            <Textarea
              id="shop-address-social"
              rows={2}
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
              <Label>{dictionary.accentColor}</Label>
              <div className="flex flex-wrap items-center gap-2">
                {ACCENT_COLOR_PRESETS.map((color) => {
                  const isSelected =
                    safeAccent.toLowerCase() === color.toLowerCase();
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
                      className="flex size-9 items-center justify-center rounded-full border transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      style={{
                        backgroundColor: color,
                        boxShadow: isSelected
                          ? `0 0 0 2px var(--background), 0 0 0 4px ${color}`
                          : undefined,
                      }}
                    >
                      {isSelected ? (
                        <Check className="size-4 text-white" />
                      ) : null}
                    </button>
                  );
                })}

                <label
                  htmlFor="shop-accent-custom"
                  className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-2.5 text-xs font-medium hover:bg-muted"
                >
                  <input
                    id="shop-accent-custom"
                    type="color"
                    value={safeAccent}
                    onChange={(event) =>
                      form.setValue("accentColor", event.target.value, {
                        shouldDirty: true,
                        shouldTouch: true,
                      })
                    }
                    className="size-5 cursor-pointer rounded border-0 bg-transparent p-0"
                  />
                  <span>{dictionary.customColor}</span>
                </label>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="text-sm font-medium">
                {dictionary.paymentAccounts}
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-9 px-3"
                onClick={() => append(createEmptyPaymentAccount())}
              >
                <Plus />
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
                      className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="min-h-8 px-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => remove(index)}
                        >
                          <Trash2 />
                          <span>{dictionary.removePaymentAccount}</span>
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor={`payment-label-${index}`}>
                            {dictionary.paymentLabel}
                          </Label>
                          <Input
                            id={`payment-label-${index}`}
                            className="h-10 bg-background"
                            placeholder={dictionary.paymentLabelPlaceholder}
                            {...form.register(
                              `paymentAccounts.${index}.label`,
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <Label htmlFor={`payment-account-name-${index}`}>
                              {dictionary.paymentAccountName}
                            </Label>
                            <Input
                              id={`payment-account-name-${index}`}
                              className="h-10 bg-background"
                              placeholder={
                                dictionary.paymentAccountNamePlaceholder
                              }
                              {...form.register(
                                `paymentAccounts.${index}.accountName`,
                              )}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor={`payment-account-number-${index}`}>
                              {dictionary.paymentAccountNumber}
                            </Label>
                            <Input
                              id={`payment-account-number-${index}`}
                              inputMode="tel"
                              className="h-10 bg-background"
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
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="shop-default-footer">
              {dictionary.defaultFooter}
            </Label>
            <Textarea
              id="shop-default-footer"
              rows={2}
              placeholder={dictionary.defaultFooterPlaceholder}
              {...form.register("defaultFooter")}
            />
          </div>

          <Separator />

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
                    className="min-h-9 px-3"
                    onClick={handleConfirmReset}
                  >
                    {dictionary.resetShopProfile}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="min-h-9 px-3"
                    onClick={() => setIsConfirmingReset(false)}
                  >
                    {dictionary.collapseShopProfile}
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
                <RotateCcw />
                <span>{dictionary.resetShopProfile}</span>
              </Button>
            )}
          </div>
        </div>

        <SheetFooter className="border-t border-slate-200 bg-slate-50/80 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
          <SheetClose
            render={
              <Button
                type="button"
                className="min-h-10 w-full text-white sm:w-auto"
                style={{ backgroundColor: safeAccent }}
              />
            }
          >
            {dictionary.collapseShopProfile}
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
