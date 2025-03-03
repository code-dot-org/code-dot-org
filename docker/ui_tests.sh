#!/usr/bin/env bash

# Script for running ui tests within a docker container.
# In most cases, you will not run this script directly, but instead
# use docker-compose to run using the ui-tests-compose.yml file in this directory. See instructions in that file.

set -e

ulimit -n 4096

export CI=true
export CI_JOB=ui_tests
export CI_BUILD_NUMBER=${CI_BUILD_NUMBER:-$RANDOM$RANDOM} # determines where test logs are stored in S3.
export CI_TEST_REPORTS=${CI_TEST_REPORTS:-/home/ci/test_reports}

export RAILS_ENV=test
export RACK_ENV=test
export DISABLE_SPRING=1
export LD_LIBRARY_PATH=/usr/local/lib

set -x

bundle install --quiet
bundle exec rake install
bundle exec rake build

bundle exec rake ci:seed_ui_test
bundle exec rake ci:run_ui_tests
