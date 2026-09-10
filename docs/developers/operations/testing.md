---
title: Testing
description: The test suites, how to run one file, what CI runs where, and the Cucumber tag vocabulary.
type: reference
---

Every test suite, its one-file command, and which CI system runs it.

## Suites at a glance

| Suite | Directory | One-file command | Full-suite time |
|---|---|---|---|
| Apps unit (jest) | `apps/` | `yarn test:unit test/unit/gridUtilsTest.js` | ~5 min (part of `yarn test`) |
| Apps integration (Karma) | `apps/` | `yarn test:integration --grep='data_blocks'` | ~5 min (part of `yarn test`) |
| Dashboard (minitest) | `dashboard/` | `bundle exec spring testunit ./test/lib/some_test.rb` | ~15 min |
| frontend (vitest) | `frontend/` | `yarn test` (turborepo, all packages) | varies |
| Playwright e2e | `frontend/` | `yarn workspace @code-dot-org/e2e-tests test:ui:local` | varies |
| Cucumber UI/Eyes | `dashboard/test/ui/` | `bundle exec rake test:ui feature=dashboard/test/ui/features/some.feature` | ~45 min (full remote) |
| Shared/Lib Ruby | `shared/` or `lib/` | `bundle exec ruby -Itest ./test/path/to/test.rb` | seconds |
| Pegasus | `pegasus/` | `rake test TEST=test/test_dev_routes.rb` | ~20 sec (full) |

## Running apps tests

From `apps/`:

- `yarn test` -- lint, unit, and integration in parallel.
- `yarn test:unit` -- jest unit tests only.
- `yarn test:unit test/unit/applab/` -- all unit tests in a folder.
- `yarn test:integration` -- Karma integration tests (headless Chrome).
- `yarn test:integration --browser=Chrome --watchTests` -- debug in a visible Chrome window.
- `yarn run typecheck` -- TypeScript type checking (~10 seconds). Linting does not check types, so run both after modifying `.ts`/`.tsx`.

You must run `yarn build` at least once before running tests; without it, imports from `../../../build/` fail.

## Running dashboard tests

From `dashboard/`:

**First-time setup** (seed the test database):

```sh
RAILS_ENV=test bundle exec rake assets:precompile
RAILS_ENV=test bundle exec rake db:reset db:test:prepare
cd ../pegasus && RAILS_ENV=test bundle exec rake test:reset_dependencies && cd ../dashboard
```

**Single file:** `bundle exec spring testunit ./test/controllers/sections_controller_test.rb`

**Single test:** `bundle exec spring testunit ./test/controllers/sections_controller_test.rb --name test_your_test_name`

If Spring gives `Unable to autoload constant`, run `spring stop` and retry.

## Running Playwright e2e tests

From `frontend/`:

```sh
# Against the local dashboard (Chromium only):
yarn workspace @code-dot-org/e2e-tests test:ui:local

# Against a remote deployment (all browsers):
TARGET_URL=https://test-studio.code.org yarn workspace @code-dot-org/e2e-tests test:ui
```

The Playwright config defaults `baseURL` to `https://test-studio.code.org`; `TARGET_URL` overrides it. No `webServer` block exists -- the suite connects to an already-running server. Retries are 2 under automated providers (Drone, GitHub Actions, DTT), 0 locally. Timeout: 90 seconds per test, 15 seconds per assertion.

## Running Cucumber UI and Eyes tests

From `dashboard/test/ui/`:

```sh
# All features locally with Chromedriver:
./runner.rb -l

# One feature:
bundle exec rake test:ui feature=dashboard/test/ui/features/some_test.feature
```

Eyes tests are the subset tagged `@eyes`. They compare screenshots against Applitools baselines. If your change alters layout, the eyes test will fail; review the diff in Applitools with your reviewer before accepting the new baseline.

## Linting

The fastest lint for changed files (Ruby and JS/TS):

```sh
./tools/hooks/pre-commit
```

