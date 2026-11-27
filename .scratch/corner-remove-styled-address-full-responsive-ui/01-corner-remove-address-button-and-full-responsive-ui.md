# 01 Corner remove badge, styled Add address button, and full-screen-faithful responsive UI

Status: done
Done in: 48f05bb
Spec: .scratch/corner-remove-styled-address-full-responsive-ui/spec.md
Blocked by: none

## Goal
Anchor the image remove button to the top-right corner of uploaded logo/QR preview boxes, style the Add delivery address trigger as a clear colored button with transition, and keep the full-screen paper & controls layout visible across mobile, tablet, and desktop viewports.

## Acceptance
- [x] `ImageUploadField` places a compact circular remove icon button (`X`, `aria-label={removeLabel}`) at `-top-2 -right-2` on the `size-20` preview box instead of a side-by-side text button.
- [x] `VoucherOrderForm` renders `addAddress` with `variant="outline"`, explicit colored border/tint, colored `MapPin` icon, and transition classes.
- [x] `VoucherOrderForm` renders Logo upload, From (Shop) inputs, Bill To inputs, and Order Notes textarea directly on all screen sizes (no collapsed mobile Shop Summary bar or `addNote` toggle).
- [x] `VoucherBuilderShell` keeps the Export & Controls sidebar (`data-sidebar-rail="true"`) visible below the paper on `< lg` in Edit mode (and shows Download/Preview/Currency/Accent/Payment/New controls) so responsive view mirrors full-screen desktop.
- [x] Tests in `image-upload-field.test.tsx`, `voucher-order-form.test.tsx`, and `voucher-builder-shell.test.tsx` cover these behaviors.
- [x] `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test`, and `pnpm build` pass.
