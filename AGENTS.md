# invoice

Next.js 16 TypeScript web application.

## Rules

Rules live in `.ai/rules/`, one topic per file. Each file starts with an `Applies to:` line. At the start of every task, read every rule file whose topic touches the task. When unsure whether a file applies, read it.

- `autonomy.md`: what you may do without asking, safety rules that always apply, `.env` files, disagreeing with the user, subagents.
- `engineering.md`: domain thinking, resource use, how much to build, comments, packages, library docs, generators, server-side validation.
- `verification.md`: reporting checks honestly, tests, visual checks, real side effects.
- `git.md`: branches, secrets, staging, commits, commit messages, worktrees.
- `docs.md`: keeping docs true, recording decisions and generated files.

## Checks

These must pass before a commit:

- `pnpm exec tsc --noEmit`
- `pnpm lint`
- `pnpm build`

## Planner

Tickets and backlog live in: local files in .scratch/. Planner skills: `ryan-plan` (plan a feature), `ryan-do` (implement a ticket, or the next one), `ryan-remember` (park an idea), `ryan-status` (open tickets, the next one, and the backlog), `ryan-talk` (discuss only).

Discussing is not planning. When the user explores an idea or asks "what if" (for example "what if we move from a VPS to k8s?"), answer and discuss only: no spec, ticket, plan or file. When the discussion ends, ask once in one line what to do with it: park it in the backlog, plan it now, record a settled decision in "Decisions", or nothing. "Nothing" is a normal answer.

## Decisions

Settled decisions. Do not reopen one unless the user does. When a decision changes, strike the old line through and add the date.

