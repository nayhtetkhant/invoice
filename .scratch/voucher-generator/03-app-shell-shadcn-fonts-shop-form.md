# 03 Mobile-first app shell, shadcn/ui setup, Myanmar fonts, and Shop Profile form

Status: open
Spec: .scratch/voucher-generator/spec.md
Blocked by: 02

## Goal
Initialize `shadcn/ui` primitives and `react-hook-form`, load `Noto Sans Myanmar` alongside Latin fonts, build the mobile-first `Edit` / `Preview & Export` `Tabs` shell with `MY`/`EN` toggle, and implement the collapsible/drawer Shop Profile form auto-saving to `localStorage`.

## Acceptance
- [ ] `shadcn/ui` (`components.json` and primitives such as `Button`, `Input`, `Label`, `Textarea`, `Select`, `Tabs`, `Card`, `Badge`, `Sheet`/`Collapsible`) and `react-hook-form` are installed and configured.
- [ ] Root layout loads `Noto Sans Myanmar` and updates UI copy immediately when toggling between Burmese (`my`, default) and English (`en`).
- [ ] Mobile viewport shows touch-friendly `Edit` and `Preview & Export` `Tabs`; desktop viewport displays editor and preview side by side.
- [ ] Shop Profile form uses `react-hook-form` (including `useFieldArray` for multiple payment accounts with optional QR image upload, logo upload, accent color picker, and default footer), auto-saves changes to `localStorage`, and clears them on Reset.
- [ ] `pnpm exec tsc --noEmit`, `pnpm lint`, and `pnpm build` pass.
