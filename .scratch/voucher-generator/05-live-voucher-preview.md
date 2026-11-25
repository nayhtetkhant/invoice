# 05 Live Voucher Preview card

Status: done
Spec: .scratch/voucher-generator/spec.md
Blocked by: 04
Done in: 43a137a

## Goal
Render the clean, Messenger/Viber-friendly live voucher preview component using `shadcn/ui` `Card`/`Badge` styling and the seller's chosen accent color, reflecting both Shop Profile and Voucher Order state in Burmese or English.

## Acceptance
- [x] Voucher preview displays shop logo, shop name, phone(s), address/social link, voucher number & date, customer name/phone/address, itemized table (item, qty, price, line total), subtotal/discount/delivery/total/deposit/COD balance, payment methods with QR images, and footer/order notes.
- [x] Voucher preview uses the selected accent color cleanly, switches all labels between Burmese and English with the language toggle, and wraps long Myanmar/English text without horizontal overflow or clipping.
- [x] Preview container exposes a stable DOM ref/dimensions ready for client-side PNG and PDF capture.
- [x] `pnpm exec tsc --noEmit`, `pnpm lint`, and `pnpm build` pass.
