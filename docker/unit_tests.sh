#!/usr/bin/env bash

# Script for running unit tests within a docker container.
# In most cases, you will not run this script directly, but instead
# use docker-compose to run using the unit-tests-compose.yml file in this directory. See instructions in that file.

set -xe

mispipe "echo 'Starting timestamp'" ts

export CI=true
export RAILS_ENV=test
export RACK_ENV=test
export DISABLE_SPRING=1
export LD_LIBRARY_PATH=/usr/local/lib

mispipe "bundle install --verbose" ts

# set up locals.yml
set +x
echo "
bundler_use_sudo: false
cloudfront_key_pair_id: $CLOUDFRONT_KEY_PAIR_ID
cloudfront_private_key: \"$CLOUDFRONT_PRIVATE_KEY\"
ignore_eyes_mismatches: true
disable_all_eyes_running: true
use_my_apps: true
build_dashboard: true
build_pegasus: true
build_apps: true
localize_apps: true
dashboard_enable_pegasus: true
dashboard_workers: 5
skip_seed_all: true
optimize_webpack_assets: false
optimize_rails_assets: false
google_maps_api_key: boguskey
" >> locals.yml
echo "Wrote secrets from env vars into locals.yml."
set -x

# name: rake install
RAKE_VERBOSE=true mispipe "bundle exec rake install --trace" "ts '[%Y-%m-%d %H:%M:%S]'"

# name: rake build
RAKE_VERBOSE=true mispipe "bundle exec rake build --trace" "ts '[%Y-%m-%d %H:%M:%S]'"

# unit tests
bundle exec rake circle:run_tests --trace

mispipe "echo 'Ending timestamp'" ts
