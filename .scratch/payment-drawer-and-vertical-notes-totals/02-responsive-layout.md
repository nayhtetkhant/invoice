# 02 Responsive layout across mobile, tablet, and desktop

Status: done
Done in: 48f05bb
Spec: .scratch/payment-drawer-and-vertical-notes-totals/spec.md
Blocked by: 01

## Goal
Ensure the voucher editor, line items table, totals ledger, export controls, preview header, and payment drawer access work cleanly across narrow phones (`320px+`), tablets (`md`), and desktops (`lg+`) without horizontal overflow, squished inputs, or hidden payment access on mobile.

## Acceptance
- [x] On narrow phones (`< sm`), Voucher # / Date and Customer Name / Phone stack cleanly (`grid-cols-1 sm:grid-cols-2`), and mobile line-item rows give Unit Price and Line Total room without horizontal crowding.
- [x] The 5-column desktop line-items table switches at `md:` (`768px+`) instead of `sm:` (`640px`), avoiding a cramped item name column on small tablets.
- [x] Totals header and adjustment rows wrap cleanly (`flex-wrap`) with non-shrinking numeric inputs on narrow screens.
- [x] Mobile and tablet users can open the payment-only drawer directly from the editor's Payment Methods section (`onOpenPaymentSettings`), not only from the desktop sidebar or Preview mode.
- [x] `VoucherExportCard` format selector buttons and `VoucherPreviewCard` header adapt cleanly on narrow screens (`320px+`).
- [x] `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test`, and `pnpm build` pass.
