"use client";

import * as React from "react";
import { Eye, FileText, PencilLine, Store } from "lucide-react";
import { ShopProfileForm } from "@/components/shop-profile-form";
import { VoucherOrderForm } from "@/components/voucher-order-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDictionary } from "@/lib/i18n";
import { loadShopProfile } from "@/lib/shop-profile-storage";
import {
  createDefaultShopProfile,
  createDefaultVoucherOrder,
} from "@/lib/voucher-calculations";
import type { Language, ShopProfile, VoucherOrder } from "@/types/voucher";

type MobileTab = "edit" | "preview";

const EMPTY_SUBSCRIBE = () => () => {};

const SSR_INITIAL_ORDER: VoucherOrder = {
  voucherNumber: "",
  date: "",
  customer: {
    name: "",
    phone: "",
    address: "",
  },
  items: [],
  currency: "MMK",
  discount: 0,
  deliveryFee: 0,
  deposit: 0,
  notes: "",
};

export function VoucherBuilderShell() {
  const [language, setLanguage] = React.useState<Language>("my");
  const [activeTab, setActiveTab] = React.useState<MobileTab>("edit");
  const [editedProfile, setEditedProfile] = React.useState<ShopProfile | null>(
    null,
  );
  const [editedOrder, setEditedOrder] = React.useState<VoucherOrder | null>(
    null,
  );

  const isHydrated = React.useSyncExternalStore(
    EMPTY_SUBSCRIBE,
    () => true,
    () => false,
  );

  const initialProfile = React.useMemo(
    () => (isHydrated ? loadShopProfile() : createDefaultShopProfile()),
    [isHydrated],
  );
  const initialOrder = React.useMemo(
    () => (isHydrated ? createDefaultVoucherOrder() : SSR_INITIAL_ORDER),
    [isHydrated],
  );

  const shopProfile = editedProfile ?? initialProfile;
  const voucherOrder = editedOrder ?? initialOrder;
  const dictionary = getDictionary(language);

  React.useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const handleProfileChange = React.useCallback((nextProfile: ShopProfile) => {
    setEditedProfile(nextProfile);
  }, []);

  const handleOrderChange = React.useCallback((nextOrder: VoucherOrder) => {
    setEditedOrder(nextOrder);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: shopProfile.accentColor }}
            >
              <FileText className="size-4" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold leading-tight sm:text-lg">
                {dictionary.appTitle}
              </h1>
              <p className="truncate text-xs text-muted-foreground">
                {dictionary.appSubtitle}
              </p>
            </div>
          </div>

          <div
            className="inline-flex shrink-0 items-center rounded-lg border bg-muted p-0.5"
            role="group"
            aria-label={dictionary.languageLabel}
          >
            <Button
              type="button"
              size="sm"
              variant={language === "my" ? "default" : "ghost"}
              aria-pressed={language === "my"}
              className="min-h-8 px-2.5 text-xs"
              onClick={() => setLanguage("my")}
            >
              {dictionary.langMy}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={language === "en" ? "default" : "ghost"}
              aria-pressed={language === "en"}
              className="min-h-8 px-2.5 text-xs"
              onClick={() => setLanguage("en")}
            >
              {dictionary.langEn}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-4 px-4 py-4 sm:px-6 sm:py-6">
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            if (value === "edit" || value === "preview") {
              setActiveTab(value);
            }
          }}
          className="lg:hidden"
        >
          <TabsList className="grid h-11 w-full grid-cols-2">
            <TabsTrigger value="edit" className="min-h-9 gap-1.5 text-sm">
              <PencilLine className="size-4" />
              <span>{dictionary.tabEdit}</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="min-h-9 gap-1.5 text-sm">
              <Eye className="size-4" />
              <span>{dictionary.tabPreviewExport}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          <section
            aria-label={dictionary.tabEdit}
            className={`space-y-5 lg:col-span-7 ${
              activeTab === "edit" ? "block" : "hidden lg:block"
            }`}
          >
            <ShopProfileForm
              key={isHydrated ? "hydrated" : "ssr"}
              dictionary={dictionary}
              profile={shopProfile}
              isHydrated={isHydrated}
              onProfileChange={handleProfileChange}
            />

            <VoucherOrderForm
              key={isHydrated ? "order-hydrated" : "order-ssr"}
              dictionary={dictionary}
              language={language}
              accentColor={shopProfile.accentColor}
              order={voucherOrder}
              onOrderChange={handleOrderChange}
            />
          </section>

          <aside
            aria-label={dictionary.tabPreviewExport}
            className={`space-y-5 lg:sticky lg:top-20 lg:col-span-5 ${
              activeTab === "preview" ? "block" : "hidden lg:block"
            }`}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{dictionary.previewTitle}</CardTitle>
                  <Badge variant="outline">{dictionary.voucherHeading}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="overflow-hidden rounded-xl border bg-background shadow-xs">
                  <div
                    className="h-2 w-full"
                    style={{ backgroundColor: shopProfile.accentColor }}
                  />
                  <div className="space-y-3 p-4">
                    <div className="flex items-start gap-3">
                      {shopProfile.logoDataUrl ? (
                        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white p-1">
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
                          style={{ backgroundColor: shopProfile.accentColor }}
                        >
                          <Store className="size-5" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="break-words text-base font-semibold leading-snug">
                          {shopProfile.shopName.trim() ||
                            dictionary.shopProfileSummaryEmpty}
                        </p>
                        {shopProfile.phones.trim() ? (
                          <p className="break-words text-xs text-muted-foreground">
                            {shopProfile.phones}
                          </p>
                        ) : null}
                        {shopProfile.addressOrSocial.trim() ? (
                          <p className="whitespace-pre-line break-words text-xs text-muted-foreground">
                            {shopProfile.addressOrSocial}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {shopProfile.paymentAccounts.length > 0 ? (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            {dictionary.paymentMethodsLabel}
                          </p>
                          <div className="space-y-2">
                            {shopProfile.paymentAccounts.map((account) => (
                              <div
                                key={account.id}
                                className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 p-2 text-xs"
                              >
                                <div className="min-w-0 space-y-0.5">
                                  <p className="font-medium break-words">
                                    {account.label || dictionary.paymentLabel}
                                  </p>
                                  <p className="text-muted-foreground break-words">
                                    {[
                                      account.accountName,
                                      account.accountNumber,
                                    ]
                                      .filter((part) => part.trim().length > 0)
                                      .join(" · ")}
                                  </p>
                                </div>
                                {account.qrImageDataUrl ? (
                                  <div className="size-11 shrink-0 overflow-hidden rounded border bg-white p-0.5">
                                    {/* eslint-disable-next-line @next/next/no-img-element -- Data URL QR preview */}
                                    <img
                                      src={account.qrImageDataUrl}
                                      alt={
                                        account.label ||
                                        dictionary.paymentQrImage
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

                    <Separator />
                    <p className="whitespace-pre-line break-words text-center text-xs text-muted-foreground">
                      {shopProfile.defaultFooter.trim() ||
                        dictionary.thankYouFallback}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
