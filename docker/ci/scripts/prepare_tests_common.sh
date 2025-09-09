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
