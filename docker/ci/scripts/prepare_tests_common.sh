#!/usr/bin/env bash

# Script for doing common preparation needed for all operations within a docker
# container. Used by prepare_ui_tests.sh and prepare_unit_tests.sh

set -e

export CI=true
export CI_BUILD_NUMBER=${CI_BUILD_NUMBER:-$RANDOM$RANDOM} # determines where test logs are stored in S3.
export CI_TEST_REPORTS=${CI_TEST_REPORTS:-/home/ci/test_reports}

export RAILS_ENV=test
export RACK_ENV=test
export DISABLE_SPRING=1
export LD_LIBRARY_PATH=/usr/local/lib

# Set up locals.yml with common values shared between all test environments.
echo "
# Shared settings and secrets
build_apps: true
build_dashboard: true
build_i18n: false
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
" >> locals.yml
echo "Wrote shared settings and secrets from env vars into locals.yml."
