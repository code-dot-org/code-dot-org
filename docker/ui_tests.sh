#!/usr/bin/env bash

# Script for running ui tests within a docker container.
# In most cases, you will not run this script directly, but instead
# use docker-compose to run using the ui-tests-compose.yml file in this directory. See instructions in that file.

set -xe

export CI=true
export CIRCLECI=true
export RAILS_ENV=test
export RACK_ENV=test
export DISABLE_SPRING=1
export LD_LIBRARY_PATH=/usr/local/lib
export CIRCLE_BUILD_NUM=$RANDOM$RANDOM
export CIRCLE_NODE_INDEX=1
export CIRCLE_TEST_REPORTS=/home/circleci/test_reports
export CIRCLE_ARTIFACTS=/home/circleci/artifacts

mkdir $CIRCLE_ARTIFACTS

mysql -V

# rbenv-doctor https://github.com/rbenv/rbenv-installer#readme
curl -fsSL https://github.com/rbenv/rbenv-installer/raw/master/bin/rbenv-doctor | bash


# apply test settings for after unit tests
echo "
no_https_store: true
override_dashboard: \"localhost-studio.code.org\"
override_pegasus: \"localhost.code.org\"
dashboard_port: 3000
pegasus_port: 3000
animations_s3_directory: animations_circle/$CIRCLE_BUILD_NUM
assets_s3_directory: assets_circle/$CIRCLE_BUILD_NUM
files_s3_directory: files_circle/$CIRCLE_BUILD_NUM
sources_s3_directory: sources_circle/$CIRCLE_BUILD_NUM
" >> locals.yml

# name: seed ui tests
bundle exec rake circle:seed_ui_test

# name: run ui tests
bundle exec rake circle:run_ui_tests --trace
