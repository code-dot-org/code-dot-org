#!/usr/bin/env bash
# Installs Yarn via apt-get
# See docs at https://yarnpkg.com/en/docs/install#linux

# Configure the repository
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list

# Install yarn
sudo apt-get update
sudo apt-get install yarn=0.16.1-1
