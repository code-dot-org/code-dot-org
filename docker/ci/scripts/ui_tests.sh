#!/usr/bin/env bash

# Script for running ui tests within a docker container.
# Primarily used by our automated CI tests (ie, Drone; see `.drone.yml`), but
# you can use docker-compose to run locally using
# `docker/ui-tests-compose.yml`. See instructions in that file.

source docker/ci/scripts/prepare_ci_env.sh

# Skip rake install in ui pipeline. This is safe because we've already run rake install
# in the cache-staging-build pipeline, and the ui pipeline re-uses that cache.

bundle exec rake build
bundle exec rake ci:seed_ui_test
bundle exec rake ci:run_ui_tests

# Puma is still live from ci:run_ui_tests; run the Playwright e2e suite against
# it. Non-blocking: a failure here warns but does not fail the pipeline.
echo "--- running Playwright e2e tests (non-blocking) ---"
if ! frontend/packages/e2e-tests/bin/run-playwright-tests-ci.sh http://localhost-studio.code.org:3000; then
  echo "WARNING: Playwright e2e tests failed (non-blocking)"
fi
