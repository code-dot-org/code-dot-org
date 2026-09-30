# @code-dot-org/e2e-tests

Playwright end-to-end test suite for studio.code.org.

## Running locally

From `frontend/`:

    # Against a local dashboard (http://localhost-studio.code.org:3000), Chromium only:
    yarn workspace @code-dot-org/e2e-tests test:ui:local

    # Against an adhoc (or any deployment), all browsers:
    TARGET_URL=https://my-adhoc.cdn-code.org yarn workspace @code-dot-org/e2e-tests test:ui

`TARGET_URL` overrides the default target (`test-studio.code.org`). With no
`TARGET_URL`, `test:ui` runs against test-studio.

## functional and eyes

- **functional** — every test without the `@visual` tag. A failure stops the build.
- **eyes** — visual differences are checked with a third-party provider,
  Applitools.

## Where these tests run

- **Drone** — both suites, against the build the PR makes, before the Cucumber
  tests. Runs `chromium` only. To add browsers, see the commit tags in
  [dashboard/test/ui/README.md](../../../dashboard/test/ui/README.md). A visual
  difference does not fail the build until we can develop a PR-level visual diff
  strategy.
- **DTT** — the functional suite in all three browsers, against test-studio. Visual diffs runs only on chromium against test-studio. A visual difference fails the DTT.

## Agent skill setup

The Cucumber→Playwright porting agents read the `playwright-best-practices`
skill. It is not vendored: it is pinned in `skills-lock.json` at the repo root
and restored on demand. Once per checkout, from the repo root:

    npx skills experimental_install

This materializes `.agents/skills/playwright-best-practices/` (gitignored). Bump
the pinned version with `npx skills update playwright-best-practices`.
