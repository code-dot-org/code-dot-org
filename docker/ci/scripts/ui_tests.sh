#!/usr/bin/env bash

# Script for running ui tests within a docker container.
# Primarily used by our automated CI tests (ie, Drone; see `.drone.yml`), but
# you can use docker-compose to run locally using
# `docker/ui-tests-compose.yml`. See instructions in that file.

source docker/ci/scripts/prepare_ci_env.sh

# Skip rake install in ui pipeline. This is safe because we've already run rake install
# in the cache-staging-build pipeline, and the ui pipeline re-uses that cache.

cd dashboard
echo "starting timed seed tasks"
time bundle exec rake seed:timed
time bundle exec rake seed:timed
echo "Finished timed seed tasks"
# bundle exec rake build
# bundle exec rake ci:seed_ui_test
# bundle exec rake ci:run_ui_tests
