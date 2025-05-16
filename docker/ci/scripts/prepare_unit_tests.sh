#!/usr/bin/env bash

# Script for preparing unit tests within a docker container. Used by
# unit_tests.sh.

source docker/ci/scripts/prepare_tests_common.sh

export CI_JOB=unit_tests

# Update the locals.yml which was initialized by prepare_tests_common.sh with
# job-specific values
echo "
# Unit test settings and secrets
google_maps_api_key: boguskey
geocoder_redis_url: 'redis://unit-tests-redis:6379/0/geocoder'
optimize_rails_assets: false
optimize_webpack_assets: false
session_store_server: 'redis://unit-tests-redis:6379/0/session'
aiproxy_api_key: 'notarealkey'
" >> locals.yml
echo "Wrote unit-test-specific settings and secrets from env vars into locals.yml."

set -x

bundle install --quiet
bundle exec rake install
bundle exec rake build
