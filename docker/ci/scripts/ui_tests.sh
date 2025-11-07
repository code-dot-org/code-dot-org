#!/usr/bin/env bash

# Script for running ui tests within a docker container.
# Primarily used by our automated CI tests (ie, Drone; see `.drone.yml`), but
# you can use docker-compose to run locally using
# `docker/ui-tests-compose.yml`. See instructions in that file.

source docker/ci/scripts/prepare_ci_tests.sh

# Set up trap to dump Sauce Connect log on exit (success or failure)
function dump_sc_log() {
  if [ -f log/sc.log ]; then
    echo "Sauce Connect log:"
    cat log/sc.log
  fi
}
trap dump_sc_log EXIT

bundle exec rake ci:run_ui_tests
