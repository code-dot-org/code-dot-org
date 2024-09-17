#!/usr/bin/env bash

# Script for running ui tests within a docker container.
# In most cases, you will not run this script directly, but instead
# use docker-compose to run using the ui-tests-compose.yml file in this directory. See instructions in that file.


set -e

ulimit -n 4096

export CI=true
export CIRCLECI=true
export RAILS_ENV=test
export RACK_ENV=test
export DISABLE_SPRING=1
export LD_LIBRARY_PATH=/usr/local/lib
# If running on Drone.io, DRONE_BUILD_NUMBER will be set: https://docs.drone.io/reference/environ/drone-build-number/
# otherwise, use a random number instead. CIRCLE_BUILD_NUM determines where UI test cucumber logs are stored in S3.
export CIRCLE_BUILD_NUM=${DRONE_BUILD_NUMBER:-$RANDOM$RANDOM}
export CIRCLE_NODE_INDEX=1
export CIRCLE_TEST_REPORTS=/home/circleci/test_reports
export CIRCLE_ARTIFACTS=/home/circleci/artifacts

mkdir $CIRCLE_ARTIFACTS

# set up locals.yml
# Need to actually write all the commented out lines also
echo "
animations_s3_directory: animations_circle/$CIRCLE_BUILD_NUM
assets_s3_directory: assets_circle/$CIRCLE_BUILD_NUM
build_apps: true
build_dashboard: true
build_i18n: false
build_pegasus: true
bundler_use_sudo: false
cloudfront_key_pair_id: $CLOUDFRONT_KEY_PAIR_ID
cloudfront_private_key: \"$CLOUDFRONT_PRIVATE_KEY\"
dashboard_db_reader: \"mysql://readonly@localhost/dashboard_test\"
dashboard_enable_pegasus: true
dashboard_port: 3000
dashboard_workers: 5
disable_all_eyes_running: true
files_s3_directory: files_circle/$CIRCLE_BUILD_NUM
ignore_eyes_mismatches: true
libraries_s3_directory: libraries_circle/$CIRCLE_BUILD_NUM
localize_apps: true
netsim_redis_groups:
- master: redis://ui-tests-redis:6379
no_https_store: true
override_dashboard: \"localhost-studio.code.org\"
override_pegasus: \"localhost.code.org\"
pegasus_port: 3000
properties_encryption_key: $PROPERTIES_ENCRYPTION_KEY
saucelabs_authkey: $SAUCE_ACCESS_KEY
saucelabs_username: $SAUCE_USERNAME
session_store_server: 'redis://ui-tests-redis:6379/0/session'
skip_seed_all: true
sources_s3_directory: sources_circle/$CIRCLE_BUILD_NUM
use_my_apps: true
aiproxy_api_key: 'fake_key'
" >> locals.yml
echo "Wrote secrets from env vars into locals.yml."

set -x

bundle install --quiet
bundle exec rake install
bundle exec rake build

# reprint the hostname in case the first printing has already been truncated by the drone UI
hostname=$(curl -s --max-time 3 http://169.254.169.254/latest/meta-data/public-hostname || echo $DRONE_RUNNER_HOSTNAME); echo "Running on $hostname"

bundle exec rake circle:seed_ui_test
bundle exec rake circle:run_ui_tests
