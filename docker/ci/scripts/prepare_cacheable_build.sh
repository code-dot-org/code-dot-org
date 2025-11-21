#!/usr/bin/env bash

source docker/ci/scripts/prepare_ci_env.sh

bundle exec rake install
bundle exec rake build
bundle exec rake ci:seed_ui_test

