# Fix Adjustment Field Cancel Button Positioning & Click Jump

## Goal
In `AdjustmentFieldRow` (Discount, Delivery Fee, Deposit), `Button`'s default `active:not-aria-[haspopup]:translate-y-px` class overrode `-translate-y-1/2` on mouse press, causing the vertically centered `X` button to jump downward and miss clicks on its upper half. Moving the cancel button to the top-right corner (`-top-2 -right-2`, matching the logo remove badge) and overriding `active:translate-y-0` fixes both click reliability and corner placement.

## Decisions
- Top-right corner cancel badge: Place the `X` cancel button on Discount, Delivery Fee, and Deposit at the top-right corner of the input box (`absolute -top-2 -right-2 z-10 size-6 rounded-full border-rose-200 bg-white text-rose-600 shadow-sm`), matching the corner remove badge in `ImageUploadField`.
- Prevent `:active` pointer jump: Override `Button`'s `active:not-aria-[haspopup]:translate-y-px` on corner badges with `active:not-aria-[haspopup]:translate-y-0` (in both `AdjustmentFieldRow` and `ImageUploadField`) so pressing the button never shifts it out from under the cursor.

## Scope
- Update `AdjustmentFieldRow` in `src/components/voucher-order-form.tsx` to use `-top-2 -right-2 z-10` and `active:not-aria-[haspopup]:translate-y-0`.
- Update `ImageUploadField` in `src/components/image-upload-field.tsx` to also include `active:not-aria-[haspopup]:translate-y-0` on its corner remove button.
- Update `voucher-order-form.test.tsx` and `image-upload-field.test.tsx` to assert corner placement and no `-translate-y-1/2` jump.

## Out of scope
- Changing `Button` base variants globally across unrelated buttons.

## Acceptance
- [x] Discount, Delivery Fee, and Deposit cancel `X` buttons render at `absolute -top-2 -right-2 z-10` without `-translate-y-1/2`, and override `active:not-aria-[haspopup]:translate-y-0`.
- [x] `ImageUploadField` corner remove button also overrides `active:not-aria-[haspopup]:translate-y-0`.
- [x] `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test`, and `pnpm build` pass.
