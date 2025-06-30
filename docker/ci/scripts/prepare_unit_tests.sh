#!/usr/bin/env bash

# Script for preparing unit tests within a docker container. Used by
# unit_tests.sh.

source docker/ci/scripts/prepare_tests_common.sh

export CI_JOB=unit_tests

# Set up locals.yml. Note that this does have several values in common with UI
# tests, but DRYing this up creates more places you have to go looking for
# configuration information.
# TODO: move all of this into test.yml.erb
echo "
# Shared settings and secrets
build_apps: true
build_dashboard: true
build_pegasus: true
cloudfront_key_pair_id: $CLOUDFRONT_KEY_PAIR_ID
cloudfront_private_key: \"$CLOUDFRONT_PRIVATE_KEY\"
dashboard_db_reader: \"mysql://readonly@localhost/dashboard_test\"
dashboard_enable_pegasus: true
dashboard_workers: 5
disable_all_eyes_running: true
ignore_eyes_mismatches: true
localize_apps: true
use_my_apps: true
skip_seed_all: true

# Unit test settings and secrets
build_i18n: true
geocoder_redis_url: 'redis://unit-tests-redis:6379/0/geocoder'
optimize_rails_assets: false
optimize_webpack_assets: false
session_store_server: 'redis://unit-tests-redis:6379/0/session'
aiproxy_api_key: 'notarealkey'
" >> locals.yml
echo "Wrote settings and secrets from env vars into locals.yml."

set -x

bundle exec rake install
bundle exec rake build
