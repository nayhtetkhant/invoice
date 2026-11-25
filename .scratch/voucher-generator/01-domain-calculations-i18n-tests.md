# 01 Domain model, calculations, i18n dictionary, and test setup

Status: open
Spec: .scratch/voucher-generator/spec.md
Blocked by: none

## Goal
Define the TypeScript types for Shop Profile and Voucher Order, implement pure calculation and currency formatting helpers (`MMK`, `THB`, `USD`), create the bilingual (`my`/`en`) dictionary, and configure Vitest with unit tests.

## Acceptance
- [ ] TypeScript types cover `ShopProfile` (shop info, logo, payment accounts with optional QR, default footer, accent color), `VoucherOrder` (voucher number, date, customer, line items, currency, discount, delivery fee, deposit, notes), and `Language` (`my` | `en`).
- [ ] Calculation helpers compute line total, `subtotal`, `grandTotal` (clamped at 0), and `balanceDue` (COD / remaining balance) accurately, and format `MMK`, `THB`, and `USD` cleanly.
- [ ] Bilingual (`my` and `en`) dictionary covers all UI labels, form fields, buttons, and voucher preview headings with matching keys.
- [ ] Vitest runs and passes unit tests for calculations and currency formatting, and `pnpm exec tsc --noEmit` and `pnpm lint` pass.
