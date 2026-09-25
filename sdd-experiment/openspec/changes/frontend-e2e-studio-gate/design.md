# Design: frontend-e2e-studio-gate

## Context

Three e2e lanes exist and none gates studio PR code. Oceans already
proves the package-owned pattern: own playwright config, own `webServer`
(port 5173), own CI job that gates. MSW mode (fixture registry + scenario
store in core) removes the Rails dependency that makes the legacy UI
suite heavy.

## Goals / Non-Goals

**Goals:**

- A studio-breaking change cannot merge without a browser catching it.
- The suite runs hermetically in CI: no deployed environment, no
  secrets, no Rails.

**Non-Goals:**

- No port of the Cucumber corpus; this is a smoke gate, not coverage.
- No cross-browser matrix (chromium-only; firefox/webkit remain the
  deployed-suite's concern).
- No fixing Drone's `\|\| true` (legacy CI policy, different owner).
- No visual baselines (oceans' visualCheck abstraction can be adopted
  later; smoke asserts structure and console health only).

## Decisions

- **Package-owned suite in `apps/studio`, not `packages/e2e-tests`.**
  The e2e-tests package is deployed-environment tooling (TARGET_URL,
  auth against real Rails); mixing a hermetic vite-webServer suite into
  it would fork its config. Oceans sets the precedent
  (`packages/labs/oceans/playwright.config.ts`).
- **`webServer` = `VITE_API_MODE=msw yarn dev`** rather than `vite
  preview` of a build: dev mode exercises the same code path
  contributors run, starts in ~1s (measured 523ms), and MSW's worker
  registration is dev-wired already. Revisit preview-mode once a
  production-serving decision exists (`frontend-studio-production-
  readiness`).
- **Console-error assertion is part of the smoke contract** (oceans'
  console-health spec as prior art): the shell currently logs clean, and
  console noise is the earliest regression signal a smoke test can buy.
- **Core in the path filter.** Studio's gate today misses core changes
  entirely unless oceans' filter happens to run; the smoke suite is
  exactly the integration signal for core→studio composition, so
  `packages/core/**` triggers it.
- **Playwright pin comes from the catalog** (exact-pinned 1.59.1) and
  the existing `PLAYWRIGHT_IMAGE_TAG` container in `frontend-ci.yml` —
  no new version surface; the lockstep check lands in
  `frontend-release-validation-truth`.

## Risks / Trade-offs

- Adds minutes to studio PRs; bounded by suite size (single-digit
  specs) and path filtering.
- MSW-mode smoke does not exercise Rails integration (basepath, meta
  tag); accepted — that is the production-readiness change's territory,
  and the vite-plugin-rails contract is covered there.
- Dev-server flakiness in CI (EMFILE seen once in the sandbox
  measurement) — mitigate with the Playwright container image already
  used by e2e-tests-ci and `webServer` retries; escalate only if
  observed in CI proper.
