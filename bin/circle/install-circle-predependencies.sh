#!/usr/bin/env bash

# Add google-chrome source
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google.list

# Add yarn source
# See docs at https://yarnpkg.com/en/docs/install#linux
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list

# Retrieve updated source info only once
sudo apt-get update

# Update google chrome; Selenium requires that Chrome version must be >= 52.0.2743.0
sudo apt-get --only-upgrade install google-chrome-stable

# Install yarn
sudo apt-get install yarn=1.6.0-1

# CircleCI on Ubuntu 14 installs yarn 0.18.1 and has it early in the $PATH.
# Remove it so we can use the version of yarn we installed above.
rm /home/ubuntu/.yarn/bin/yarn
