# 02 Shop profile localStorage store and image helper

Status: open
Spec: .scratch/voucher-generator/spec.md
Blocked by: 01

## Goal
Implement safe `localStorage` persistence (load, save, reset, schema-safe fallback) for the seller's reusable `ShopProfile` and a client-side image resizing/data-URL helper for shop logos and payment QR images.

## Acceptance
- [ ] `loadShopProfile`, `saveShopProfile`, and `resetShopProfile` handle missing keys, malformed JSON, and SSR (`typeof window === "undefined"`) without throwing, returning sensible defaults.
- [ ] Client-side image helper validates image files and resizes/compresses them into bounded data URLs suitable for `localStorage` and DOM capture.
- [ ] Unit tests verify `localStorage` load/save/reset/corrupt-JSON recovery and image helper constraints.
- [ ] `pnpm exec tsc --noEmit`, `pnpm lint`, and unit tests pass.
