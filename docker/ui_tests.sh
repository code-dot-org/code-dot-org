#!/usr/bin/env bash

# Script for running ui tests within a docker container.
# In most cases, you will not run this script directly, but instead
# use docker-compose to run using the ui-tests-compose.yml file in this directory. See instructions in that file.

set -xe

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

# rbenv-doctor https://github.com/rbenv/rbenv-installer#readme
curl -fsSL https://github.com/rbenv/rbenv-installer/raw/master/bin/rbenv-doctor | bash

bundle install --verbose

# set up locals.yml
# Need to actually write all the commented out lines also
set +x
echo "
netsim_redis_groups:
- master: redis://ui-tests-redis:6379
bundler_use_sudo: false
properties_encryption_key: $PROPERTIES_ENCRYPTION_KEY
cloudfront_key_pair_id: $CLOUDFRONT_KEY_PAIR_ID
cloudfront_private_key: \"$CLOUDFRONT_PRIVATE_KEY\"
saucelabs_username: $SAUCE_USERNAME
saucelabs_authkey: $SAUCE_ACCESS_KEY
ignore_eyes_mismatches: true
disable_all_eyes_running: true
firebase_name: $FIREBASE_NAME
firebase_secret: $FIREBASE_SECRET
firebase_shared_secret: $FIREBASE_SHARED_SECRET
use_my_apps: true
build_dashboard: true
build_pegasus: true
build_apps: true
localize_apps: true
dashboard_enable_pegasus: true
dashboard_workers: 5
skip_seed_all: true
no_https_store: true
override_dashboard: \"localhost-studio.code.org\"
override_pegasus: \"localhost.code.org\"
dashboard_port: 3000
pegasus_port: 3000
animations_s3_directory: animations_circle/$CIRCLE_BUILD_NUM
assets_s3_directory: assets_circle/$CIRCLE_BUILD_NUM
files_s3_directory: files_circle/$CIRCLE_BUILD_NUM
sources_s3_directory: sources_circle/$CIRCLE_BUILD_NUM
libraries_s3_directory: libraries_circle/$CIRCLE_BUILD_NUM
" >> locals.yml
echo "Wrote secrets from env vars into locals.yml."
set -x

# name: rake install
RAKE_VERBOSE=true bundle exec rake install --trace

# name: rake build
RAKE_VERBOSE=true bundle exec rake build --trace

# name: seed ui tests
bundle exec rake circle:seed_ui_test --trace

# name: run ui tests
bundle exec rake circle:run_ui_tests --trace
