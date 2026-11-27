import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ShopProfileForm } from "@/components/shop-profile-form";
import { getDictionary } from "@/lib/i18n";
import { createDefaultShopProfile } from "@/lib/voucher-calculations";
import type { ShopProfile } from "@/types/voucher";

vi.mock("@base-ui/react/dialog", () => {
  const OpenContext = React.createContext(false);

  const Root = ({
    open = false,
    children,
  }: {
    open?: boolean;
    children?: React.ReactNode;
  }) => <OpenContext.Provider value={open}>{children}</OpenContext.Provider>;

  const Portal = ({ children }: { children?: React.ReactNode }) => {
    const open = React.useContext(OpenContext);
    return open ? <>{children}</> : null;
  };

  const Trigger = ({
    render,
    children,
    ...props
  }: {
    render?: React.ReactElement<Record<string, unknown>>;
    children?: React.ReactNode;
  } & Record<string, unknown>) =>
    render ? (
      React.cloneElement(render, props, children)
    ) : (
      <button {...props}>{children}</button>
    );

  const Close = Trigger;

  const Popup = ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
  } & Record<string, unknown>) => <div {...props}>{children}</div>;

  const Backdrop = (props: Record<string, unknown>) => <div {...props} />;
  const Title = ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
  } & Record<string, unknown>) => <h2 {...props}>{children}</h2>;
  const Description = ({
    children,
    ...props
  }: {
    children?: React.ReactNode;
  } & Record<string, unknown>) => <p {...props}>{children}</p>;

  return {
    Dialog: {
      Root,
      Portal,
      Trigger,
      Close,
      Popup,
      Backdrop,
      Title,
      Description,
    },
  };
});

describe("ShopProfileForm", () => {
  it("renders a compact shop identity strip instead of inline expanded settings", () => {
    const enDict = getDictionary("en");
    const profile: ShopProfile = {
      ...createDefaultShopProfile(),
      shopName: "Yangon Silk House",
      phones: "09-123456789",
      paymentAccounts: [
        {
          id: "pay-1",
          label: "KBZPay",
          accountName: "Daw Mya",
          accountNumber: "09-123456789",
        },
      ],
    };

    const html = renderToStaticMarkup(
      <ShopProfileForm
        dictionary={enDict}
        profile={profile}
        isHydrated={true}
        onProfileChange={() => {}}
      />,
    );

    expect(html).toContain('data-shop-strip="true"');
    expect(html).toMatch(/<button[^>]*data-shop-strip="true"[^>]*>/);
    expect(html).toContain("Yangon Silk House");
    expect(html).toContain("09-123456789");
    expect(html).toContain(enDict.editShopProfile);
    // Uses shop monogram instead of generic Store icon when no logo is set
    expect(html).toContain('data-shop-monogram="true"');
    expect(html).toContain(">Y<");
    expect(html).not.toContain("border-dashed");
    // Heavy profile inputs live inside the slide-over Sheet when closed, keeping the main invoice canvas focused.
    expect(html).not.toContain('id="shop-address-social"');
  });

  it("renders tap-to-upload image tiles, empty payment hint, Done CTA, and checkmark on custom color swatch", () => {
    const enDict = getDictionary("en");
    const customProfile: ShopProfile = {
      ...createDefaultShopProfile(),
      accentColor: "#123456",
    };
    const html = renderToStaticMarkup(
      <ShopProfileForm
        dictionary={enDict}
        profile={customProfile}
        isHydrated={true}
        defaultOpen={true}
        onProfileChange={() => {}}
      />,
    );

    expect(html).toContain('data-upload-tile="true"');
    // Native color input is visually hidden inside the styled custom swatch trigger
    expect(html).toMatch(/<input[^>]*id="shop-accent-custom"[^>]*class="[^"]*sr-only/);
    // Custom color selection shows an explicit check icon inside the custom swatch
    expect(html).toContain('data-custom-color-check="true"');
    // Unconfigured shop profile renders Store icon instead of hardcoded "S" fallback
    expect(html).toContain("lucide-store");
    expect(html).not.toContain(">S<");
    // Empty payment accounts shows helpful hint, and Default Footer is grouped before Payment Accounts
    expect(html).toContain(enDict.paymentAccountsHint);
    expect(html.indexOf('id="shop-default-footer"')).toBeLessThan(
      html.indexOf(enDict.paymentAccounts),
    );
    expect(enDict.collapseShopProfile).toBe("Done");
  });

  it("renders the shop detail sidebar full width on mobile view and max-w-lg on larger screens", () => {
    const enDict = getDictionary("en");
    const html = renderToStaticMarkup(
      <ShopProfileForm
        dictionary={enDict}
        profile={createDefaultShopProfile()}
        isHydrated={true}
        defaultOpen={true}
        onProfileChange={() => {}}
      />,
    );

    const sheetMatch = html.match(/<div[^>]*data-slot="sheet-content"[^>]*>/);
    expect(sheetMatch).not.toBeNull();

    const sheetTag = sheetMatch?.[0] ?? "";
    expect(sheetTag).toContain("data-[side=right]:w-full");
    expect(sheetTag).toContain("data-[side=right]:sm:max-w-lg");
    expect(sheetTag).not.toContain("data-[side=right]:w-3/4");
    expect(sheetTag).not.toContain("data-[side=right]:sm:max-w-sm");
    expect(html).toContain('id="shop-address-social"');
  });

  it("renders only payment accounts management when section is payment", () => {
    const enDict = getDictionary("en");
    const profile: ShopProfile = {
      ...createDefaultShopProfile(),
      shopName: "Yangon Silk House",
      phones: "09-123456789",
      paymentAccounts: [
        {
          id: "pay-1",
          label: "KBZPay",
          accountName: "Daw Mya",
          accountNumber: "09-123456789",
        },
      ],
    };

    const html = renderToStaticMarkup(
      <ShopProfileForm
        dictionary={enDict}
        profile={profile}
        isHydrated={true}
        defaultOpen={true}
        hideTrigger
        section="payment"
        onProfileChange={() => {}}
      />,
    );

    expect(html).toContain(enDict.paymentAccounts);
    expect(html).toContain(enDict.addPaymentAccount);
    expect(html).toContain('id="payment-label-0"');
    expect(html).toContain('id="payment-account-name-0"');
    expect(html).toContain('id="payment-account-number-0"');
    expect(html).toContain('id="payment-qr-upload-0"');
    expect(html).toContain(enDict.collapseShopProfile);

    // Shop info, logo, accent color, default footer, and reset are excluded in payment-only mode
    expect(html).not.toContain('id="shop-name"');
    expect(html).not.toContain('id="shop-phones"');
    expect(html).not.toContain('id="shop-address-social"');
    expect(html).not.toContain('id="shop-logo-upload"');
    expect(html).not.toContain('id="shop-accent-custom"');
    expect(html).not.toContain('id="shop-default-footer"');
    expect(html).not.toContain(enDict.resetShopProfile);
  });
});
