#!/usr/bin/env bash

# Script for running ui tests within a docker container.
# In most cases, you will not run this script directly, but instead
# use docker-compose to run using the ui-tests-compose.yml file in this directory. See instructions in that file.


set -e

ulimit -n 4096

export CI=true
export CI_JOB=ui_tests
export RAILS_ENV=test
export RACK_ENV=test
export DISABLE_SPRING=1
export LD_LIBRARY_PATH=/usr/local/lib
# If CI_BUILD_NUMBER is not set, set it to a random number. CI_BUILD_NUMBER determines where UI test cucumber logs are stored in S3.
if [ -z "$CI_BUILD_NUMBER" ]; then
  CI_BUILD_NUMBER="$RANDOM$RANDOM"
fi
export CI_TEST_REPORTS=/home/circleci/test_reports
export CI_ARTIFACTS=/home/circleci/artifacts

mkdir $CI_ARTIFACTS

# set up locals.yml
# Need to actually write all the commented out lines also
echo "
animations_s3_directory: animations_circle/$CI_BUILD_NUMBER
assets_s3_directory: assets_circle/$CI_BUILD_NUMBER
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
files_s3_directory: files_circle/$CI_BUILD_NUMBER
ignore_eyes_mismatches: true
libraries_s3_directory: libraries_circle/$CI_BUILD_NUMBER
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
saucelabs_tunnel_name: cdo-tunnel-$CI_BUILD_NUMBER
session_store_server: 'redis://ui-tests-redis:6379/0/session'
skip_seed_all: true
sources_s3_directory: sources_circle/$CI_BUILD_NUMBER
use_my_apps: true
aiproxy_api_key: 'fake_key'
" >> locals.yml
echo "Wrote secrets from env vars into locals.yml."

set -x

bundle install --quiet
bundle exec rake install
bundle exec rake build

bundle exec rake circle:seed_ui_test
bundle exec rake circle:run_ui_tests
