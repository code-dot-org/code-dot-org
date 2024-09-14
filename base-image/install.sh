#!/usr/bin/env bash

# echo all commands
set -x

sudo apt-get update

# Install dependencies for Ruby, Node, Git LFS, MySQL, and other libraries
sudo apt-get install -y \
  ruby-full \
  build-essential \
  libssl-dev \
  zlib1g-dev \
  libreadline-dev \
  libyaml-dev \
  libsqlite3-dev \
  sqlite3 \
  libxml2-dev \
  libxslt1-dev \
  libcurl4-openssl-dev \
  software-properties-common \
  libffi-dev \
  git-lfs \
  python3-pip \
  libmysqlclient-dev \
  yarn \
  curl

# Install Ruby version 3.0.5 using RVM
sudo apt-add-repository ppa:rael-gc/rvm
sudo apt-get update
sudo apt-get install rvm
rvm install 3.0.5
rvm use 3.0.5 --default

# Install Node.js version 18.16.0
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git LFS version 3.0
sudo apt-get install -y git-lfs
git lfs install

# Install Python PDM version 2.1.7
pip install pdm==2.1.7

# Install Bundler 2.3.2.2
gem install bundler -v 2.3.2.2

# Install Yarn (if not already installed)
curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install yarn

