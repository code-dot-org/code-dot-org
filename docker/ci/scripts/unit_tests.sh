#!/usr/bin/env bash

# Script for running unit tests within a docker container.
# In most cases, you will not run this script directly, but instead use
# docker-compose to run using the unit-tests-compose.yml file in this
# directory. See instructions in that file.

source docker/prepare_unit_tests.sh

bundle exec ruby tools/hooks/lint.rb origin/$CI_BASE_BRANCH $CI_HEAD_BRANCH
bundle exec rake ci:run_tests
