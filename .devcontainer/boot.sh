#!/bin/bash

# Read PATH from devcontainer defaults
. $HOME/.profile

# Install PDM
pdm install

cd dashboard
bundle exec rake dashboard:setup_db
cd ..

cd apps
yarn install
yarn build
cd ..