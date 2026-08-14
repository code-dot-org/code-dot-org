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

- **functional** — the `chromium`, `firefox` and `webkit` projects. This is every
  test without the `@visual` tag. A failure stops the Drone PR build and the DTT.
- **eyes** — the `visual-chromium` project. This is the `@visual` tests, which
  send images to Applitools. A failure goes to Slack and stops nothing, because a
  person must approve each new image. Runs only where `VISUAL_PROVIDER` is set.

They run as two processes, so they get two exit codes. Each writes its own report
and its own `results.json`, and uploads to its own S3 directory. functional uses
`playwright-report/` and `test-results/`; eyes adds `-eyes` to both names.

## Where these tests run

- **Drone** — both suites, against the dashboard and apps the PR builds, before
  the Cucumber tests. Drone holds a functional failure until Cucumber also runs,
  so one build shows both results. The functional suite runs `chromium` alone,
  because Cucumber there runs Chrome alone. The same commit tags widen both:
  `[test firefox]` adds `firefox`, `[test safari]` adds `webkit`, and `[test all
browsers]` adds both. `[skip chrome]` drops `chromium`, and with no browser
  left the suite does not run. Playwright has no iPad or iPhone project, so
  `[test ipad]`, `[test iphone]` and `[test ios]` widen Cucumber only.
- **DTT** — the functional suite in all three browsers, against test-studio, with
  the Cucumber tests.
  `test:ui_all` starts all four deploy-time suites together. The daemon has no
  Applitools key, so on the DTT the eyes suite runs only through GitHub Actions.
- **DTT → GitHub Actions** (`dtt.yml` → `e2e-tests-ci.yml`) — `test:ui_all` also
  starts a GitHub Actions run and does not wait for it. The `e2e` job runs the
  functional suite in all three browsers; the `eyes` job runs `visual-chromium`
  alone, as everywhere else. They need no CDO secrets and no local Rails build,
  so an outside contributor or an agent can run them, and GitHub can divide them
  across runners. Neither job can stop the deploy, because the DTT does not wait.

Sharding splits the Playwright test report too: each shard can only report on
the tests it ran. So each writes its slice using Playwright's `blob` reporter, a
format meant to be merged rather than read, and an `e2e-report` job merges the
slices into one whole-run report, published as the `e2e-tests-report` artifact
and printed as a pass/fail list in that job's own log.

A passing `e2e-report` job means the merge succeeded, not that the tests passed.
If any e2e shard jobs failed, read the merged `e2e-tests-report` artifact to see
which tests failed. Shard count is the length of the `shard` list in
`e2e-tests-ci.yml`.

## Agent skill setup

The Cucumber→Playwright porting agents read the `playwright-best-practices`
skill. It is not vendored: it is pinned in `skills-lock.json` at the repo root
and restored on demand. Once per checkout, from the repo root:

    npx skills experimental_install

This materializes `.agents/skills/playwright-best-practices/` (gitignored). Bump
the pinned version with `npx skills update playwright-best-practices`.
