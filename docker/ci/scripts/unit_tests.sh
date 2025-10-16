#!/usr/bin/env bash

# Script for running unit tests within a docker container.
# Primarily used by our automated CI tests (ie, Drone; see `.drone.yml`), but
# you can use docker-compose to run locally using
# `docker/unit-tests-compose.yml`. See instructions in that file.

source docker/ci/scripts/prepare_unit_tests.sh

bundle exec ruby tools/hooks/lint.rb origin/$CI_BASE_BRANCH $CI_HEAD_BRANCH
bundle exec rake ci:run_tests
