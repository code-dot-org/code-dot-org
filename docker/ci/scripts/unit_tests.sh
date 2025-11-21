#!/usr/bin/env bash

# Script for running unit tests within a docker container.
# Primarily used by our automated CI tests (ie, Drone; see `.drone.yml`), but
# you can use docker-compose to run locally using
# `docker/unit-tests-compose.yml`. See instructions in that file.

source docker/ci/scripts/prepare_ci_env.sh

bundle exec rake install

# Catch any zeitwerk code loader errors before starting any rails environment,
# in order to ensure that we give a clear error message for any zeitwerk issues
# that would block application load. Only do this in unit pipeline, since it
# runs faster than the ui pipeline, and running in just one pipeline is sufficient
# to make sure the developer sees a useful error message.
bundle exec rake lint:zeitwerk

bundle exec rake build

bundle exec ruby tools/hooks/lint.rb origin/$CI_BASE_BRANCH $CI_HEAD_BRANCH
bundle exec rake ci:run_tests
