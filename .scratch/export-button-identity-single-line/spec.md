# Single-Line Export Format Buttons & Distinct Colored Button Identity

## Goal
In the export card, the `PNG + PDF` format button currently wraps onto two lines in the narrow sidebar, and the format, paper-size, and sidebar action buttons look flat with monochrome gray icons that obscure their button identity. Updating the layout and visual styling ensures format labels always stay on a single line and gives every export and sidebar button clear borders, semantic tints, and colored icons.

## Decisions
- Single-line format labels: Keep the 3 format buttons (`PNG`, `PDF`, `PNG + PDF`) in a 3-column grid (`grid w-full grid-cols-3 gap-1.5`) with `whitespace-nowrap`, compact text/icon sizing, and widen the desktop right sidebar rail (`272px` -> `304px`) so `PNG + PDF` and Burmese labels (`PNG ပုံ`, `PDF ဖိုင်`) never wrap or clip.
- Distinct button identity & colored icons (Export Card): Replace the flat borderless format bar with individually bordered, tinted buttons where each format has its own semantic icon & active highlight color (`PNG`: sky/blue, `PDF`: rose/red, `PNG + PDF`: violet/indigo), plus clear bordered pill buttons and colored icons for `A4` / `A5` and `Copy Image`.
- Distinct button identity & colored icons (Sidebar Actions): Give `Preview` / `Edit`, `Payment Accounts & QR`, and `New / Clear Voucher` clear button borders/hover tints and colored icons (instead of muted gray `text-stone-500`) so each action reads immediately as a clickable button.

## Scope
- Update `VoucherExportCard` format buttons (`PNG`, `PDF`, `PNG + PDF`), PDF paper size buttons (`A4`, `A5`), and `Copy Image` button with `whitespace-nowrap`, explicit borders, tinted backgrounds, and colored icons.
- Update `VoucherBuilderShell` desktop sidebar width (`304px`) and sidebar action buttons (`Preview` / `Back to Edit`, `Payment Accounts & QR`, `New / Clear Voucher`) with explicit button borders/fills and colored icons.
- Update/add component tests in `voucher-export-card.test.tsx` and `voucher-builder-shell.test.tsx`.

## Out of scope
- Changing export file generation logic (`voucher-export.ts`), paper sizes, or adding new export formats.
- Redesigning the `VoucherPreviewCard` receipt or `VoucherOrderForm` inputs.

## Acceptance
- [x] All format buttons (`PNG`, `PDF`, `PNG + PDF` / `PNG ပုံ`, `PDF ဖိုင်`, `PNG + PDF`) include `whitespace-nowrap` in a `grid w-full grid-cols-3` row so button text never wraps onto multiple lines.
- [x] Desktop right sidebar rail uses `lg:grid-cols-[minmax(0,1fr)_304px]` so `PNG + PDF` fits comfortably on one line alongside its icon.
- [x] Each export format button (`PNG`, `PDF`, `PNG + PDF`), `A4`/`A5` button, `Copy Image` button, and sidebar action button (`Preview`, `Payment Accounts & QR`, `New / Clear Voucher`) renders an explicit button border/surface and non-monochrome colored icon classes.
- [x] `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test`, and `pnpm build` pass.
