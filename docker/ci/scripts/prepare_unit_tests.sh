#!/usr/bin/env bash

# Script for preparing unit tests within a docker container. Used by
# unit_tests.sh.

set -e

export CI=true
export CI_JOB=unit_tests
export CI_BUILD_NUMBER=${CI_BUILD_NUMBER:-$RANDOM$RANDOM} # determines where test logs are stored in S3.
export CI_TEST_REPORTS=${CI_TEST_REPORTS:-/home/ci/test_reports}

export RAILS_ENV=test
export RACK_ENV=test
export DISABLE_SPRING=1
export LD_LIBRARY_PATH=/usr/local/lib

# set up locals.yml
echo "
build_apps: true
build_dashboard: true
build_i18n: true
build_pegasus: true
bundler_use_sudo: false
cloudfront_key_pair_id: $CLOUDFRONT_KEY_PAIR_ID
cloudfront_private_key: \"$CLOUDFRONT_PRIVATE_KEY\"
dashboard_db_reader: \"mysql://readonly@localhost/dashboard_test\"
dashboard_enable_pegasus: true
dashboard_workers: 5
disable_all_eyes_running: true
google_maps_api_key: boguskey
geocoder_redis_url: 'redis://unit-tests-redis:6379/0/geocoder'
ignore_eyes_mismatches: true
localize_apps: true
optimize_rails_assets: false
optimize_webpack_assets: false
session_store_server: 'redis://unit-tests-redis:6379/0/session'
skip_seed_all: true
use_my_apps: true
aiproxy_api_key: 'notarealkey'
" >> locals.yml
echo "Wrote secrets from env vars into locals.yml."

set -x

bundle install --quiet
bundle exec rake install
bundle exec rake build
