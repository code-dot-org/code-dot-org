# @code-dot-org/e2e-tests

Playwright end-to-end test suite for studio.code.org.

## Running locally

From `frontend/`:

    # Against a local dashboard (http://localhost-studio.code.org:3000), Chromium only:
    yarn workspace @code-dot-org/e2e-tests test:ui:local

    # Against an adhoc (or any deployment), all browsers:
    TARGET_URL=https://my-adhoc.cdn-code.org yarn workspace @code-dot-org/e2e-tests test:ui:ci

`TARGET_URL` overrides the default target (`test-studio.code.org`). With no
`TARGET_URL`, `test:ui:ci` runs against test-studio.

## Why GitHub Actions, and why not (just) Drone

This suite runs in three places, each with a distinct purpose:

- **GitHub Actions** (`e2e-tests-ci.yml`) — runs against the deployed
  `test-studio.code.org` with no CDO secrets and no local Rails build. It proves
  the suite is portable: runnable outside Drone/DTT by external contributors or
  sandboxed agents, and horizontally shardable. It gates on changes to this
  package (and the Playwright version), not on a PR's product code — that code
  is not visible on test-studio.
- **Drone** — runs the suite against the PR's own locally-built dashboard + apps,
  after the Cucumber tests. This is where a PR's code changes are gated.
- **DTT** — runs the suite against test-studio's dashboard + apps, after the
  Cucumber tests.

GitHub Actions is not a stepping stone to Drone; it is a parallel track that
keeps the suite secret-free and independently runnable.
