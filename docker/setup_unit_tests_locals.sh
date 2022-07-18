#!/usr/bin/env bash

# Script for setting up locals.yml in docker

# set up locals.yml
echo "
bundler_use_sudo: false
cloudfront_key_pair_id: $CLOUDFRONT_KEY_PAIR_ID
cloudfront_private_key: \"$CLOUDFRONT_PRIVATE_KEY\"
ignore_eyes_mismatches: true
disable_all_eyes_running: true
use_my_apps: true
build_dashboard: true
build_pegasus: true
build_apps: true
localize_apps: true
dashboard_enable_pegasus: true
dashboard_workers: 5
skip_seed_all: true
optimize_webpack_assets: false
optimize_rails_assets: false
google_maps_api_key: boguskey
" >> locals.yml
echo "Wrote secrets from env vars into locals.yml."
