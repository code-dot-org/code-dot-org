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

bundle exec rake build

# After rake build: eslint and the frontend linters come from the node_modules
# it installs, and nothing before it has installed them from a fresh clone.
bundle exec ruby tools/hooks/lint.rb origin/$CI_BASE_BRANCH $CI_HEAD_BRANCH

bundle exec rake ci:run_unit_tests
