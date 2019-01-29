#!/usr/bin/env bash

# Script for running unit tests within a docker container.
# In most cases, you will not run this script directly, but instead
# use docker-compose to run using the unit-tests-compose.yml file in this directory. See instructions in that file.

set -xe

mispipe "echo 'Starting timestamp'" ts

export CI=true
export CIRCLECI=true
export CIRCLE_TEST_REPORTS=/home/circleci/project/test_reports
export CIRCLE_ARTIFACTS=/home/circleci/project/artifacts
export RAILS_ENV=test
export RACK_ENV=test
export DISABLE_SPRING=1
export LD_LIBRARY_PATH=/usr/local/lib

current_branch=$(git rev-parse --abbrev-ref HEAD)
git --no-pager diff --name-only $current_branch $(git merge-base $current_branch origin/staging)

mysql -V

# rbenv-doctor https://github.com/rbenv/rbenv-installer#readme
curl -fsSL https://github.com/rbenv/rbenv-installer/raw/master/bin/rbenv-doctor | bash

# unit tests
bundle exec rake circle:run_tests --trace

mispipe "echo 'Ending timestamp'" ts
