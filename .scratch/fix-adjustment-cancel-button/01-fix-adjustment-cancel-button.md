# 01 Fix adjustment field cancel button corner placement and active jump

Status: done
Done in: 48f05bb
Spec: .scratch/fix-adjustment-cancel-button/spec.md
Blocked by: none

## Goal
Fix the Discount, Delivery Fee, and Deposit cancel `X` button so it sits cleanly at the top-right corner (`-top-2 -right-2 z-10`) and never shifts under `:active` press.

## Acceptance
- [x] `AdjustmentFieldRow` renders the `X` cancel button at `absolute -top-2 -right-2 z-10` with `active:not-aria-[haspopup]:translate-y-0` and no `-translate-y-1/2`.
- [x] `ImageUploadField` corner remove button also includes `active:not-aria-[haspopup]:translate-y-0`.
- [x] `voucher-order-form.test.tsx` and `image-upload-field.test.tsx` verify the fixed corner classes.
- [x] `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test`, and `pnpm build` pass.
