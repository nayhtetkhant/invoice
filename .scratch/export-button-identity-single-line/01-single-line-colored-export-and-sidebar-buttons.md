# 01 Single-line export buttons with distinct colored button identity

Status: done
Done in: 48f05bb
Spec: .scratch/export-button-identity-single-line/spec.md
Blocked by: none

## Goal
Keep all export format button labels (`PNG`, `PDF`, `PNG + PDF`) on a single line at all times, widen the desktop sidebar to 304px, and give export and sidebar action buttons clear borders, semantic tints, and colored icons.

## Acceptance
- [x] `VoucherExportCard` format buttons (`PNG`, `PDF`, `PNG + PDF`) stay in `grid w-full grid-cols-3 gap-1.5`, include `whitespace-nowrap`, have explicit borders/surface fills, and use distinct colored icons (`sky`/`rose`/`violet`).
- [x] `VoucherExportCard` paper size buttons (`A4`, `A5`) and `Copy Image` button use explicit bordered button styles and colored icons.
- [x] `VoucherBuilderShell` widens the desktop sidebar rail to `lg:grid-cols-[minmax(0,1fr)_304px]` and gives `Preview`, `Payment Accounts & QR`, and `New / Clear Voucher` explicit borders/tints and colored icons.
- [x] Component tests in `voucher-export-card.test.tsx` and `voucher-builder-shell.test.tsx` verify single-line labels, sidebar width, explicit borders, and colored icons.
- [x] `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test`, and `pnpm build` pass.
