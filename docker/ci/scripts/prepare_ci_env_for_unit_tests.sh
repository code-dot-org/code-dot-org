#!/usr/bin/env bash

# Script for doing common preparation needed for all operations within a docker
# container in order to run CI tests.

set -e

export CI=true
export CI_BUILD_NUMBER=${CI_BUILD_NUMBER:-$RANDOM$RANDOM} # determines where test logs are stored in S3.
export CI_TEST_REPORTS=${CI_TEST_REPORTS:-/home/ci/test_reports}

export RAILS_ENV=test
export RACK_ENV=test
export DISABLE_SPRING=1
export LD_LIBRARY_PATH=/usr/local/lib

# Number of parallel processes for dashboard ruby unit tests,
# optimized for drone m7i.4xlarge workers with 16 vCPUs and 64 GB RAM.
export PARALLEL_TEST_PROCESSORS=7

# Apps build parallelization settings for CI
# optimized for drone m7i.4xlarge workers with 16 vCPUs and 64 GB RAM.
export APPS_BUILD_WORKERS=10
export APPS_BUILD_MAX_MEMORY=16384

# Install in deployment mode, both to better mirror the test server and to make
# caching easier.
bundle config set --local deployment 'true'
bundle install --quiet

# Disable Pegasus content based on the exit code of the rake task.
if bundle exec rake ci:sparse_checkout; then
  echo "Full checkout – HAS_PEGASUS_CONTENT not set"
else
  # Nest this check inside the outer `if` block to ensure that a non-zero exit
  # code from the rake task does not cause this script to exit immediately.
  exit_code=$?
  if [ "$exit_code" -eq 11 ]; then
    export HAS_PEGASUS_CONTENT=false
    echo "Sparse checkout – HAS_PEGASUS_CONTENT set to false"
  else
    echo "Unexpected exit code from ci:sparse_checkout: $exit_code"
    exit 1
  fi
fi

ulimit -n 16000

# Set up locals.yml.
# TODO: move all of this into test.yml.erb
echo "
build_apps: true
build_dashboard: true
build_pegasus: true
cloudfront_key_pair_id: $CLOUDFRONT_KEY_PAIR_ID
cloudfront_private_key: \"$CLOUDFRONT_PRIVATE_KEY\"
contentful_cs_for_all_access_token: $CONTENTFUL_CS_FOR_ALL_ACCESS_TOKEN
dashboard_db_reader: \"mysql://readonly@localhost/dashboard_test\"
dashboard_enable_pegasus: true
dashboard_workers: 5
disable_all_eyes_running: true
ignore_eyes_mismatches: true
localize_apps: true
use_my_apps: true
skip_seed_all: true
override_dashboard:
override_pegasus:
build_i18n: true
animations_s3_directory: animations_circle/$CI_BUILD_NUMBER
assets_s3_directory: assets_circle/$CI_BUILD_NUMBER
files_s3_directory: files_circle/$CI_BUILD_NUMBER
libraries_s3_directory: libraries_circle/$CI_BUILD_NUMBER
sources_s3_directory: sources_circle/$CI_BUILD_NUMBER
redis_url: 'redis://ci-tests-redis:6379/0'
no_https_store: true
netsim_redis_groups:
- master: redis://ci-tests-redis:6379
saucelabs_authkey: $SAUCE_ACCESS_KEY
saucelabs_username: $SAUCE_USERNAME
saucelabs_tunnel_name: cdo-tunnel-$CI_BUILD_NUMBER
properties_encryption_key: $PROPERTIES_ENCRYPTION_KEY
aiproxy_api_key: 'fake_key'
" >> locals.yml
echo "Wrote settings and secrets from env vars into locals.yml."

set -x
