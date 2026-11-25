# 06 Client-side PNG and PDF voucher export

Status: open
Spec: .scratch/voucher-generator/spec.md
Blocked by: 05

## Goal
Implement client-side DOM capture export with a `shadcn/ui` format selector (`PNG only`, `PDF only`, or `Both`), downloading crisp, properly rendered Myanmar-script voucher files on mobile and desktop browsers.

## Acceptance
- [ ] User can select export mode (`PNG only`, `PDF only`, or `Both`) and trigger download from the `Preview & Export` view with loading and error feedback.
- [ ] PNG export captures the voucher DOM cleanly at high resolution for Messenger/Viber sharing, with no clipped text, missing images, or broken Myanmar Unicode glyphs.
- [ ] PDF export embeds the captured voucher centered on an A4 or A5 page without distortion or cut-off content.
- [x] `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`, and all unit tests pass.
