"use client";

import * as React from "react";
import {
  ArrowLeft,
  Download,
  Eye,
  FileText,
  Loader2,
} from "lucide-react";
import { ShopProfileForm } from "@/components/shop-profile-form";
import {
  VoucherExportCard,
  type ExportStatus,
} from "@/components/voucher-export-card";
import { VoucherOrderForm } from "@/components/voucher-order-form";
import { VoucherPreviewCard } from "@/components/voucher-preview-card";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n";
import { loadShopProfile } from "@/lib/shop-profile-storage";
import {
  calculateVoucherTotals,
  createDefaultShopProfile,
  createDefaultVoucherOrder,
  formatCurrency,
} from "@/lib/voucher-calculations";
import { exportVoucher } from "@/lib/voucher-export";
import {
  DEFAULT_ACCENT_COLOR,
  type ExportFormat,
  type Language,
  type PdfPaperSize,
  type ShopProfile,
  type VoucherOrder,
} from "@/types/voucher";

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
  const [exportFormat, setExportFormat] = React.useState<ExportFormat>("png");
  const [paperSize, setPaperSize] = React.useState<PdfPaperSize>("a4");
  const [exportStatus, setExportStatus] = React.useState<ExportStatus>("idle");
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
    () => (isHydrated ? createDefaultVoucherOrder() : SSR_INITIAL_ORDER),
    [isHydrated],
  );

  const shopProfile = editedProfile ?? initialProfile;
  const voucherOrder = editedOrder ?? initialOrder;
  const dictionary = getDictionary(language);
  const safeAccent = shopProfile.accentColor.trim() || DEFAULT_ACCENT_COLOR;
  const totals = calculateVoucherTotals(voucherOrder);

  React.useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const handleProfileChange = React.useCallback((nextProfile: ShopProfile) => {
    setEditedProfile(nextProfile);
  }, []);

  const handleOrderChange = React.useCallback((nextOrder: VoucherOrder) => {
    setEditedOrder(nextOrder);
  }, []);

  function handleSwitchView(nextTab: MobileTab) {
    setActiveTab(nextTab);
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
      setExportStatus("success");
    } catch {
      setExportStatus("error");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8 lg:py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white shadow-xs"
              style={{ backgroundColor: safeAccent }}
            >
              <FileText className="size-4" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold leading-tight tracking-tight text-slate-900 sm:text-base">
                {dictionary.appTitle}
              </h1>
              <p className="hidden truncate text-[11px] text-slate-500 sm:block">
                {dictionary.appSubtitle}
              </p>
            </div>
          </div>

          <div
            className="inline-flex shrink-0 items-center rounded-lg border border-slate-200 bg-slate-100/80 p-0.5"
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

      <main className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 lg:grid-cols-12">
        <section
          data-editor-pane="true"
          aria-label={dictionary.tabEdit}
          className={`space-y-5 bg-white px-4 py-4 pb-28 sm:space-y-6 sm:px-6 lg:col-span-7 lg:border-r lg:border-slate-200/80 lg:px-8 lg:py-7 lg:pb-10 ${
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
            accentColor={safeAccent}
            order={voucherOrder}
            onOrderChange={handleOrderChange}
          />
        </section>

        <aside
          data-document-stage="true"
          aria-label={dictionary.tabPreviewExport}
          className={`bg-[#F6F9FC] px-4 py-4 pb-28 sm:px-6 lg:col-span-5 lg:px-7 lg:py-7 lg:pb-10 ${
            activeTab === "preview" ? "block" : "hidden lg:block"
          }`}
        >
          <div className="flex flex-col gap-4 lg:sticky lg:top-[68px]">
            <div className="order-2 lg:order-1">
              <VoucherExportCard
                dictionary={dictionary}
                accentColor={safeAccent}
                order={voucherOrder}
                previewRef={voucherPreviewRef}
                format={exportFormat}
                paperSize={paperSize}
                status={exportStatus}
                onFormatChange={(nextFormat) => {
                  setExportFormat(nextFormat);
                  setExportStatus("idle");
                }}
                onPaperSizeChange={(nextPaperSize) => {
                  setPaperSize(nextPaperSize);
                  setExportStatus("idle");
                }}
                onExport={handleExport}
              />
            </div>

            <div className="order-1 lg:order-2">
              <VoucherPreviewCard
                dictionary={dictionary}
                language={language}
                shopProfile={shopProfile}
                order={voucherOrder}
                previewRef={voucherPreviewRef}
              />
            </div>
          </div>
        </aside>
      </main>

      <div
        data-mobile-summary-bar="true"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgba(15,23,42,0.12)] backdrop-blur-sm lg:hidden"
      >
        {activeTab === "edit" ? (
          <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium text-slate-500">
                {dictionary.balanceDueCod}
              </p>
              <p className="truncate text-base font-bold tabular-nums text-slate-900">
                {formatCurrency(
                  totals.balanceDue,
                  voucherOrder.currency,
                  language,
                )}
              </p>
            </div>

            <Button
              type="button"
              size="lg"
              className="min-h-11 shrink-0 gap-1.5 px-4 text-sm font-semibold text-white shadow-xs"
              style={{ backgroundColor: safeAccent }}
              onClick={() => handleSwitchView("preview")}
            >
              <Eye className="size-4" />
              <span>{dictionary.previewButton}</span>
            </Button>
          </div>
        ) : (
          <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="min-h-11 shrink-0 gap-1.5 px-4 text-sm font-medium"
              onClick={() => handleSwitchView("edit")}
            >
              <ArrowLeft className="size-4" />
              <span>{dictionary.backToEdit}</span>
            </Button>

            <Button
              type="button"
              size="lg"
              disabled={exportStatus === "exporting"}
              className="min-h-11 flex-1 gap-1.5 px-4 text-sm font-semibold text-white shadow-xs"
              style={{ backgroundColor: safeAccent }}
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
