#!/usr/bin/env bash
#
# Run the e2e Playwright suite against a target URL, installing the browser
# binaries at runtime. Shared by the Drone `ui` pipeline
# (docker/ci/scripts/ui_tests.sh) and the DTT `test:playwright_ui` rake task
# (lib/rake/test.rake) so the install+run sequence lives in one place.
#
# Usage: run-playwright-tests-ci.sh <target-url>
#
# Runs every browser engine configured in playwright.config.ts (chromium,
# firefox, webkit). Exits non-zero if any step fails; both callers treat a
# non-zero exit as non-blocking (warn, don't fail the job).
#
# TODO: bake the browser install into the CI image / provision it via chef and
# drop the two install steps here.
set -euo pipefail

target_url="${1:?usage: run-playwright-tests-ci.sh <target-url>}"

# Run from the package root (one level up from bin/) regardless of the caller's cwd.
cd "$(dirname "${BASH_SOURCE[0]}")/.."

yarn install --immutable
# install-deps needs root/apt; best-effort so the suite still runs where the
# system libraries are already present (e.g. the DTT test server). A genuinely
# missing library then surfaces as a browser-launch failure in the run below.
yarn exec playwright install-deps chromium firefox webkit || echo "WARN: playwright install-deps failed; continuing"
yarn exec playwright install chromium firefox webkit
TARGET_URL="$target_url" yarn run test:ui:ci
