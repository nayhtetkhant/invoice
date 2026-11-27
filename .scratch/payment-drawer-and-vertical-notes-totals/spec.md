# Payment-Only Sidebar & Vertical Notes/Totals Layout

## Goal
Sellers clicking the Payment button on the voucher builder currently see the full Shop Profile drawer (shop name, phones, address, logo, accent color, footer, and reset) instead of just payment methods, and on wider screens the Notes input and Totals ledger sit side-by-side instead of flowing line by line. Fixing both keeps payment setup focused and gives the voucher editor a clean, predictable vertical flow from line items through totals and notes.

## Decisions
- Payment-only drawer: Clicking the Payment Accounts & QR button (in the right sidebar rail and tablet `From` header) opens the slide-over `Sheet` showing only Payment Accounts & QR management, auto-save status, and Done.
- Full Shop Profile drawer preserved on mobile: Clicking the `Edit` button on the mobile Shop Summary bar continues to open the full Shop Profile drawer (shop name, phones, address/social, logo, accent color, default footer, payment accounts, and reset).
- Vertical editor bottom section: In the voucher order form, replace the 2-column horizontal split (`md:grid-cols-12`) with a single vertical stack (`grid-cols-1` / vertical flow) in the order: Totals ledger (line-by-line label left, amount/input right), then Order Notes, then Payment Methods toggles.

## Scope
- Update `ShopProfileForm` (and `VoucherBuilderShell` / `VoucherOrderForm` sheet triggers) to support a payment-only mode when opened from the Payment button, showing the payment accounts header/hint and payment account + QR fields only.
- Update the bottom section of `VoucherOrderForm` so Totals, Order Notes, and Payment Methods stack vertically in a single column on all viewport widths, keeping each Totals row line-by-line.
- Add/update component tests covering payment-only drawer mode vs full shop drawer mode and the vertical Notes/Totals layout.

## Out of scope
- Redesigning the `VoucherPreviewCard` receipt layout or export PNG/PDF rendering.
- Changing localStorage schema or adding new payment account fields.

## Acceptance
- [x] Clicking the Payment button (`managePaymentAccounts`) in the right sidebar or tablet `From` header opens the `Sheet` showing only Payment Accounts & QR management (no shop name, phones, address, logo, accent color, default footer, or reset controls).
- [x] Clicking `Edit` on the mobile Shop Summary bar still opens the full Shop Profile `Sheet` with all shop fields and reset.
- [x] In `VoucherOrderForm`, the Totals ledger, Order Notes input, and Payment Methods toggles stack vertically in a single column on all screen sizes (Totals first, then Order Notes, then Payment Methods), with each Totals row displayed line by line.
- [x] `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`, and `pnpm test` pass.