- Target users & scope: Myanmar local online sellers (social commerce); fast, single-use invoice/voucher generator with no accounts, no backend database, and no invoice history (2026-11-25).
- ~~Local persistence: Save only the seller's reusable shop profile (shop details, logo, payment info, accent color) in browser `localStorage`, auto-saved with a Reset option (2026-11-25).~~ Local persistence saves the seller's reusable shop profile and the last used voucher number sequence (`mm-voucher-last-number-v1`) in browser `localStorage` so new/cleared vouchers auto-increment (e.g. `V-001` → `V-002`) while remaining editable (2026-11-25).
- ~~Export formats: Client-side DOM capture supporting PNG image only, PDF only, or both, selectable by the user (2026-11-25).~~ Export & sharing supports client-side DOM capture for PNG, PDF (A4/A5), or both, plus one-click PNG Copy Image (`navigator.clipboard.write`) and per-voucher payment account toggles from the saved Shop Profile (2026-11-25).
- ~~Mobile-first UX: Primary workflow optimized for mobile web (`Edit` / `Preview & Export` tabs and collapsible Shop Profile on mobile; side-by-side on desktop) (2026-11-25).~~ ~~Updated to Stripe-Invoice-inspired split workspace: compact Shop Profile identity strip + slide-over `Sheet` drawer, tabular line-item editor with inline summary ledger, `Edit` / `Preview & Export` tabs + sticky bottom summary bar on mobile, and tinted Document Stage with top export toolbar + floating voucher sheet on desktop (2026-11-25).~~ ~~Mobile web UX uses a single slim top bar + unified sticky bottom thumb dock (`Balance Due` + `Preview` on Edit; `Edit` + `Download` on Preview), Line Items ordered before Customer details with mobile `−`/`+` quantity steppers, expandable optional Address/Notes chips, `16px` mobile inputs to prevent iOS zoom, preview-first mobile stage, and compact Shop Profile strip + slide-over `Sheet` drawer (2026-11-25).~~ ~~Visual & UX craft uses a warm stationery palette (`#FFFEFB` editor / `#F6F3EC` stage), minimal wordmark header, shop monogram identity bar + tap-to-upload image tiles + integrated custom color swatch with contrast-safe accent tokens, single bottom `Add Item` button + 2-tier mobile item rows + collapsed zero-value adjustment chips with one-tap `Paid in full`, print-inspired receipt sheet (omits empty Bill To / dash clutter, `80px` scannable QR grid, receipt paid stamp), and slim segmented export toolbar (`PNG | PDF | Both` + `A4 | A5`) pinned above preview with no duplicate mobile Download CTA (2026-11-25).~~ UI layout follows `invoice-generator.com` with an `invoice-generator.com`-style direct-on-paper white voucher sheet (`#F3F4F6` neutral backdrop, top logo + heading/`#` row, From/Bill To + Date/Currency grid, solid accent-header line-item table with `+ Add Item`, and two-column Notes/Payment Accounts + Totals ledger) paired with a sticky right action sidebar (`#009E74` Download CTA, `PNG | PDF | Both` + `A4 | A5`, `Copy Image`, Preview toggle, Currency, Accent Color, Shop/Payment QR `Sheet` drawer, and New/Clear Voucher), plus an off-screen print sheet for 1-click export and a mobile bottom thumb dock (2026-11-25).
- ~~Language & fonts: Bilingual Burmese and English toggle with Burmese as default and proper Myanmar Unicode font support (2026-11-25).~~ Language & fonts: Bilingual Burmese and English toggle with Burmese as default, using Noto Sans (`Noto_Sans`, `Noto_Sans_Mono`, `Noto_Sans_Myanmar`) across UI and voucher preview/export (2026-11-28).
- Voucher layout & currency: Single clean Messenger/Viber-friendly voucher layout with an accent color picker (centered on A4/A5 for PDF), and `MMK` default with `MMK`/`THB`/`USD` currency selector (2026-11-25).
- UI & forms stack: Use `shadcn/ui` components for UI controls and `react-hook-form` for form state and field arrays (2026-11-25).
- Payment drawer & editor bottom layout: Clicking the Payment Accounts & QR button opens the slide-over `Sheet` in payment-only mode (showing only Payment Accounts & QR management, auto-save status, and Done), while the mobile Shop Summary `Edit` button opens the full Shop Profile `Sheet`; in `VoucherOrderForm`, Totals, Order Notes, and Payment Methods stack vertically in a single column (Totals -> Notes -> Payment Methods) (2026-11-27).
- Export & sidebar button identity: Keep export format buttons (`PNG`, `PDF`, `PNG + PDF`) single-line (`whitespace-nowrap` in `grid-cols-3 gap-1.5`) inside a `304px` desktop sidebar (`lg:grid-cols-[minmax(0,1fr)_304px]`), with explicit per-button borders, semantic active/hover tints, and colored icons across export and sidebar action buttons (2026-11-27).
- Corner image remove & full-screen-faithful responsive UI: `ImageUploadField` places the remove icon button at the top-right corner (`-top-2 -right-2`) of the image preview box; `addAddress` uses a colored bordered button with transition; responsive viewports keep the full-screen paper structure (Logo, From, Bill To, Line Items, Totals, Order Notes, Payment Methods) and Export & Controls sidebar directly visible without collapsed mobile Shop Summary or `addNote` toggles (2026-11-27).
- ~~Full-width adjustment fields: Discount, Delivery Fee, and Deposit render with their label above a `w-full` left-aligned numeric input (`pr-9 text-left`) and an `X` cancel button anchored inside the right edge (`absolute top-1/2 right-1.5 -translate-y-1/2`) (2026-11-27).~~ Full-width adjustment fields: Discount, Delivery Fee, and Deposit render with their label above a `w-full` left-aligned numeric input and an `X` cancel badge anchored at the top-right corner (`absolute -top-2 -right-2 z-10`) with `active:not-aria-[haspopup]:translate-y-0` so clicks never jump (2026-11-27).
- Full-width delivery address: The `addAddress` button (`w-full`) and expanded `customer-address` textarea (`w-full`) span the full paper width (`md:col-span-2`) directly below `From` and `Bill To` (2026-11-27).

### Out of scope

Features deliberately left out or removed. Do not add them back without asking.

- User accounts, authentication, or backend database storage (2026-11-25).
- Invoice history or saved past invoice drafts (2026-11-25).

## Generated files

Do not hand-edit these; a regenerate overwrites hand edits. Regenerate with the listed command.

- `.next/types/` and `next-env.d.ts`: `pnpm exec next typegen` (or `pnpm dev` / `pnpm build`)

## Deploy

No deploy plan yet. Do not deploy or change servers or cloud resources. When the user is ready, they run `ryan-ship`.

## Docs

`docs/` describes how the project works now. See `.ai/rules/docs.md`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
