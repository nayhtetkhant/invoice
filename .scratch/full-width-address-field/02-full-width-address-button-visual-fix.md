# 02 Ensure Add delivery address button renders unmistakably full width

Status: done
Done in: 8da68af
Spec: .scratch/full-width-address-field/spec.md
Blocked by: 01

## Goal
Ensure the Add delivery address button explicitly uses block-level `flex w-full justify-center` inside a `w-full md:col-span-2` container with crisp teal border/fill so it unmistakably spans the full paper width.

## Acceptance
- [x] The `md:col-span-2` delivery address wrapper explicitly includes `w-full`.
- [x] The `addAddress` button uses `flex w-full justify-center` with `border-teal-300 bg-teal-50` so the button spans edge-to-edge visually.
- [x] `voucher-order-form.test.tsx` verifies `w-full md:col-span-2` and `flex w-full justify-center` on the `addAddress` button.
- [x] `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test`, and `pnpm build` pass.
