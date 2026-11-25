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
- Local persistence: Save only the seller's reusable shop profile (shop details, logo, payment info) in browser `localStorage` (2026-11-25).
- Export formats: Client-side DOM capture supporting PNG image only, PDF only, or both, selectable by the user (2026-11-25).

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
