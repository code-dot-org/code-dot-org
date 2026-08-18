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
- **eyes** — the `@visual` tests, checked in Applitools. A failure stops nothing,
  because a person must approve each new image.

## Where these tests run

- **Drone** — both suites, against the build the PR makes, before the Cucumber
  tests. Runs `chromium` only. To add browsers, see the commit tags in
  [dashboard/test/ui/README.md](../../../dashboard/test/ui/README.md).
- **DTT** — the functional suite in all three browsers, against test-studio, with
  the Cucumber tests. Eyes runs only through GitHub Actions.
- **DTT → GitHub Actions** (`dtt.yml` → `e2e-tests-ci.yml`) — both suites again,
  on GitHub runners, with nothing waiting for the result. Needs no CDO secrets
  and no local Rails build, so contributors and agents can run it too.

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
