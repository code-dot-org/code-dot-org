#!/usr/bin/env bash

# Script for running unit tests within a docker container.
# Primarily used by our automated CI tests (ie, Drone; see `.drone.yml`), but
# you can use docker-compose to run locally using
# `docker/unit-tests-compose.yml`. See instructions in that file.

source docker/ci/scripts/prepare_ci_env.sh

bundle exec rake install

# Run lint only in unit pipeline. Run before rake build in order to ensure
# that we give a clear error message for any zeitwerk issues that would block
# application load.
bundle exec rake lint:zeitwerk
bundle exec ruby tools/hooks/lint.rb origin/$CI_BASE_BRANCH $CI_HEAD_BRANCH

# Run Brakeman security scanner
# Fail the build if any security warnings are found
echo "=============================================="
echo "=== BRAKEMAN SECURITY SCAN ==="
echo "=============================================="
cd dashboard
# Run Brakeman security scanner
# Override config file to output plain text warnings to stdout (not HTML file)
# --no-progress: Suppress verbose file-by-file progress output (no "236/481 files processed")
# --format plain: Output plain text format (overrides config's HTML format)
# --output /dev/stdout: Output warnings to stdout (overrides config's file output)
# --quiet: Suppress informational messages (check list, etc.)
# --exit-on-warn: Fail build if warnings found
if ! bundle exec brakeman --add-checks-path lib/brakeman/checks --format plain --no-pager --no-progress --quiet --output /dev/stdout --exit-on-warn 2>&1; then
  echo ""
  echo "=============================================="
  echo "=== BRAKEMAN SECURITY SCAN FAILED ==="
  echo "=============================================="
  echo "Security vulnerabilities detected! Build stopped."
  echo "Fix the issues above before proceeding."
  echo "=============================================="
  exit 1
fi
cd ..
echo "=============================================="
echo "=== BRAKEMAN SECURITY SCAN PASSED ==="
echo "=============================================="
echo ""

bundle exec rake build
bundle exec rake ci:run_unit_tests
