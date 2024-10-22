#!/bin/bash

# Read PATH from devcontainer defaults
. $HOME/.profile

set -x

git lfs pull && \
bundle exec rake install:hooks && \
bundle exec rake install:locals_yml && \
mysql -uroot -hdb < ../bootstrap-osx.sql && \
bundle exec rake package && \
cd apps && \
rm -rf node_modules && \
yarn install && \
yarn build && \
cd ..
cd dashboard && \
bin/rails db:migrate RAILS_ENV=development && \
cd ..
