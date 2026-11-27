# Full-Width Stacked Adjustment Fields with Right-Corner Cancel Button

## Goal
In the Totals ledger of `VoucherOrderForm`, clicking Discount, Delivery Fee, or Deposit currently opens a narrow right-aligned input beside the label with the cancel `X` button sitting to the left of the box. Stacking the label above a full-width input box with the cancel `X` button anchored inside the right edge of the box makes each adjustment field cleaner, easier to tap on mobile, and consistent across all three rows.

## Decisions
- Stacked full-width layout: When Discount, Delivery Fee, or Deposit is opened, render its label above a full-width (`w-full`) numeric input box.
- Right-edge cancel button: Anchor the `X` cancel button inside the right edge of the input box (`absolute top-1/2 right-1.5 -translate-y-1/2`) with `pr-9` on the input so typed values never overlap it.
- Input alignment: Left-align (`text-left`) numbers inside the full-width adjustment boxes so values read naturally under the top label.
- Shared field helper: Parameterize the three adjustment rows (Discount, Delivery Fee, Deposit) through one shared helper/component to avoid duplicating identical markup.

## Scope
- Update `VoucherOrderForm` (`src/components/voucher-order-form.tsx`) so Discount, Delivery Fee, and Deposit use a shared full-width stacked field layout (label on top, full-width `NumericTextInput` with `pr-9 text-left`, and right-anchored `X` clear button).
- Update `voucher-order-form.test.tsx` to verify label-above-input order, full-width `w-full` input, and right-edge `X` button placement.

## Out of scope
- Changing `Subtotal`, `Grand Total`, or `Balance Due / COD` display rows, calculation rules, or `VoucherPreviewCard`.

## Acceptance
- [x] Opening Discount, Delivery Fee, or Deposit renders the label above a full-width (`w-full`) input (`id="order-discount"`, `id="order-delivery-fee"`, `id="order-deposit"`) with `pr-9` and `text-left`.
- [x] Each opened adjustment box places its `X` cancel button (`aria-label={label}`) inside the right side of the box (`absolute top-1/2 right-1.5 -translate-y-1/2`).
- [x] `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test`, and `pnpm build` pass.
