#!/usr/bin/env bash

# Script for running unit tests within a docker container.
# In most cases, you will not run this script directly, but instead
# use docker-compose to run using the unit-tests-compose.yml file in this directory. See instructions in that file.

set -xe

export CI=true
export RAILS_ENV=test
export RACK_ENV=test
export DISABLE_SPRING=1
export LD_LIBRARY_PATH=/usr/local/lib

mysql -V

# rbenv-doctor https://github.com/rbenv/rbenv-installer#readme
curl -fsSL https://github.com/rbenv/rbenv-installer/raw/master/bin/rbenv-doctor | bash

bundle install --verbose

# set up locals.yml
echo "
bundler_use_sudo: false
properties_encryption_key: $PROPERTIES_ENCRYPTION_KEY
cloudfront_key_pair_id: $CLOUDFRONT_KEY_PAIR_ID
cloudfront_private_key: \"$CLOUDFRONT_PRIVATE_KEY\"
ignore_eyes_mismatches: true
disable_all_eyes_running: true
use_my_apps: true
use_my_shared_js: true
build_blockly_core: true
build_shared_js: true
build_dashboard: true
build_pegasus: true
build_apps: true
localize_apps: true
dashboard_enable_pegasus: true
dashboard_workers: 5
skip_seed_all: true
" >> locals.yml

# name: rake install
RAKE_VERBOSE=true mispipe "bundle exec rake install" "ts '[%Y-%m-%d %H:%M:%S]'"

# name: rake build
RAKE_VERBOSE=true mispipe "bundle exec rake build --trace" "ts '[%Y-%m-%d %H:%M:%S]'"

# unit tests
bundle exec rake circle:run_tests --trace
