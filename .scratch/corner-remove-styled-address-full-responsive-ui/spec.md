# Corner Image Remove Badge, Styled Add Address Button & Full-Screen-Faithful Responsive UI

## Goal
Uploaded logos and QR images currently place their remove button beside the preview box, the "Add delivery address" trigger looks like plain gray text instead of a button, and smaller viewports hide key parts of the desktop layout (logo upload, From section, Order Notes, and the sidebar controls). Fixing all three aligns the responsive view closely with the full-screen desktop UI while keeping every control clear and touch-friendly.

## Decisions
- Corner remove button on image boxes: In `ImageUploadField` (used for both Shop Logo and Payment QR), render a compact circular remove icon button (`X`, `aria-label={removeLabel}`) anchored at the top-right corner (`-top-2 -right-2`) of the `size-20` preview box instead of a separate button beside it.
- Styled Add Address button: Style `addAddress` as an explicit `outline` button with teal/emerald border and soft tint, colored `MapPin` icon, and smooth hover/active transition (`transition-all duration-150 active:scale-[0.98]`).
- Full-screen-faithful responsive layout: Keep the full-screen paper sections visible across all viewport sizes — show the Logo upload + Heading/#/Date header, From (Shop) + Bill To (Customer), and Order Notes directly on the paper on mobile/tablet (removing the collapsed mobile Shop Summary bar and `Add note` toggle), and render the Export & Controls sidebar below the paper on `< lg` screens (with Download CTA visible in the sidebar too) so mobile/tablet mirrors the desktop UI while wrapping cleanly without horizontal overflow.

## Scope
- Update `ImageUploadField` (`src/components/image-upload-field.tsx`) to position the remove button at the top-right corner of the image preview box.
- Update `VoucherOrderForm` (`src/components/voucher-order-form.tsx`) to style `addAddress` with explicit button border/color/transition, remove the mobile-only collapsed Shop Summary bar and `addNote` collapse so Logo, From, and Order Notes stay visible directly on all screen sizes, and keep narrow grids wrapping cleanly.
- Update `VoucherBuilderShell` (`src/components/voucher-builder-shell.tsx`) and `VoucherExportCard` (`src/components/voucher-export-card.tsx`) so the Export & Controls sidebar renders cleanly below the paper on `< lg` screens (including the Download button and Preview toggle), matching the full-screen desktop UI.
- Update/add component tests in `image-upload-field.test.tsx`, `voucher-order-form.test.tsx`, and `voucher-builder-shell.test.tsx`.

## Out of scope
- Changing `VoucherPreviewCard` receipt layout or PNG/PDF export rendering.
- Changing `localStorage` persistence or payment account data model.

## Acceptance
- [x] In `ImageUploadField`, when an image value is present, the remove button (`aria-label={removeLabel}`) is positioned at the top-right corner of the preview box (`absolute -top-2 -right-2`) with no side-by-side text button.
- [x] In `VoucherOrderForm`, the `addAddress` button renders with `outline` border, colored tint/icon, and transition classes.
- [x] On all viewport sizes, `VoucherOrderForm` renders the Logo upload, From (Shop) inputs, Bill To inputs, Line Items, Totals ledger, Order Notes textarea, and Payment Methods directly on the paper (no collapsed mobile Shop Summary bar or `addNote` toggle).
- [x] `VoucherBuilderShell` renders the Export & Controls sidebar (`data-sidebar-rail="true"`) visibly in both Edit and Preview modes across mobile/tablet (`< lg` stacked below paper) and desktop (`lg+` right rail).
- [x] `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test`, and `pnpm build` pass.
