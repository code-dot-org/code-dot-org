# Appendix 03 — Final: Phase 4 review, autofix, advisory capture

Supports memo-03. Reviewed range: `6550857ba81..01c3a90bf89` (scaffold
`6090f872010`, Sessions A-D `5c280e06d1a`, `0d8ad529c57`, `a8e9d9d8fcb`,
`01c3a90bf89`). Autofix commit: `9740560a49a`.

## Review findings and dispositions

Reviewers: typescript-reviewer, react-reviewer, a11y-architect subagents over
the combined diff; design-system and copy-parity review by Opus directly.

### Fixed (commit `9740560a49a`)

| # | Finding | Source | Fix |
|---|---|---|---|
| 1 | BLOCKER: `SectionListSummarySchema` required `grades`/`avatar_color`/`avatar_emoji`, but grades has no presence validation and the avatar migration (`20250409201643`) shipped with no backfill — one pre-migration section rejects the entire list | TS | fields `.nullable()`; parser test for the legacy-section shape |
| 2 | Error state invisible: only `data` destructured; failures render the bare loading div forever | TS+React | `isError` branch → `data-state="error"`, `role="alert"`, message; test added |
| 3 | No error boundary: render throw blanks the whole Studio route | React | package-scoped `RegionErrorBoundary` renders the same error state |
| 4 | Loading state silent for AT | React+a11y (WCAG 4.1.3) | `role="status"` + visually-hidden "Loading class sections…" |
| 5 | Heading skip: list state had per-card h3 with no region heading (WCAG 1.3.1/F43); empty state h2 vs list none | a11y RULING: fix now | visually-hidden region h2 "Class Sections" in list state; empty state's visible h2 headline remains its single region heading; vitest + e2e heading assertions added |
| 6 | WebKit strips `list` role under `list-style:none` | a11y RULING: fix now, not defer | explicit `role="list"` + one-line justified `jsx-a11y/no-redundant-roles` disable |
| 7 | List-scenario axe scoped to the bare `ol` — page/heading rules silently skipped | a11y | axe include widened to `#teacher-dashboard-home[data-state="list"]`; combobox added to the mutating-control check |
| 8 | Copy NOT legacy: headline glyphs differed (`It's…​...` vs `It’s…​…`); invented SVG vs legacy `no_sections.png`; image box 8rem vs legacy 220px | Opus copy-parity | exact `emptySectionHeadline`/`emptyClassSections` strings; legacy PNG copied to `src/assets/`; 220px width. (Description already matched byte-for-byte — Session B's copy was near-legacy, not invented.) |
| 9 | Bespoke MSW handler contradicted the mocks module's documented read-only architecture | TS | `sections` desugared via `readOnlyRoutes` in the registry; `sections.handlers.ts` deleted |
| 10 | `tsconfig include: ["src"]` never type-checked `e2e/` or `playwright.config.ts` | TS | include extended (e2e-tests precedent) |
| 11 | Dev-shell MSW boot unhandled rejection; placeholder `index.test.ts` asserted nothing | TS nits | `.catch` with visible failure text; test asserts named+default export identity |

### Deferred with rationale (no scope/contract/acceptance change made)

- Per-mount `QueryClient` discards cache across route revisits — documented
  self-containment tradeoff; revisit when Studio grows an app-level provider.
- `eslint-plugin-react-hooks` absent from `lint-config/eslint/react.mjs` —
  repo-wide gap, upstream follow-up, not pilot scope.
- Suspense fallback / package copy hardcoded en-US — matches the sibling route
  convention and the registry's fixed-locale dimension; i18n plumbing for
  `frontend/packages/*` is a product/infra decision outside the pilot.
- Manual VoiceOver/NVDA pass and forced-colors check — cannot be driven from
  this environment; listed as human follow-ups.
- Legacy card face shows no student-count label while the candidate does — the
  registry scenario mandates the count as a core label; kept, noted in the
  advisory observations.

### Clean areas (verified)

Login-type and participant-type enums exactly match Rails
(`section.rb:269-276`; `PARTICIPANT_AUDIENCE`). Query keys/hook passthrough,
`LabFixture.sections` z.input typing, key usage, StrictMode-safe lazy client
init, no `any`/floating promises/swallowed errors, semantic tokens only,
contrast ≈8.6:1, decorative alt, zero interactive elements as asserted shape
(SC 2.1.1 ruling: acceptable). Design-system hierarchy correct (MUI
Typography, DSCO Image, semantic ol/li, SCSS modules).

## Gates after autofix

- Filter-scoped turbo `build typecheck lint test` (teacher-dashboard, core,
  studio) — 38/38.
- Package vitest 10/10 (incl. new error-state, heading, export tests); core
  parser tests incl. the legacy-null shape.
- Playwright 11 specs × 5 repeats = 55/55 with deliberately regenerated
  baselines (empty-state visual change per finding 8; declared in
  visual-artifacts.md).
- `./tools/hooks/pre-commit` clean at commit.

## Advisory capture (Phase 4, Opus-owned)

Executed against test-studio.code.org only, per the registry fixture recipes;
candidate captured from the MSW dev shell post-autofix; Firefox both sides.
Setup snags fixed during the run (recorded for reuse): `createUser` needs a
prior `goto('/')` for a same-origin CSRF fetch; switching student→teacher
requires `resetSession` before `signIn` (else `/teacher_dashboard/home`
redirects into the student's unit); legacy card `li` count must use direct
children (nested dropdown `li`s). Artifacts + observations:
visual-artifacts.md "Phase 4 advisory captures"; capture specs archived under
`artifacts/capture-specs/` and removed from the packages (not committed to any
suite).

## Traceability

Scenario TD-HOME-EMPTY → spec "Empty home region…" → tasks 3.x/7.1 → vitest
empty tests + e2e empty spec + advisory empty pair. Scenario
TD-HOME-SECTION-LIST → spec "Populated home region…" → tasks 4.x/7.1 →
vitest list tests + e2e list spec + advisory list pair. API contract →
api-contract-matrix (nullability corrected this phase) → schema + parser
tests. All five pilot commits reviewed; autofix `9740560a49a`; docs commits
`29a417eecb6`, `6090f872010` (docs part), `0e1a27e5879`, `37ea3761644`,
`a5f1e855a6f`, plus the Phase 4 docs commit.

## Not verifiable by Opus in this environment

Real WebKit/VoiceOver announcement of the list; NVDA read-through of the
loading→settled transition; forced-colors rendering; Chromium behavior of the
MSW shell (environmental crash, ruled Firefox-only); CI (drone/GHA) execution
of the package's Playwright project (not wired into CI by design this pilot).
