#!/usr/bin/env bash

set -e

ulimit -n 4096

export CI=true
export CIRCLECI=true
export RAILS_ENV=test
export RACK_ENV=test
export DISABLE_SPRING=1
export LD_LIBRARY_PATH=/usr/local/lib

# rbenv-doctor https://github.com/rbenv/rbenv-installer#readme
curl -fsSL https://github.com/rbenv/rbenv-installer/raw/main/bin/rbenv-doctor | bash

set -x

bundle install --quiet
bundle exec rake install
bundle exec rake lint