This runs the pre-commit git hooks on modified files only. Run it after every batch of changes. For a full lint of all apps files: `cd apps && yarn lint` (~1 minute).

## What CI runs where

### Drone

Drone runs on every PR push. It has three pipelines:

| Pipeline | What it runs |
|---|---|
| `unit` | Ruby lint, dashboard minitest, apps `yarn test`, shared/lib tests, pegasus tests |
| `ui` | Cucumber UI tests and Eyes tests against a freshly-built instance |
| `cache-staging-build` | Prepares a cached staging build artifact for the other pipelines |

A Drone run takes 30-60 minutes. The `@no_ci` tag on a Cucumber feature skips it under Drone.

### GitHub Actions

`Frontend-CI` triggers on PRs and pushes to `staging` when files under `frontend/` or `.github/` change. It fans out to per-package workflows:

- `Studio-CI`, `Component-Library-CI`, `Oceans-CI`, `Markdown-CI`, `Users-CI`, `Lesson-Deep-Dive-CI` -- each is a `workflow_call` job that runs only when its package's files changed.
- `E2E-Tests-CI` -- the Playwright e2e suite, called from `Frontend-CI`.
- `k8s` -- validates Kubernetes manifests on PRs touching `k8s/`.
- Docker image builds (`cdo-base-image`, `cdo-deps-image`, `cdo-rails-image`, `frontend-docker-images`) run on pushes and schedules.

### DTT (Deploy-to-Test)

`dtt.yml` is a `workflow_dispatch` workflow. It triggers a deploy to the test environment, then runs the Cucumber and Playwright suites against it. It is not automatic; an engineer triggers it manually.

## Cucumber tag vocabulary

| Tag | Meaning |
|---|---|
| `@eyes` | Applitools visual regression (109 features) |
| `@skip` | Permanently skipped (32 features) |
| `@no_ci` | Skipped under Drone CI (14 features) |
| `@playwright` | Already ported to Playwright (44 features) |
| `@no_safari` | Skipped on Safari due to known browser bugs |

## Playwright tag vocabulary

| Tag | Meaning |
|---|---|
| `@visual` | Applitools/native-screenshot lane; excluded from functional projects |
| `@no_ci` | Skipped under `PLAYWRIGHT_PROVIDER=drone` (backends like Javabuilder are absent) |

## Troubleshooting a red Drone build

How to distinguish a flake from a real break and what to do in each case.

### Tell a flake from a real break

1. Open the Drone build at `https://drone.cdn-code.org` and find the failing step.
2. Read the test name and error message. Copy the test name.
3. Check whether the same test failed on other recent PRs. In Drone, look at the build history for the `staging` branch -- if the same test name appears red on unrelated PRs, it is likely a flake.
4. If the test passes on `staging` and fails only on your branch, the failure is likely real. Run the test locally with the one-file command from the table above and inspect the output.

### Restart a Drone build

Open your build in Drone and select the **Restart** button in the upper right corner. This reruns all three pipelines from scratch. There is no way to rerun a single pipeline.

If the build fails a second time on the same test, treat it as a real break and investigate locally.

### A test fails locally but passes on Drone (or vice versa)

Local runs have no retries; Drone retries each Playwright test twice. A test that fails once locally may pass on Drone through retries. Run the test locally with `--retries=2` to match Drone behavior.

Database seed differences can also cause mismatches. If a dashboard test fails locally with missing-table or missing-seed errors, reseed the test database:

```sh
cd dashboard
RAILS_ENV=test bundle exec rake db:reset db:test:prepare
```

### Where to report a persistent flake

If you confirm a test is flaky (fails intermittently across unrelated PRs), post in the team's Slack channel with the test name, the Drone build link, and the error message. There is no automated flaky-test tracker.

## Next steps

- [Test API and local accounts](/developers/operations/test-api-and-local-accounts/) -- the endpoints that create throwaway test users.
- [Delivery](/developers/operations/delivery/) -- how CI connects to the deploy pipeline.
