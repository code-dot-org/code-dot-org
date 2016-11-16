#!/bin/bash

# Install any dependencies not covered by rake install
# When installing moreutils, make sure it does not overwrite GNU parallel,
# which CircleCI uses to capture artifacts.
sudo mv /usr/bin/parallel /usr/bin/gnu_parallel
sudo apt-get install libicu-dev enscript moreutils
sudo mv /usr/bin/gnu_parallel /usr/bin/parallel
bundle install --without ''
echo "bundler_use_sudo: false" >> locals.yml
echo "npm_use_sudo: false" >> locals.yml
echo "properties_encryption_key: $PROPERTIES_ENCRYPTION_KEY" >> locals.yml
echo "applitools_eyes_api_key: $APPLITOOLS_KEY" >> locals.yml
echo "saucelabs_username: $SAUCE_USERNAME" >> locals.yml
echo "saucelabs_authkey: $SAUCE_ACCESS_KEY" >> locals.yml
echo "ignore_eyes_mismatches: true" >> locals.yml
echo "disable_all_eyes_running: true" >> locals.yml
echo "firebase_name: $FIREBASE_NAME" >> locals.yml
echo "firebase_secret: $FIREBASE_SECRET" >> locals.yml
echo "use_my_apps: true" >> locals.yml
echo "use_my_shared_js: true" >> locals.yml
echo "build_blockly_core: true" >> locals.yml
echo "build_shared_js: true" >> locals.yml
echo "build_dashboard: true" >> locals.yml
echo "build_pegasus: true" >> locals.yml
echo "build_apps: true" >> locals.yml
echo "localize_apps: true" >> locals.yml
echo "sync_assets: false" >> locals.yml
echo "dashboard_enable_pegasus: true" >> locals.yml
echo "skip_seed_all: true" >> locals.yml
case $CIRCLE_NODE_INDEX in 0) echo "Skipping" ;; *) echo "use_dynamo_tables: false" >> locals.yml ;; esac
case $CIRCLE_NODE_INDEX in 0) echo "Skipping" ;; *) echo "use_dynamo_properties: false" >> locals.yml ;; esac
case $CIRCLE_NODE_INDEX in 0) echo "Skipping" ;; *) echo "no_https_store: true" >> locals.yml ;; esac
case $CIRCLE_NODE_INDEX in 0) echo "Skipping" ;; *) echo "override_dashboard: \"localhost-studio.code.org\"" >> locals.yml ;; esac
case $CIRCLE_NODE_INDEX in 0) echo "Skipping" ;; *) echo "override_pegasus: \"localhost.code.org\"" >> locals.yml ;; esac
case $CIRCLE_NODE_INDEX in 0) echo "Skipping" ;; *) echo "dashboard_port: 3000" >> locals.yml ;; esac
case $CIRCLE_NODE_INDEX in 0) echo "Skipping" ;; *) echo "pegasus_port: 3000" >> locals.yml ;; esac
yarn version -V
# For install and build, increase default 10 minute timeout to 14 minutes (840s)
# We use ts to timestamp output lines
# We use mispipe instead of | to exit with the first step's exit code
# Run rake install
timeout 840 /bin/bash -c 'RAKE_VERBOSE=true mispipe "bundle exec rake install" "ts \"[%Y-%m-%d %H:%M:%S]\""'

# Run rake build (twice in case of intermittent test failures within rake build)
# See notes above rake install for timeout, ts, and mispipe reasoning
timeout 840 /bin/bash -c 'for i in 1 2; do mispipe "bundle exec rake build" "ts \"[%Y-%m-%d %H:%M:%S]\"" && break; done'
# Update firebase security rules and config params. If these security rules change in a
# non-backward-compatible way, this may cause a new test run to make an older one fail.
rake firebase:ci
