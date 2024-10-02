#!/bin/bash

# Read PATH from devcontainer defaults
. $HOME/.profile

# Install PDM
pdm install

bundle exec rake dashboard:setup_db

cd apps
yarn install
yarn build
cd ..