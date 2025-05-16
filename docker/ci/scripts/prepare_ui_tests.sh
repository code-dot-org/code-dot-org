#!/usr/bin/env bash

# Script for preparing ui tests within a docker container. Used by ui_tests.sh.

source docker/ci/scripts/prepare_tests_common.sh

ulimit -n 4096

export CI_JOB=ui_tests

# Update the locals.yml which was initialized by prepare_tests_common.sh with
# job-specific values
echo "
# UI test settings and secrets
override_dashboard: \"localhost-studio.code.org\"
override_pegasus: \"localhost.code.org\"
dashboard_port: 3000
pegasus_port: 3000
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
echo "Wrote UI-test-specific settings and secrets from env vars into locals.yml."

set -x

bundle install --quiet
bundle exec rake install
bundle exec rake build

bundle exec rake ci:seed_ui_test
