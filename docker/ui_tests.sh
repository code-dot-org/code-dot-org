#!/usr/bin/env bash

# Script for running ui tests within a docker container.
# In most cases, you will not run this script directly, but instead
# use docker-compose to run using the ui-tests-compose.yml file in this directory. See instructions in that file.

set -xe

export CI=true
export CIRCLECI=true
export RAILS_ENV=test
export RACK_ENV=test
export DISABLE_SPRING=1
export LD_LIBRARY_PATH=/usr/local/lib
export CIRCLE_BUILD_NUM=$RANDOM$RANDOM
export CIRCLE_NODE_INDEX=1
export CIRCLE_TEST_REPORTS=/home/circleci/test_reports
export CIRCLE_ARTIFACTS=/home/circleci/artifacts

mkdir $CIRCLE_ARTIFACTS

# circle.rake has logic which depends on these branches existing. If we're doing a shallow clone, e.g.
# in a CI environment, then they don't exist by default.
if $(git rev-parse --is-shallow-repository); then
    git remote set-branches --add origin staging test production
    git remote show origin
    mispipe "git fetch --depth 50 origin staging test production" ts
    git branch -a
fi

mysql -V

# rbenv-doctor https://github.com/rbenv/rbenv-installer#readme
curl -fsSL https://github.com/rbenv/rbenv-installer/raw/master/bin/rbenv-doctor | bash

mispipe "bundle install --verbose" ts

# set up locals.yml
# Need to actually write all the commented out lines also
set +x
echo "
netsim_redis_groups:
- master: redis://ui-tests-redis:6379
bundler_use_sudo: false
properties_encryption_key: $PROPERTIES_ENCRYPTION_KEY
applitools_eyes_api_key: $APPLITOOLS_KEY
cloudfront_key_pair_id: $CLOUDFRONT_KEY_PAIR_ID
cloudfront_private_key: \"$CLOUDFRONT_PRIVATE_KEY\"
saucelabs_username: $SAUCE_USERNAME
saucelabs_authkey: $SAUCE_ACCESS_KEY
ignore_eyes_mismatches: true
disable_all_eyes_running: true
firebase_name: $FIREBASE_NAME
firebase_secret: $FIREBASE_SECRET
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
echo "Wrote secrets from env vars into locals.yml."
set -x

# name: rake install
RAKE_VERBOSE=true mispipe "bundle exec rake install" "ts '[%Y-%m-%d %H:%M:%S]'"

# name: rake build
RAKE_VERBOSE=true mispipe "bundle exec rake build --trace" "ts '[%Y-%m-%d %H:%M:%S]'"

# apply test settings for after unit tests
echo "
no_https_store: true
override_dashboard: \"localhost-studio.code.org\"
override_pegasus: \"localhost.code.org\"
dashboard_port: 3000
pegasus_port: 3000
animations_s3_directory: animations_circle/$CIRCLE_BUILD_NUM
assets_s3_directory: assets_circle/$CIRCLE_BUILD_NUM
files_s3_directory: files_circle/$CIRCLE_BUILD_NUM
sources_s3_directory: sources_circle/$CIRCLE_BUILD_NUM
" >> locals.yml

# name: seed ui tests
bundle exec rake circle:seed_ui_test

# name: run ui tests
bundle exec rake circle:run_ui_tests --trace
