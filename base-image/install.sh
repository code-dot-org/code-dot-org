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

# Install Ruby version 3.0.5 from Ubuntu's official repositories
sudo apt-get install -y ruby=1:3.0.5

# Install Node.js version 18.16.0 using NodeSource's official repository
wget https://deb.nodesource.com/setup_18.x -O nodesource_setup.sh
sudo bash nodesource_setup.sh
sudo apt-get install -y nodejs=18.16.0-1nodesource1

# Install Git LFS version 3.0
sudo apt-get install -y git-lfs
git lfs install

# Install Python PDM version 2.1.7
pip install pdm==2.1.7

# Install Bundler 2.3.22
gem install bundler -v 2.3.22

# Install Yarn (if not already installed)
sudo apt-get install -y yarn

# Verify versions
ruby -v
node -v
yarn -v
bundler -v
git-lfs --version
