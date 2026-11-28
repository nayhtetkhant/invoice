# 01 Full-width delivery address button and input

Status: done
Done in: 8da68af
Spec: .scratch/full-width-address-field/spec.md
Blocked by: none

## Goal
Place the delivery address button and textarea in a full-width row (`md:col-span-2`) below `From` and `Bill To`, with `w-full` on both controls.

## Acceptance
- [x] Delivery address container uses `md:col-span-2` below `From` and `Bill To` and before Line Items.
- [x] Collapsed `addAddress` button uses `w-full justify-start` with teal outline styling and transition.
- [x] Expanded `id="customer-address"` textarea uses `w-full` inside the full-width row.
- [x] `voucher-order-form.test.tsx` covers both collapsed and expanded full-width address rendering.
- [x] `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test`, and `pnpm build` pass.
