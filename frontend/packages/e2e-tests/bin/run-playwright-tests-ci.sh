#!/usr/bin/env bash
#
#   run-playwright-tests-ci.sh functional   # all three browsers
#   run-playwright-tests-ci.sh eyes         # the @visual tests only
#
# Callers: lib/rake/ci.rake (Drone), lib/rake/test.rake (DTT).
#
# This script runs the Playwright functional and eyes test suites. During a DTT,
# both test suites run and will block the DTT on failure. For drone, functional
# tests are blocking but the eyes tests are run in warning mode until we can
# develop a visual diff strategy for PRs.
#
# Dependencies and browsers are installed by rake test:playwright_install, once,
# because the DTT runs both suites at the same time in this directory.
set -euo pipefail

suite="${1:?please choose a suite: functional or eyes}"
: "${TARGET_URL:?TARGET_URL must be set (e.g. http://localhost-studio.code.org:3000)}"

case "$suite" in
  functional)
    # Run the three functional browsers by default when PLAYWRIGHT_BROWSERS is unspecified
    browsers=(${PLAYWRIGHT_BROWSERS:-chromium firefox webkit})
    suite_args=()
    for browser in "${browsers[@]}"; do suite_args+=(--project="$browser"); done
    suffix=''
    ;;
  eyes)
    # The project already carries grep: /@visual/, so --grep would be redundant.
    suite_args=(--project=visual-chromium)
    suffix='-eyes'
    ;;
  *)
    echo "usage: $(basename "$0") [functional|eyes]" >&2
    # 64 is EX_USAGE from sysexits.h: the arguments were wrong.
    exit 64
    ;;
esac

# Both suites run here. Equal names would lose the first report.
report_dir="playwright-report$suffix"
results_dir="test-results$suffix"

cd "$(dirname "${BASH_SOURCE[0]}")/.."

trap 'echo "WARNING: the Playwright $suite tests failed"' ERR

echo "--- running the Playwright $suite tests against $TARGET_URL ---"

# So an aborted run cannot be reported as this one.
rm -rf "$report_dir" "$results_dir"

# These variables replace the paths in playwright.config.ts.
PLAYWRIGHT_HTML_OUTPUT_DIR="$report_dir" \
PLAYWRIGHT_JSON_OUTPUT_FILE="$results_dir/results.json" \
  yarn run test:ui "${suite_args[@]}" --output="$results_dir"
