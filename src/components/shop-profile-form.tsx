"use client";

import * as React from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  RotateCcw,
  Store,
  Trash2,
} from "lucide-react";
import { ImageUploadField } from "@/components/image-upload-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
  type ShopProfile,
} from "@/types/voucher";

interface ShopProfileFormProps {
  dictionary: Dictionary;
  profile: ShopProfile;
  isHydrated: boolean;
  onProfileChange: (profile: ShopProfile) => void;
}

export function ShopProfileForm({
  dictionary,
  profile,
  isHydrated,
  onProfileChange,
}: ShopProfileFormProps) {
  const [isOpen, setIsOpen] = React.useState(() => {
    const hasExistingSetup =
      profile.shopName.trim().length > 0 || profile.paymentAccounts.length > 0;
    return !hasExistingSetup;
  });
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

  const trimmedShopName = shopName?.trim() ?? "";
  const paymentCount = paymentAccounts?.length ?? 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader className="gap-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Store
                  className="size-4 shrink-0"
                  style={{ color: accentColor }}
                />
                <CardTitle>{dictionary.shopProfileTitle}</CardTitle>
                {paymentCount > 0 ? (
                  <Badge variant="secondary">{paymentCount}</Badge>
                ) : null}
                {hasSavedNotice ? (
                  <Badge variant="outline" className="text-[11px]">
                    {dictionary.shopProfileSavedNotice}
                  </Badge>
                ) : null}
              </div>

              <CardDescription className="truncate">
                {trimmedShopName.length > 0
                  ? trimmedShopName
                  : dictionary.shopProfileSummaryEmpty}
              </CardDescription>
            </div>

            <CollapsibleTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="min-h-10 shrink-0 px-3"
                />
              }
            >
              <span>
                {isOpen
                  ? dictionary.collapseShopProfile
                  : dictionary.editShopProfile}
              </span>
              {isOpen ? <ChevronUp /> : <ChevronDown />}
            </CollapsibleTrigger>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-5 pt-1">
            <p className="text-xs text-muted-foreground">
              {dictionary.shopProfileDescription}
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="shop-name">{dictionary.shopName}</Label>
                <Input
                  id="shop-name"
                  className="h-10"
                  placeholder={dictionary.shopNamePlaceholder}
                  {...form.register("shopName")}
                />
              </div>

              <div className="space-y-2">
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

            <div className="space-y-2">
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
                      accentColor?.toLowerCase() === color.toLowerCase();
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
                        className="flex size-10 items-center justify-center rounded-full border transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
                    className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-2.5 text-xs font-medium hover:bg-muted"
                  >
                    <input
                      id="shop-accent-custom"
                      type="color"
                      value={accentColor}
                      onChange={(event) =>
                        form.setValue("accentColor", event.target.value, {
                          shouldDirty: true,
                          shouldTouch: true,
                        })
                      }
                      className="size-6 cursor-pointer rounded border-0 bg-transparent p-0"
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
                  size="lg"
                  className="min-h-10 px-3"
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
                        className="space-y-3 rounded-xl border bg-muted/30 p-3.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="min-h-9 px-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => remove(index)}
                          >
                            <Trash2 />
                            <span>{dictionary.removePaymentAccount}</span>
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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

            <div className="space-y-2">
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

            <div className="flex flex-wrap items-center justify-between gap-3">
              {isConfirmingReset ? (
                <div className="flex w-full flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 sm:flex-row sm:items-center sm:justify-between">
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
                  size="lg"
                  className="min-h-10 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setIsConfirmingReset(true)}
                >
                  <RotateCcw />
                  <span>{dictionary.resetShopProfile}</span>
                </Button>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
