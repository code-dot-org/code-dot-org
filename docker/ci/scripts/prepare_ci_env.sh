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

ulimit -n 16000

set -x
