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

# Enable jemalloc, both for memory optimization and parity with our deployed
# application. Configuration options based on the defaults used in chef (see
# cookbooks/cdo-jemalloc/attributes/default.rb), with the notable exception of
# `background_thread:true` since that breaks chromedriver (see
# https://issues.chromium.org/issues/378077860).
export LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libjemalloc.so.2
export MALLOC_CONF=narenas:2,thp:never,dirty_decay_ms:1000,muzzy_decay_ms:0

# Number of parallel processes for dashboard ruby unit tests,
# optimized for drone m7i.4xlarge workers with 16 vCPUs and 64 GB RAM.
# We ran into OOM errors with 7, and get a persistent unexplained failure in
# test_summarize_with_numbered_units#UnitGroupTest with 5, so 6 is our
# Goldilocks number.
export PARALLEL_TEST_PROCESSORS=6

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
