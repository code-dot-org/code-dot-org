#!/usr/bin/env bash

# Script for running unit tests within a docker container.
# Primarily used by our automated CI tests (ie, Drone; see `.drone.yml`), but
# you can use docker-compose to run locally using
# `docker/unit-tests-compose.yml`. See instructions in that file.

source docker/ci/scripts/prepare_ci_tests.sh

# The install step is currently needed for unit (but not ui) because the database needed
# by ui tests is prepopulated by the cache-staging-build step.
# TODO: remove this line once cache-staging-build prepopulates dashboard unit test databases.
source docker/ci/scripts/install_ci_tests.sh

source docker/ci/scripts/build_ci_tests.sh


bundle exec ruby tools/hooks/lint.rb origin/$CI_BASE_BRANCH $CI_HEAD_BRANCH
bundle exec rake ci:run_tests
