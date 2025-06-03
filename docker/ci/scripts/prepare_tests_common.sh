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

bundle exec rake ci:sparse_checkout

# Example file which will not be present if pegasus content is omitted
# via sparse checkout.
EXAMPLE_FILE="pegasus/sites.v3/code.org/homepage.json"

# Disable Pegasus content if the example file is not present.
if [ -f "$EXAMPLE_FILE" ]; then
  echo "Pegasus homepage.json present"
else
  export HAS_PEGASUS_CONTENT=false
  echo "Pegasus homepage.json missing – HAS_PEGASUS_CONTENT set to false"
fi
