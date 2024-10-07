#!/bin/bash

# Read PATH from devcontainer defaults
. $HOME/.profile

git lfs pull && \
bundle exec rake install:hooks && \
mysql -uroot -hdb < ../bootstrap-osx.sql && \
cd apps && \
yarn install && \
yarn build && \
cd .. && \
bundle exec rake package
