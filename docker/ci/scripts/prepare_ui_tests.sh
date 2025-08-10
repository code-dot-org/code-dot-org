#!/usr/bin/env bash

# Script for preparing ui tests within a docker container. Used by ui_tests.sh.

source docker/ci/scripts/prepare_tests_common.sh

ulimit -n 4096

export CI_JOB=ui_tests

# Set up locals.yml. Note that this does have several values in common with
# unit tests, but DRYing this up creates more places you have to go looking for
# configuration information.
# TODO: move all of this into test.yml.erb
echo "
# Shared settings and secrets
build_apps: true
build_dashboard: true
build_pegasus: true
bundler_use_sudo: false
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

# UI test settings and secrets
override_dashboard: \"localhost-studio.code.org\"
override_pegasus: \"localhost.code.org\"
dashboard_port: 3000
pegasus_port: 3000
build_i18n: false
animations_s3_directory: animations_circle/$CI_BUILD_NUMBER
assets_s3_directory: assets_circle/$CI_BUILD_NUMBER
files_s3_directory: files_circle/$CI_BUILD_NUMBER
libraries_s3_directory: libraries_circle/$CI_BUILD_NUMBER
sources_s3_directory: sources_circle/$CI_BUILD_NUMBER
session_store_server: 'redis://ui-tests-redis:6379/0/session'
no_https_store: true
netsim_redis_groups:
- master: redis://ui-tests-redis:6379
saucelabs_authkey: $SAUCE_ACCESS_KEY
saucelabs_username: $SAUCE_USERNAME
saucelabs_tunnel_name: cdo-tunnel-$CI_BUILD_NUMBER
properties_encryption_key: $PROPERTIES_ENCRYPTION_KEY
aiproxy_api_key: 'fake_key'
" >> locals.yml
echo "Wrote settings and secrets from env vars into locals.yml."

set -x

bundle exec rake install
bundle exec rake build

bundle exec rake ci:seed_ui_test
