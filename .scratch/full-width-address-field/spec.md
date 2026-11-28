# Full-Width Delivery Address Button and Input

## Goal
In `VoucherOrderForm`, the "Add delivery address" button is currently shrink-wrapped inside the right-hand `Bill To` half-column, and the expanded delivery address textarea is also constrained to half of the paper width on desktop. Moving the delivery address slot to span the full paper width (`md:col-span-2`) with `w-full` on both the button and textarea gives sellers ample room for long Myanmar delivery addresses on desktop and mobile.

## Decisions
- Full paper width placement: Move the delivery address toggle/textarea block out of the right-hand `Bill To` column into a full-width (`md:col-span-2`) row directly below `From` and `Bill To` inside the top details grid (before Line Items).
- Full-width controls: Make the **Add delivery address** button `w-full justify-start` (keeping its teal outline styling and transition) and ensure the expanded `Textarea` (`id="customer-address"`) uses `w-full`.

## Scope
- Update `VoucherOrderForm` (`src/components/voucher-order-form.tsx`) to place the delivery address block in a `md:col-span-2` full-width row below `From` and `Bill To`, with `w-full` on both the `addAddress` button and `customer-address` textarea.
- Update `voucher-order-form.test.tsx` to verify full-width `md:col-span-2` / `w-full` rendering for both the `addAddress` button and the `customer-address` textarea.

## Out of scope
- Changing `From` (`paper-shop-address`) or `Bill To` name/phone columns, or modifying `VoucherPreviewCard`.

## Acceptance
- [x] In `VoucherOrderForm`, the delivery address container spans full paper width (`md:col-span-2`) below `From` and `Bill To` and above Line Items.
- [x] When collapsed, the `addAddress` button includes `w-full` while retaining its teal outline styling and transition.
- [x] When expanded, `id="customer-address"` renders with `w-full` inside the full-width container.
- [x] `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test`, and `pnpm build` pass.
