#!/bin/bash

# update google chrome; Selenium requires that Chrome version must
# be >= 52.0.2743.0
google-chrome --version
./bin/circle/upgrade-google-chrome.sh
google-chrome --version
# Install Yarn
sudo apt-key adv --keyserver pgp.mit.edu --recv D101F7899D41F3C3
echo "deb http://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update -qq
sudo apt-get install -y -qq yarn
