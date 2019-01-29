#!/usr/bin/env bash

# Script for running ui tests within a docker container.
# In most cases, you will not run this script directly, but instead
# use docker-compose to run using the ui-tests-compose.yml file in this directory. See instructions in that file.

set -xe

export CI=true
export RAILS_ENV=test
export RACK_ENV=test
export DISABLE_SPRING=1
export LD_LIBRARY_PATH=/usr/local/lib
export CIRCLE_TEST_REPORTS=/home/circleci/test_reports
export CIRCLE_ARTIFACTS=/home/circleci/artifacts

mispipe "bundle install --verbose" ts

# set up locals.yml
set +x
echo "
netsim_redis_groups:
- master: redis://ui-tests-redis:6379
bundler_use_sudo: false
properties_encryption_key: $PROPERTIES_ENCRYPTION_KEY
applitools_eyes_api_key: $APPLITOOLS_KEY
cloudfront_key_pair_id: $CLOUDFRONT_KEY_PAIR_ID
cloudfront_private_key: \"$CLOUDFRONT_PRIVATE_KEY\"
saucelabs_username: $SAUCE_USERNAME
saucelabs_authkey: $SAUCE_ACCESS_KEY
ignore_eyes_mismatches: true
disable_all_eyes_running: true
firebase_name: $FIREBASE_NAME
firebase_secret: $FIREBASE_SECRET
use_my_apps: true
use_my_shared_js: true
build_blockly_core: true
build_shared_js: true
build_dashboard: true
build_pegasus: true
build_apps: true
localize_apps: true
dashboard_enable_pegasus: true
dashboard_workers: 5
skip_seed_all: true
" >> locals.yml
echo "Wrote secrets from env vars into locals.yml."
set -x

# name: rake install
RAKE_VERBOSE=true mispipe "bundle exec rake install" "ts '[%Y-%m-%d %H:%M:%S]'"

# name: rake build
RAKE_VERBOSE=true mispipe "bundle exec rake build --trace" "ts '[%Y-%m-%d %H:%M:%S]'"
