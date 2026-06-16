#!/usr/bin/env bash
#
# Run the e2e Playwright suite against $TARGET_URL. Shared by the Drone `ui`
# pipeline (docker/ci/scripts/ui_tests.sh) and the DTT `test:playwright_ui` rake
# task (lib/rake/test.rake) so the run and its messaging live in one place.
#
# Browsers: baked into the Drone CI image (docker/ci/Dockerfile) so the install
# below is skipped in CI; installed at runtime on the long-running DTT daemon.
# Not provisioned via chef — Playwright and its browsers version together, so a
# cookbook bump is impractical; longer term, Playwright-in-Docker would drop the
# runtime install entirely.
#
# Reads the target deployment from $TARGET_URL (e.g.
# http://localhost-studio.code.org:3000 for Drone, the test env for DTT) and
# runs every browser engine in playwright.config.ts (chromium, firefox, webkit).
#
# Non-blocking by contract: on failure it warns and exits non-zero, leaving each
# caller to report it without treating it as fatal.
set -euo pipefail

: "${TARGET_URL:?TARGET_URL must be set (e.g. http://localhost-studio.code.org:3000)}"

# Run from the package root (one level up from bin/) regardless of the caller's cwd.
cd "$(dirname "${BASH_SOURCE[0]}")/.."

trap 'echo "WARNING: Playwright e2e tests failed (non-blocking)"' ERR

echo "--- running Playwright e2e tests against $TARGET_URL (non-blocking) ---"

# Clear last run's artifacts so an aborted run can't be reported as this one's.
rm -rf playwright-report test-results

yarn install --immutable
# Only the DTT installs browsers at runtime (GHA/Drone bake them). install-deps is
# omitted — it hits apt every run; provision OS libs once on the daemon.
if [ "${PLAYWRIGHT_PROVIDER:-}" = dtt ]; then
  yarn exec playwright install chromium firefox webkit
fi
yarn run test:ui:e2e
