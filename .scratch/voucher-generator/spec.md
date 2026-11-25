# Single-Use Social Commerce Voucher Generator

## Goal
Myanmar local online sellers (Facebook, Messenger, Viber, TikTok) need to send clean, accurate order vouchers to buyers directly from their phones without creating accounts or managing an invoicing system. This app lets a seller set up their shop profile once in the browser, fill in an order on a mobile-first screen, and export a shareable PNG image and/or PDF voucher in seconds.

## Decisions
- Mobile-first web UX: Primary workflow optimized for mobile phones (touch-friendly inputs, numeric keypads, `Edit` / `Preview & Export` flow, and collapsible Shop Profile), scaling cleanly to desktop.
- Bilingual UI & voucher: Burmese and English language toggle (Burmese default).
- Layout & customization: One clean, Messenger/Viber-friendly voucher layout with a simple accent color picker; scales centered onto A4/A5 for PDF.
- Currency: `MMK` (`Ks` / `ကျပ်`) default with a currency selector supporting `MMK`, `THB`, and `USD`.
- Shop profile persistence: Auto-saves shop details (name, phones, address/social link, logo, multiple payment methods with optional QR images, default footer note) in `localStorage`, with a Reset option.
- Single-use order flow: Per-voucher details (voucher #, date, customer info, items, discount, delivery fee, deposit/COD balance, notes) are never saved; a "New / Clear Voucher" action resets only the current order.
- Client-side export: DOM-capture export supporting PNG only, PDF only, or both, selectable by the user.
- UI & forms stack: Use `shadcn/ui` components wherever applicable and `react-hook-form` for Shop Profile and Voucher Order forms.

## Scope
- Responsive mobile-first voucher builder (`Edit` and `Preview & Export` views on mobile; side-by-side on desktop) with Burmese/English toggle and Myanmar Unicode font rendering.
- Reusable Shop Profile editor (logo upload, contact info, multiple payment accounts with optional QR images, default footer, accent color) backed by `localStorage` with auto-save and reset.
- Single-use Voucher Order form with editable voucher number/date, customer details, dynamic line items (name, qty, unit price), currency selector (`MMK`, `THB`, `USD`), flat discount, delivery fee, prepaid/deposit amount, live subtotal/total/COD balance calculation, and order notes.
- Client-side DOM capture to download the rendered voucher as PNG only, PDF only, or both.

## Out of scope
- User accounts, login, or backend database storage.
- Invoice history, saved past orders, or draft persistence for customer orders.
- Multiple voucher layout templates or tax/VAT rule engines.

## Acceptance
- [ ] On mobile and desktop viewports, a seller can toggle between Burmese and English and see both UI labels and the voucher preview update cleanly with proper Myanmar Unicode rendering.
- [ ] Shop profile edits (logo, shop info, payment accounts/QR, footer, accent color) persist across page reloads via `localStorage` and clear cleanly on Reset.
- [ ] Adding/removing line items and editing qty, unit price, discount, delivery fee, and deposit updates Subtotal, Grand Total, and Balance Due / COD accurately in the selected currency (`MMK`, `THB`, or `USD`).
- [ ] Clicking "New / Clear Voucher" clears customer, items, and order totals while keeping the saved Shop Profile intact.
- [ ] Selecting PNG only, PDF only, or Both downloads valid, readable voucher file(s) with no clipped text or broken images/Myanmar glyphs.
- [ ] `pnpm exec tsc --noEmit`, `pnpm lint`, and `pnpm build` pass.
