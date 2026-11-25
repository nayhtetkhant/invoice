# 04 Voucher Order form (react-hook-form) and New/Clear action

Status: open
Spec: .scratch/voucher-generator/spec.md
Blocked by: 03

## Goal
Build the mobile-friendly single-use Voucher Order form using `react-hook-form` and `shadcn/ui` controls, showing live totals and providing a "New / Clear Voucher" reset that keeps the saved Shop Profile intact.

## Acceptance
- [ ] Order form uses `react-hook-form` (`useFieldArray` for line items) and `shadcn/ui` inputs/selects/cards for editable voucher number & date, customer name/phone/address, dynamic items (name, qty, unit price), currency selector (`MMK`, `THB`, `USD`), flat discount, delivery fee, prepaid/deposit, and order note.
- [ ] Numeric and phone inputs use mobile-friendly `inputMode` (`decimal`/`numeric`/`tel`) and touch-sized add/remove item controls.
- [ ] Live summary displays accurate Subtotal, Grand Total, and Balance Due / COD in the chosen currency as fields change.
- [ ] Clicking "New / Clear Voucher" resets voucher number, date, customer, line items, adjustments, and notes while keeping Shop Profile `localStorage` data untouched.
- [ ] `pnpm exec tsc --noEmit`, `pnpm lint`, and `pnpm build` pass.
