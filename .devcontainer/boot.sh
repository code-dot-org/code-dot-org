#!/bin/bash

# Read PATH from devcontainer defaults
. $HOME/.profile

# Install PDM
pdm install

#bundle install
#. ${NVM_DIR}/nvm.sh && nvm install --lts
#yarn install

#cd activerecord

#MYSQL_CODESPACES=1 bundle exec rake db:mysql:rebuild