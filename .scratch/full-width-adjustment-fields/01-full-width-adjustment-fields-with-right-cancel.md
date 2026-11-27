# 01 Full-width stacked adjustment fields with right-edge cancel button

Status: done
Done in: 48f05bb
Spec: .scratch/full-width-adjustment-fields/spec.md
Blocked by: none

## Goal
Render Discount, Delivery Fee, and Deposit as full-width stacked inputs with the label above the box and the cancel `X` button inside the right edge of the box.

## Acceptance
- [x] `VoucherOrderForm` uses a shared `AdjustmentFieldRow` helper for Discount, Delivery Fee, and Deposit.
- [x] When opened, each adjustment field renders its label above a `w-full` `NumericTextInput` (`pr-9 text-left`) with the `X` cancel button (`aria-label={label}`) positioned at `absolute top-1/2 right-1.5 -translate-y-1/2`.
- [x] `voucher-order-form.test.tsx` verifies label-above-input order, `w-full` / `pr-9` / `text-left` input classes, and right-edge `X` button placement.
- [x] `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test`, and `pnpm build` pass.
