# 01 Domain model, calculations, i18n dictionary, and test setup

Status: done
Spec: .scratch/voucher-generator/spec.md
Blocked by: none
Done in: cb800ad, 4ac6f8a

## Goal
Define the TypeScript types for Shop Profile and Voucher Order, implement pure calculation and currency formatting helpers (`MMK`, `THB`, `USD`), create the bilingual (`my`/`en`) dictionary, and configure Vitest with unit tests.

## Acceptance
- [x] TypeScript types cover `ShopProfile` (shop info, logo, payment accounts with optional QR, default footer, accent color), `VoucherOrder` (voucher number, date, customer, line items, currency, discount, delivery fee, deposit, notes), and `Language` (`my` | `en`).
- [x] Calculation helpers compute line total, `subtotal`, `grandTotal` (clamped at 0), and `balanceDue` (COD / remaining balance) accurately, and format `MMK`, `THB`, and `USD` cleanly.
- [x] Bilingual (`my` and `en`) dictionary covers all UI labels, form fields, buttons, and voucher preview headings with matching keys.
- [x] Vitest runs and passes unit tests for calculations and currency formatting, and `pnpm exec tsc --noEmit` and `pnpm lint` pass.
