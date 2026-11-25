# 05 Live Voucher Preview card

Status: open
Spec: .scratch/voucher-generator/spec.md
Blocked by: 04

## Goal
Render the clean, Messenger/Viber-friendly live voucher preview component using `shadcn/ui` `Card`/`Badge` styling and the seller's chosen accent color, reflecting both Shop Profile and Voucher Order state in Burmese or English.

## Acceptance
- [ ] Voucher preview displays shop logo, shop name, phone(s), address/social link, voucher number & date, customer name/phone/address, itemized table (item, qty, price, line total), subtotal/discount/delivery/total/deposit/COD balance, payment methods with QR images, and footer/order notes.
- [ ] Voucher preview uses the selected accent color cleanly, switches all labels between Burmese and English with the language toggle, and wraps long Myanmar/English text without horizontal overflow or clipping.
- [ ] Preview container exposes a stable DOM ref/dimensions ready for client-side PNG and PDF capture.
- [ ] `pnpm exec tsc --noEmit`, `pnpm lint`, and `pnpm build` pass.
