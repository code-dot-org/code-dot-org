#!/usr/bin/env bash

# Entrypoint script for running unit tests within a docker container.
# Start the container using docker-compose with the unit-tests-compose.yml file in the project root.
# (See comments at top of file for how to use docker-compose.)

set -xe

eval "$(rbenv init -)"
curl -fsSL https://github.com/rbenv/rbenv-installer/raw/main/bin/rbenv-doctor | bash

bundle install --verbose

echo "AWS_PROFILE is $AWS_PROFILE"
# aws sts get-caller-identity

bundle exec rake install:locals_yml --trace

bundle exec rake build --trace
