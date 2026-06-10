#!/usr/bin/env bash
#
# Run the e2e Playwright suite against $TARGET_URL, installing the browser
# binaries at runtime. Shared by the Drone `ui` pipeline
# (docker/ci/scripts/ui_tests.sh) and the DTT `test:playwright_ui` rake task
# (lib/rake/test.rake) so the install+run sequence and its messaging live in
# one place.
#
# Reads the target deployment from $TARGET_URL (e.g.
# http://localhost-studio.code.org:3000 for Drone, the test env for DTT) and
# runs every browser engine in playwright.config.ts (chromium, firefox, webkit).
#
# Non-blocking by contract: on failure it warns and exits non-zero, leaving each
# caller to report it without treating it as fatal.
#
# TODO: bake the browser install into the CI image / provision it via chef and
# drop the two install steps here.
set -euo pipefail

: "${TARGET_URL:?TARGET_URL must be set (e.g. http://localhost-studio.code.org:3000)}"

# Run from the package root (one level up from bin/) regardless of the caller's cwd.
cd "$(dirname "${BASH_SOURCE[0]}")/.."

trap 'echo "WARNING: Playwright e2e tests failed (non-blocking)"' ERR

echo "--- running Playwright e2e tests against $TARGET_URL (non-blocking) ---"

yarn install --immutable
# install-deps needs root/apt; best-effort so the suite still runs where the
# system libraries are already present. A genuinely missing library then
# surfaces as a browser-launch failure in the run below.
yarn exec playwright install-deps chromium firefox webkit || echo "WARN: playwright install-deps failed; continuing"
yarn exec playwright install chromium firefox webkit
yarn run test:ui:ci
