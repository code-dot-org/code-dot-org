# Proposal: frontend-generator-catalog-alignment

Evidence base: `openspec/frontend-platform-exploration-report.md`
(generator drift findings G1–G8), verified 2026-07-04.

## Why

A fresh `yarn turbo gen lab` today pulls React 19 into a workspace whose
own catalog comment (`frontend/.yarnrc.yml:60-70`) pins React `^18.3.1`
because "apps/ portals require React 18 … both workspaces must share one
instance to avoid hooks violations." The generator — the tool the docs
call the enforcement mechanism for conventions — is the one component
that actively violates them, and nothing in CI would notice.

## What Changes

- `turbo/generators/templates/{lab,package}/package.json.hbs`: literal
  `react`/`react-dom`/`@types/react*` versions (`^19.2.0` etc.) replaced
  with `catalog:`, matching every real package (music, oceans, core).
- Peer ranges in templates aligned to reality: `^18.0.0 || ^19.0.0`
  (no shipped lab supports 17; templates currently advertise it).
- The studio-registration insertion in `turbo/generators/config.ts`
  (regex at `config.ts:117-119,272-274`, which silently no-ops if the
  last `@code-dot-org/*` workspace dep is not followed by a
  non-`@code-dot-org` dep) is replaced with a deterministic anchor
  (explicit marker comment in `apps/studio/package.json` and the three
  registration files) plus a post-generation assertion that all four
  edits landed — turning the silent-`notFound()` failure mode into a
  loud generation error.
- A generator-conformance CI check is added to the frontend lint/test
  lane: run both generators into a temp workspace member, assert the
  scaffold builds (`turbo build --filter`), passes lint, and that the
  scaffolded file list matches the one documented in
  `docs/conventions/packages.md`. This is the structural guard the
  "tightly coupled" rule (`frontend/AGENTS.md:82-93`) currently lacks.
- Template devDeps reconciled with the reference lab where the omission
  is a trap (missing `@testing-library/dom` breaks the scaffolded test
  pattern); deliberate leanness elsewhere is kept and documented.

## Capabilities

### New Capabilities

- `frontend-generator-conformance`: generator output is buildable,
  catalog-conformant, and provably in sync with the conventions doc.

### Modified Capabilities

(none)

## Impact

`frontend/turbo/generators/**`, `apps/studio/package.json` (anchor
comment only), `.github/workflows/frontend-ci.yml` (one job),
`docs/conventions/packages.md` (file-list source of truth for the
conformance check). No shipped package changes. Depends on nothing;
`frontend-docs-truth-pass` edits neighboring doc text, so coordinate the
`packages.md` merge.
