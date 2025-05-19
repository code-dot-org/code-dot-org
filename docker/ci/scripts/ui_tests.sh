#!/usr/bin/env bash

# Script for running ui tests within a docker container.
# In most cases, you will not run this script directly, but instead use
# docker-compose to run using the ui-tests-compose.yml file in this directory.
# See instructions in that file.

source docker/ci/scripts/prepare_ui_tests.sh

[[ -f dashboard/db/ui_test_data.sql ]] && mysql -u root < dashboard/db/ui_test_data.sql

bundle exec rake ci:run_ui_tests
