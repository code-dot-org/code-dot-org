# Proposal: frontend-docs-truth-pass

Documentation-only change. Every item below was verified against the tree
on 2026-07-04 (see `openspec/frontend-platform-exploration-report.md`,
"Assumption audit — repo docs claims"). No product code changes.

## Why

The `frontend/` workspace docs actively misroute module authors: the
advertised lab URL 404s, the conventions table points at a file that does
not exist, the core README's first example calls methods that were never
shipped, and the transports README documents a transport with no source
file. Docs drift is the cheapest failure mode to fix and the most
expensive to leave: each new package copies the drift forward.

## What Changes

- `frontend/README.md`: studio is no longer described as "experimental"
  (contradicts `AGENTS.md:10` "primary architecture"); apps list drops the
  nonexistent Contentful app; package list gains `core`, `markdown`,
  `users`, `e2e-tests`, and `packages/labs/*`.
- `frontend/AGENTS.md`: structure diagram gains `markdown`, `users`,
  `e2e-tests`, `changelogs`, `design-system-storybook`, labs
  `oceans`/`ailab`; the conventions-table row pointing at
  `docs/conventions/tech.md` is satisfied by writing that doc
  (consolidating the Rails-Vite integration contract: `app-config` meta
  tag, `vite_typescript_tag`, `/frontend-studio` basepath lockstep across
  `config/vite.json` / `router/index.ts` / `routes.rb:10`) —
  `BLOCKED-EVIDENCE: owner may prefer repointing the row instead;
  default is to write the doc`.
- Route-path truth: `/app/projects/<name>/…` corrected to the real
  `/frontend-studio/projects/$labType/$channelId/edit` in
  `frontend/docs/conventions/packages.md:120,127-128`,
  `frontend/apps/studio/README.md:32`,
  `frontend/packages/labs/music/README.md:3,52`.
- `frontend/packages/core/README.md:44-47`: flagship example rewritten to
  the real flat client (`DashboardApiClient.levels.getLevelProperties`,
  `preferences.getThemeSettings`).
- `frontend/packages/core/src/api/transports/README.md` and
  `src/api/README.md`: remove the phantom `httpTransport`/
  `createHttpTransport`/`fetch` mode and the bogus `rails` mode name;
  document the real `ApiMode` union (`dashboard|msw|replay|auto`).
- MUI augmentation truth: `component-library/MIGRATION_STATUS.md:76`, the
  design-system skill, and `frontend/apps/studio/src/types/mui.d.ts`
  header all point at nonexistent files; corrected to the real source
  `src/themes/code.org/muiAugmentation.ts`, and the obsolete "manually
  sync to `apps/src/types/mui.d.ts`" workflow is deleted (that file does
  not exist; augmentation flows through the `./themes` type re-export).
- `component-library` README/CONTRIBUTING: "Jest + RTL" → Vitest; the
  stale `src/componentLibrary`/top-level-`stories/` instructions corrected
  to `src/<name>/` + `src/<name>/stories/*.story.tsx` built by
  `apps/design-system-storybook`; MIGRATION_STATUS gains the missing
  `footer` row (override ships in `STYLE_OVERRIDES` today).
- `frontend/docs/conventions/packages.md:42`: the blanket `"type":
  "module"` prohibition is scoped to portal-consumed JS packages (it is
  already set by `markdown` and `component-library-styles`); the
  peer-deps rule at `AGENTS.md:98` gains its real qualification
  (externalized peers; deliberate runtime deps like oceans' TFJS are the
  documented exception).
- `frontend/packages/users/README.md`: aspirational surface
  (`UsersSettingsPage`, `./mocks`, persona shell, studio route — none
  exist on staging) moved under an explicit "Planned" heading so the
  README stops reading as shipped.
- `frontend/apps/studio/docs/architecture.md:70-79`: the react/react-dom
  alias claim corrected to match `vite.config.ts` (only `@` alias + MUI/
  emotion dedupe; React singleton rests on hoisting) — or the alias is
  restored, which belongs to `frontend-generator-catalog-alignment`'s
  React-singleton decision, and this doc then records it.
- `ailab` status: one sentence in `AGENTS.md` structure notes it is
  vendored and unregistered in Studio — `BLOCKED-EVIDENCE: owning-team
  decision on register-vs-park; default is to label current state`.

## Capabilities

### New Capabilities

- `frontend-docs-accuracy`: workspace documentation matches the tree —
  structure listings, route paths, API examples, transport modes,
  augmentation paths, and testing-stack names are verifiable against code.

### Modified Capabilities

(none — no existing specs cover frontend/ docs)

## Impact

Markdown files only, under `frontend/` plus the design-system skill doc.
No build output, no runtime behavior, no API changes. Interacts with
`frontend-generator-catalog-alignment` (which owns keeping
`turbo/generators/config.ts` and `packages.md` coupled going forward);
sequencing: this change can land first and independently.
