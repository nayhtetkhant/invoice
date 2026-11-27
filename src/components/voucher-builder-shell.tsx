"use client";

import * as React from "react";
import {
  ArrowLeft,
  Check,
  Coins,
  CreditCard,
  Download,
  Eye,
  Languages,
  Loader2,
  Palette,
  RotateCcw,
  X,
} from "lucide-react";
import {
  ShopProfileForm,
  type ShopProfileSection,
} from "@/components/shop-profile-form";
import {
  VoucherExportCard,
  type CopyStatus,
  type ExportStatus,
} from "@/components/voucher-export-card";
import { VoucherOrderForm } from "@/components/voucher-order-form";
import { VoucherPreviewCard } from "@/components/voucher-preview-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getDictionary } from "@/lib/i18n";
import {
  getNextVoucherNumber,
  loadShopProfile,
  sanitizeShopProfile,
  saveLastVoucherNumber,
  saveShopProfile,
} from "@/lib/shop-profile-storage";
import {
  calculateVoucherTotals,
  createDefaultShopProfile,
  createDefaultVoucherOrder,
  formatCurrency,
  getAccentTokens,
  sanitizeVoucherOrder,
} from "@/lib/voucher-calculations";
import { copyVoucherImage, exportVoucher } from "@/lib/voucher-export";
import {
  ACCENT_COLOR_PRESETS,
  CURRENCIES,
  type Currency,
  type ExportFormat,
  type Language,
  type PdfPaperSize,
  type ShopProfile,
  type VoucherOrder,
} from "@/types/voucher";

type ViewMode = "edit" | "preview";

const EMPTY_SUBSCRIBE = () => () => {};

const CURRENCY_LABELS: Record<Currency, string> = {
  MMK: "MMK (Ks / ကျပ်)",
  THB: "THB (฿)",
  USD: "USD ($)",
};

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

function hasOrderContent(order: VoucherOrder): boolean {
  const current = sanitizeVoucherOrder(order);
  return (
    current.customer.name.trim().length > 0 ||
    current.customer.phone.trim().length > 0 ||
    current.customer.address.trim().length > 0 ||
    current.notes.trim().length > 0 ||
    current.discount > 0 ||
    current.deliveryFee > 0 ||
    current.deposit > 0 ||
    current.items.some(
      (item) => item.name.trim().length > 0 || item.unitPrice > 0,
    )
  );
}

