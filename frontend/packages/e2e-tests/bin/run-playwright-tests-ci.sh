#!/usr/bin/env bash
#
#   run-playwright-tests-ci.sh functional   # all three browsers
#   run-playwright-tests-ci.sh eyes         # the @visual tests only
#
# Callers: lib/rake/ci.rake (Drone), lib/rake/test.rake (DTT).
#
# functional stops the build when it fails. eyes does not, because a person must
# approve each new image. They run as two processes to get two exit codes.
#
# Chef does not install the browsers. Each Playwright version needs its own
# browser version, and a cookbook change each time is too much work.
set -euo pipefail

suite="${1:?please choose a suite: functional or eyes}"
: "${TARGET_URL:?TARGET_URL must be set (e.g. http://localhost-studio.code.org:3000)}"

case "$suite" in
  functional)
    # Named, not default: the default set also has the visual-* projects.
    # Drone sets PLAYWRIGHT_BROWSERS from the commit tags, as it does for
    # Cucumber. Everywhere else runs all three.
    read -ra browsers <<< "${PLAYWRIGHT_BROWSERS:-chromium firefox webkit}"
    suite_args=()
    for browser in "${browsers[@]}"; do suite_args+=(--project="$browser"); done
    suffix=''
    ;;
  eyes)
    suite_args=(--grep @visual --project=visual-chromium)
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

yarn install --immutable
# Only the DTT daemon needs this. The other images have the browsers.
# install-deps is not here, because it reads apt each run.
if [ "${PLAYWRIGHT_PROVIDER:-}" = dtt ]; then
  yarn exec playwright install chromium firefox webkit
fi

# These variables replace the paths in playwright.config.ts.
PLAYWRIGHT_HTML_OUTPUT_DIR="$report_dir" \
PLAYWRIGHT_JSON_OUTPUT_FILE="$results_dir/results.json" \
  yarn run test:ui "${suite_args[@]}" --output="$results_dir"
