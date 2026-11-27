# 01 Payment-only sidebar drawer and vertical notes/totals layout

Status: done
Done in: 48f05bb
Spec: .scratch/payment-drawer-and-vertical-notes-totals/spec.md
Blocked by: none

## Goal
Clicking the Payment button opens a payment-methods-only slide-over drawer while keeping the full Shop Profile drawer on the mobile Edit button, and the editor bottom section stacks Totals, Order Notes, and Payment Methods vertically line by line.

## Acceptance
- [x] Clicking the Payment button (`managePaymentAccounts`) in the right sidebar or tablet `From` header opens the `Sheet` showing only Payment Accounts & QR management (no shop name, phones, address, logo, accent color, default footer, or reset controls).
- [x] Clicking `Edit` on the mobile Shop Summary bar still opens the full Shop Profile `Sheet` with all shop fields and reset.
- [x] In `VoucherOrderForm`, the Totals ledger, Order Notes input, and Payment Methods toggles stack vertically in a single column on all screen sizes (Totals first, then Order Notes, then Payment Methods), with each Totals row displayed line by line.
- [x] Component tests cover payment-only drawer mode, Payment button vs mobile Edit trigger wiring, and the vertical Totals/Notes/Payment Methods order.
- [x] `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`, and `pnpm test` pass.
