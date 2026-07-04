# Proposal: frontend-e2e-studio-gate

Evidence base: testing/CI audit in
`openspec/frontend-platform-exploration-report.md`, verified 2026-07-04.

## Why

No browser ever loads the studio shell in CI. `studio-ci.yml` is
build+lint+typecheck+vitest with `--passWithNoTests`; the e2e-tests GHA
lane targets `test-studio.code.org` (never the PR's code); the Drone lane
that does see PR code runs `bundle exec rake test:playwright_ui || true`
(`docker/ci/scripts/ui_tests.sh:21`). A router or core change that blanks
every studio route merges green today. MSW mode makes a real gate cheap:
the shell can be browser-tested with no Rails at all.

## What Changes

- A studio smoke suite (Playwright) added under `frontend/apps/studio`
  (owned by the package, mirroring oceans' e2e layout — not by
  `packages/e2e-tests`, which targets deployed environments): boot
  `VITE_API_MODE=msw yarn dev` via Playwright's `webServer`, then assert
  (1) `/frontend-studio/` renders the shell (header/footer, no console
  errors), (2) the music lab route loads its lazy chunk and the `simple`
  fixture scenario activates, (3) an unknown lab 404s via the router's
  `notFound`, (4) signed-out auth renders per the `users/current`
  default persona. Scope: single-digit specs, chromium-only, minutes not
  tens of minutes.
- `studio-ci.yml` runs the smoke suite as a required job (same
  path-filter as today plus `packages/core/**` — core changes currently
  reach studio's gate only via the oceans filter).
- Dead-tag cleanup in `packages/e2e-tests`: `@no_mobile` filters nothing
  (no mobile project exists) and `@no_ci` is referenced by config but
  applied to zero specs — both are either implemented (a mobile project;
  a tagged spec) or removed, and the tagging convention is documented in
  the package README.
- Lane truthfulness documented in `packages/e2e-tests/README.md`: which
  lane sees PR code (Drone, non-blocking), which gates (GHA,
  test-studio-only, package-changes-only), which is post-deploy (DTT).
  Today this is discoverable only by reading three configs and a rake
  file.

## Capabilities

### New Capabilities

- `studio-e2e-gate`: PR-blocking, browser-level verification of the
  studio shell against MSW, plus truthful e2e lane semantics.

### Modified Capabilities

(none)

## Impact

`frontend/apps/studio` (new `e2e/` + playwright config + devDep),
`.github/workflows/studio-ci.yml`, `frontend/packages/e2e-tests`
(tag cleanup + README). Depends on `frontend-core-msw-parity` for the
`users/current` default persona (scenario 4); scenarios 1–3 work today.
Drone's `|| true` is explicitly out of scope (legacy CI policy, owned
outside `frontend/`); this change adds the gate rather than fighting
that one.
