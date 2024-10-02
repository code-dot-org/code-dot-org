#!/bin/bash

# Read PATH from devcontainer defaults
. $HOME/.profile

bundle exec rake install
bundle exec rake package

cd dashboard
bundle exec rake dashboard:setup_db
cd ..

cd apps
yarn install
yarn build
cd ..