export function VoucherBuilderShell() {
  const [language, setLanguage] = React.useState<Language>("my");
  const [viewMode, setViewMode] = React.useState<ViewMode>("edit");
  const [profileSheetSection, setProfileSheetSection] =
    React.useState<ShopProfileSection | null>(null);
  const [isConfirmingClear, setIsConfirmingClear] = React.useState(false);
  const [editedProfile, setEditedProfile] = React.useState<ShopProfile | null>(
    null,
  );
  const [editedOrder, setEditedOrder] = React.useState<VoucherOrder | null>(
    null,
  );
  const [exportFormat, setExportFormat] = React.useState<ExportFormat>("png");
  const [paperSize, setPaperSize] = React.useState<PdfPaperSize>("a4");
  const [exportStatus, setExportStatus] = React.useState<ExportStatus>("idle");
  const [copyStatus, setCopyStatus] = React.useState<CopyStatus>("idle");
  const voucherPreviewRef = React.useRef<HTMLDivElement>(null);

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
    () =>
      isHydrated
        ? createDefaultVoucherOrder(undefined, getNextVoucherNumber())
        : SSR_INITIAL_ORDER,
    [isHydrated],
  );

  const shopProfile = editedProfile ?? initialProfile;
  const voucherOrder = editedOrder ?? initialOrder;
  const dictionary = getDictionary(language);
  const accent = getAccentTokens(shopProfile.accentColor);
  const totals = calculateVoucherTotals(voucherOrder);
  const isCustomColorSelected = !ACCENT_COLOR_PRESETS.some(
    (preset) => preset.toLowerCase() === accent.base.toLowerCase(),
  );

  React.useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const handleProfileChange = React.useCallback((nextProfile: ShopProfile) => {
    setEditedProfile(nextProfile);
    setCopyStatus("idle");
  }, []);

  const handleOrderChange = React.useCallback((nextOrder: VoucherOrder) => {
    setEditedOrder(nextOrder);
    setCopyStatus("idle");
  }, []);

  function handleAccentColorChange(color: string) {
    const nextProfile = sanitizeShopProfile({
      ...shopProfile,
      accentColor: color,
    });
    saveShopProfile(nextProfile);
    handleProfileChange(nextProfile);
  }

  function handleCurrencyChange(nextCurrency: Currency) {
    handleOrderChange({
      ...voucherOrder,
      currency: nextCurrency,
    });
  }

  function handleRequestNewVoucher() {
    if (!hasOrderContent(voucherOrder)) {
      handleConfirmNewVoucher();
      return;
    }
    setIsConfirmingClear(true);
  }

  function handleConfirmNewVoucher() {
    saveLastVoucherNumber(voucherOrder.voucherNumber);
    const fresh = createDefaultVoucherOrder(undefined, getNextVoucherNumber());
    setExportStatus("idle");
    setCopyStatus("idle");
    setIsConfirmingClear(false);
    setEditedOrder(fresh);
  }

  function handleSwitchView(nextMode: ViewMode) {
    setViewMode(nextMode);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleExport() {
    setExportStatus("exporting");
    try {
      await exportVoucher({
        element: voucherPreviewRef.current,
        format: exportFormat,
        paperSize,
        order: voucherOrder,
      });
      saveLastVoucherNumber(voucherOrder.voucherNumber);
      setExportStatus("success");
    } catch {
      setExportStatus("error");
    }
  }

  async function handleCopyImage() {
    setCopyStatus("copying");
    try {
      await copyVoucherImage({ element: voucherPreviewRef.current });
      saveLastVoucherNumber(voucherOrder.voucherNumber);
      setCopyStatus("success");
    } catch {
      setCopyStatus("error");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F4F6]">
      <header className="sticky top-0 z-30 border-b border-stone-200/90 bg-white/95 backdrop-blur-sm lg:static">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-baseline gap-2.5">
            <h1 className="truncate text-sm leading-relaxed font-semibold tracking-tight text-stone-900 sm:text-base">
              {dictionary.appTitle}
            </h1>
            <span
              aria-hidden="true"
              className="hidden px-0.5 text-stone-300 sm:inline"
            >
              |
            </span>
            <span className="hidden truncate text-xs leading-relaxed text-stone-500 sm:inline">
              {dictionary.appSubtitle}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* Compact mobile New Voucher button right in the header */}
            {isConfirmingClear ? (
              <div className="flex items-center gap-1 lg:hidden">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={handleConfirmNewVoucher}
                >
                  <Check className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => setIsConfirmingClear(false)}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label={dictionary.newClearVoucher}
                onClick={handleRequestNewVoucher}
                className="h-8 gap-1 border-amber-200 bg-amber-50/50 px-2 text-xs text-amber-950 hover:border-amber-300 hover:bg-amber-50 lg:hidden"
              >
                <RotateCcw className="size-3.5 text-amber-600" />
              </Button>
            )}

            <div
              className="inline-flex shrink-0 items-center rounded-md border border-stone-200/90 bg-[#F3F4F6] p-0.5"
              role="group"
              aria-label={dictionary.languageLabel}
            >
              <Languages
                aria-hidden="true"
                className="mx-1.5 size-3.5 shrink-0 text-stone-500"
              />
              <button
                type="button"
                aria-pressed={language === "my"}
                onClick={() => setLanguage("my")}
                className={`min-h-7 rounded-[4px] px-2.5 text-xs font-medium transition-colors ${
                  language === "my"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {dictionary.langMy}
              </button>
              <button
                type="button"
                aria-pressed={language === "en"}
                onClick={() => setLanguage("en")}
                className={`min-h-7 rounded-[4px] px-2.5 text-xs font-medium transition-colors ${
                  language === "en"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {dictionary.langEn}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-6 px-3 py-4 pb-28 sm:px-6 lg:grid-cols-[minmax(0,1fr)_304px] lg:items-start lg:px-8 lg:py-8 lg:pb-12">
        <section
          data-editor-pane="true"
          aria-label={
            viewMode === "edit" ? dictionary.tabEdit : dictionary.tabPreviewExport
          }
          className="min-w-0"
        >
          {viewMode === "edit" ? (
            <VoucherOrderForm
              key={isHydrated ? "order-hydrated" : "order-ssr"}
              dictionary={dictionary}
              language={language}
              accentColor={accent.base}
              order={voucherOrder}
              shopProfile={shopProfile}
              paymentAccounts={shopProfile.paymentAccounts}
              onOrderChange={handleOrderChange}
              onProfileChange={handleProfileChange}
              onOpenShopSettings={() => setProfileSheetSection("full")}
              onOpenPaymentSettings={() => setProfileSheetSection("payment")}
            />
          ) : (
            <div data-document-stage="true" className="space-y-4">
              <div className="mx-auto flex w-full max-w-[460px] items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-9 gap-1.5 border-stone-300 bg-white px-3 text-xs font-medium text-stone-800"
                  onClick={() => handleSwitchView("edit")}
                >
                  <ArrowLeft className="size-3.5" />
                  <span>{dictionary.backToEdit}</span>
                </Button>
                <span className="text-xs font-medium text-stone-500">
                  {dictionary.previewTitle}
                </span>
              </div>

              <VoucherPreviewCard
                dictionary={dictionary}
                language={language}
                shopProfile={shopProfile}
                order={voucherOrder}
                previewRef={voucherPreviewRef}
              />
            </div>
          )}
        </section>

        {/* Export & controls rail: stacked below paper on < lg, sticky right rail on lg+ */}
        <aside
          data-sidebar-rail="true"
          aria-label={dictionary.tabPreviewExport}
          className="space-y-4 lg:sticky lg:top-6"
        >
          <VoucherExportCard
            dictionary={dictionary}
            accentColor={accent.base}
            order={voucherOrder}
            previewRef={voucherPreviewRef}
            format={exportFormat}
            paperSize={paperSize}
            status={exportStatus}
            copyStatus={copyStatus}
            onFormatChange={(nextFormat) => {
              setExportFormat(nextFormat);
              setExportStatus("idle");
            }}
            onPaperSizeChange={(nextPaperSize) => {
              setPaperSize(nextPaperSize);
              setExportStatus("idle");
            }}
            onExport={handleExport}
            onCopyImage={handleCopyImage}
          />

          <div className="mx-auto w-full max-w-[460px] space-y-4 rounded-md border border-stone-200/90 bg-white p-3.5 shadow-xs lg:max-w-none">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex min-h-9 w-full justify-center gap-1.5 border-sky-200 bg-sky-50/60 text-xs font-medium text-sky-950 hover:border-sky-300 hover:bg-sky-50"
              onClick={() =>
                handleSwitchView(viewMode === "edit" ? "preview" : "edit")
              }
            >
              {viewMode === "edit" ? (
                <>
                  <Eye className="size-3.5 text-sky-600" />
                  <span>{dictionary.previewButton}</span>
                </>
              ) : (
                <>
                  <ArrowLeft className="size-3.5 text-sky-600" />
                  <span>{dictionary.backToEdit}</span>
                </>
              )}
            </Button>

            <div className="space-y-1.5">
              <Label
                htmlFor="sidebar-currency"
                className="flex items-center gap-1.5 text-xs font-medium text-stone-600"
              >
                <Coins className="size-3.5 text-amber-600" />
                <span>{dictionary.currency}</span>
              </Label>
              <Select
                value={voucherOrder.currency}
                items={CURRENCY_LABELS}
                onValueChange={(nextValue) => {
                  if (
                    nextValue === "MMK" ||
                    nextValue === "THB" ||
                    nextValue === "USD"
                  ) {
                    handleCurrencyChange(nextValue);
                  }
                }}
              >
                <SelectTrigger
                  id="sidebar-currency"
                  className="w-full border-stone-200 bg-white data-[size=default]:h-9"
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
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-medium text-stone-600">
                <Palette className="size-3.5 text-violet-600" />
                <span>{dictionary.accentColor}</span>
              </Label>
              <div className="flex flex-wrap items-center gap-2">
                {ACCENT_COLOR_PRESETS.map((color) => {
                  const isSelected =
                    accent.base.toLowerCase() === color.toLowerCase();
                  const colorTokens = getAccentTokens(color);
                  return (
                    <button
                      key={color}
                      type="button"
                      aria-label={`${dictionary.accentColor} ${color}`}
                      aria-pressed={isSelected}
                      onClick={() => handleAccentColorChange(color)}
                      className="flex size-7 items-center justify-center rounded-full border border-black/10 transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      style={{
                        backgroundColor: color,
                        boxShadow: isSelected
                          ? `0 0 0 2px #ffffff, 0 0 0 3.5px ${color}`
                          : undefined,
                      }}
                    >
                      {isSelected ? (
                        <Check
                          className="size-3"
                          style={{ color: colorTokens.onAccent }}
                        />
                      ) : null}
                    </button>
                  );
                })}

                <label
                  htmlFor="sidebar-accent-custom"
                  className="relative inline-flex min-h-7 cursor-pointer items-center gap-1 rounded-full border border-stone-300 bg-white px-2 text-[11px] font-medium text-stone-700 transition-colors hover:bg-stone-100"
                  style={
                    isCustomColorSelected
                      ? {
                          boxShadow: `0 0 0 2px #ffffff, 0 0 0 3.5px ${accent.ink}`,
                        }
                      : undefined
                  }
                >
                  <input
                    id="sidebar-accent-custom"
                    type="color"
                    value={accent.base}
                    onChange={(event) =>
                      handleAccentColorChange(event.target.value)
                    }
                    className="sr-only"
                  />
                  <span
                    className="flex size-3.5 items-center justify-center rounded-full border border-black/15"
                    style={{ backgroundColor: accent.base }}
                  >
                    {isCustomColorSelected ? (
                      <Check
                        className="size-2.5"
                        style={{ color: accent.onAccent }}
                      />
                    ) : null}
                  </span>
                  <span>{dictionary.customColor}</span>
                </label>
              </div>
            </div>

            <Separator className="bg-stone-200/80" />

            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-9 w-full justify-start gap-2 border-emerald-200 bg-emerald-50/60 text-xs font-medium text-emerald-950 hover:border-emerald-300 hover:bg-emerald-50"
                onClick={() => setProfileSheetSection("payment")}
              >
                <CreditCard className="size-3.5 text-emerald-600" />
                <span>{dictionary.managePaymentAccounts}</span>
              </Button>

              {isConfirmingClear ? (
                <div className="space-y-2 rounded-md border border-destructive/30 bg-destructive/5 p-2.5">
                  <p className="text-xs font-medium text-destructive">
                    {dictionary.clearVoucherConfirm}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="min-h-8 flex-1 gap-1 px-2 text-xs"
                      onClick={handleConfirmNewVoucher}
                    >
                      <RotateCcw className="size-3.5" />
                      <span>{dictionary.newClearVoucher}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="min-h-8 gap-1 bg-white px-2 text-xs"
                      onClick={() => setIsConfirmingClear(false)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-9 w-full justify-start gap-2 border-amber-200 bg-amber-50/50 text-xs font-medium text-amber-950 hover:border-amber-300 hover:bg-amber-50"
                  onClick={handleRequestNewVoucher}
                >
                  <RotateCcw className="size-3.5 text-amber-600" />
                  <span>{dictionary.newClearVoucher}</span>
                </Button>
              )}
            </div>
          </div>
        </aside>
      </main>

      {/* Off-screen high-resolution capture sheet when in edit mode so Download / Copy Image works in 1 click */}
      {viewMode === "edit" ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-0 left-[-9999px] w-[460px]"
        >
          <VoucherPreviewCard
            dictionary={dictionary}
            language={language}
            shopProfile={shopProfile}
            order={voucherOrder}
            previewRef={voucherPreviewRef}
          />
        </div>
      ) : null}

      <ShopProfileForm
        key={isHydrated ? "hydrated" : "ssr"}
        dictionary={dictionary}
        profile={shopProfile}
        isHydrated={isHydrated}
        open={profileSheetSection !== null}
        section={profileSheetSection ?? "full"}
        hideTrigger
        onOpenChange={(open) => {
          if (!open) {
            setProfileSheetSection(null);
          }
        }}
        onProfileChange={handleProfileChange}
      />

      <div
        data-mobile-summary-bar="true"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200/90 bg-white/95 px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgba(28,25,23,0.12)] backdrop-blur-sm sm:px-4 lg:hidden"
      >
        {viewMode === "edit" ? (
          <div className="mx-auto flex max-w-xl items-center justify-between gap-2.5">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium text-stone-500">
                {dictionary.balanceDueCod}
              </p>
              <p className="truncate text-base font-bold tabular-nums text-stone-900">
                {formatCurrency(
                  totals.balanceDue,
                  voucherOrder.currency,
                  language,
                )}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="min-h-11 gap-1.5 border-sky-200 bg-sky-50/60 px-3 text-sm font-medium text-sky-950 hover:border-sky-300 hover:bg-sky-50"
                onClick={() => handleSwitchView("preview")}
              >
                <Eye className="size-4 text-sky-600" />
                <span>{dictionary.previewButton}</span>
              </Button>

              <Button
                type="button"
                size="icon-lg"
                disabled={exportStatus === "exporting"}
                aria-label={dictionary.downloadButton}
                title={dictionary.downloadButton}
                className="size-11 shrink-0 bg-[#009E74] text-white shadow-xs hover:bg-[#008763]"
                onClick={handleExport}
              >
                {exportStatus === "exporting" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="min-h-11 shrink-0 gap-1.5 border-stone-300 bg-white px-4 text-sm font-medium text-stone-800"
              onClick={() => handleSwitchView("edit")}
            >
              <ArrowLeft className="size-4" />
              <span>{dictionary.backToEdit}</span>
            </Button>

            <Button
              type="button"
              size="lg"
              disabled={exportStatus === "exporting"}
              className="min-h-11 flex-1 gap-1.5 bg-[#009E74] px-4 text-sm font-semibold text-white shadow-xs hover:bg-[#008763]"
              onClick={handleExport}
            >
              {exportStatus === "exporting" ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>{dictionary.exportingButton}</span>
                </>
              ) : (
                <>
                  <Download className="size-4" />
                  <span>{dictionary.downloadButton}</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
