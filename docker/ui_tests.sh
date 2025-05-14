#!/usr/bin/env bash

# Script for running ui tests within a docker container.
# In most cases, you will not run this script directly, but instead use
# docker-compose to run using the ui-tests-compose.yml file in this directory.
# See instructions in that file.

source docker/prepare_ui_tests.sh

bundle exec rake ci:run_ui_tests
