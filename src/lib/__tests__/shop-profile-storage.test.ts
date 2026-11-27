import { afterEach, describe, expect, it, vi } from "vitest";
import {
  SHOP_PROFILE_STORAGE_KEY,
  VOUCHER_SEQUENCE_STORAGE_KEY,
  getNextVoucherNumber,
  incrementVoucherNumber,
  loadLastVoucherNumber,
  loadShopProfile,
  resetShopProfile,
  saveLastVoucherNumber,
  saveShopProfile,
} from "@/lib/shop-profile-storage";
import { createDefaultShopProfile } from "@/lib/voucher-calculations";
import { DEFAULT_ACCENT_COLOR, type ShopProfile } from "@/types/voucher";

function createMemoryStorage(initial: Record<string, string> = {}): Storage {
  const store = new Map<string, string>(Object.entries(initial));
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
}

describe("shop-profile-storage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("handles SSR safely when window is undefined", () => {
    vi.stubGlobal("window", undefined);

    const defaults = createDefaultShopProfile();
    expect(loadShopProfile()).toEqual(defaults);
    expect(saveShopProfile(defaults)).toBe(false);
    expect(resetShopProfile()).toEqual(defaults);
  });

  it("returns default shop profile when storage key is missing", () => {
    const localStorage = createMemoryStorage();
    vi.stubGlobal("window", { localStorage });

    expect(loadShopProfile()).toEqual(createDefaultShopProfile());
  });

  it("saves and loads a complete shop profile roundtrip", () => {
    const localStorage = createMemoryStorage();
    vi.stubGlobal("window", { localStorage });

    const profile: ShopProfile = {
      shopName: "Ma Ma Lay Fashion",
      phones: "09-123456789, 09-987654321",
      addressOrSocial: "Yangon / fb.com/mamalay",
      logoDataUrl: "data:image/png;base64,abc123",
      paymentAccounts: [
        {
          id: "pay-1",
          label: "KBZPay",
          accountName: "Daw Mya Mya",
          accountNumber: "09-123456789",
          qrImageDataUrl: "data:image/png;base64,qr123",
        },
        {
          id: "pay-2",
          label: "WavePay",
          accountName: "Daw Mya Mya",
          accountNumber: "09-987654321",
        },
      ],
      defaultFooter: "Thank you for your order!",
      accentColor: "#2563eb",
    };

    expect(saveShopProfile(profile)).toBe(true);
    expect(loadShopProfile()).toEqual(profile);
  });

  it("recovers cleanly from malformed JSON and non-object JSON", () => {
    const defaults = createDefaultShopProfile();

    for (const raw of ["{bad-json", "null", "123", '"text"', "[1, 2, 3]"]) {
      const localStorage = createMemoryStorage({
        [SHOP_PROFILE_STORAGE_KEY]: raw,
      });
      vi.stubGlobal("window", { localStorage });

      expect(loadShopProfile()).toEqual(defaults);
    }
  });

  it("sanitizes partial or corrupted fields while preserving valid data", () => {
    const localStorage = createMemoryStorage({
      [SHOP_PROFILE_STORAGE_KEY]: JSON.stringify({
        shopName: "Valid Shop",
        phones: 912345678,
        logoDataUrl: "",
        accentColor: "not-a-hex",
        paymentAccounts: [
          null,
          "bad-entry",
          {
            id: "",
            label: "KBZPay",
            accountName: "Su Su",
            accountNumber: 12345,
            qrImageDataUrl: "",
          },
        ],
      }),
    });
    vi.stubGlobal("window", { localStorage });

    const loaded = loadShopProfile();
    expect(loaded.shopName).toBe("Valid Shop");
    expect(loaded.phones).toBe("");
    expect(loaded.addressOrSocial).toBe("");
    expect(loaded.logoDataUrl).toBeUndefined();
    expect(loaded.defaultFooter).toBe("");
    expect(loaded.accentColor).toBe(DEFAULT_ACCENT_COLOR);
    expect(loaded.paymentAccounts).toHaveLength(1);
    expect(loaded.paymentAccounts[0]).toMatchObject({
      label: "KBZPay",
      accountName: "Su Su",
      accountNumber: "",
      qrImageDataUrl: undefined,
    });
    expect(loaded.paymentAccounts[0]?.id).toBeTruthy();
  });

  it("clears stored profile on resetShopProfile and returns defaults", () => {
    const localStorage = createMemoryStorage();
    vi.stubGlobal("window", { localStorage });

    const profile: ShopProfile = {
      ...createDefaultShopProfile(),
      shopName: "Yangon Store",
      accentColor: "#7c3aed",
    };
    saveShopProfile(profile);
    expect(localStorage.getItem(SHOP_PROFILE_STORAGE_KEY)).not.toBeNull();

    const reset = resetShopProfile();
    expect(reset).toEqual(createDefaultShopProfile());
    expect(localStorage.getItem(SHOP_PROFILE_STORAGE_KEY)).toBeNull();
    expect(loadShopProfile()).toEqual(createDefaultShopProfile());
  });

  it("does not throw when localStorage methods throw errors", () => {
    const brokenStorage: Storage = {
      length: 0,
      clear: () => {
        throw new Error("SecurityError");
      },
      getItem: () => {
        throw new Error("SecurityError");
      },
      key: () => null,
      removeItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    };
    vi.stubGlobal("window", { localStorage: brokenStorage });

    const defaults = createDefaultShopProfile();
    expect(loadShopProfile()).toEqual(defaults);
    expect(saveShopProfile(defaults)).toBe(false);
    expect(resetShopProfile()).toEqual(defaults);
  });

  it("increments and persists voucher numbers across localStorage sessions", () => {
    expect(incrementVoucherNumber(undefined)).toBe("V-001");
    expect(incrementVoucherNumber("")).toBe("V-001");
    expect(incrementVoucherNumber("V-001")).toBe("V-002");
    expect(incrementVoucherNumber("V-009")).toBe("V-010");
    expect(incrementVoucherNumber("INV-2026-099")).toBe("INV-2026-100");
    expect(incrementVoucherNumber("42")).toBe("43");

    const localStorage = createMemoryStorage();
    vi.stubGlobal("window", { localStorage });

    expect(loadLastVoucherNumber()).toBe("");
    expect(getNextVoucherNumber()).toBe("V-001");

    expect(saveLastVoucherNumber("V-007")).toBe(true);
    expect(localStorage.getItem(VOUCHER_SEQUENCE_STORAGE_KEY)).toBe("V-007");
    expect(loadLastVoucherNumber()).toBe("V-007");
    expect(getNextVoucherNumber()).toBe("V-008");
  });
});
