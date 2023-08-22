#!/usr/bin/env bash
if [[ $(/usr/bin/id -u) -ne 0 ]]; then
  echo "Not running as root"
  exit
fi

# Prior to update, manually execute
# https://github.com/code-dot-org/code-dot-org/blob/6ecb8f703e13f653d9659e56e98ae55ef49a892e/cookbooks/cdo-nodejs/recipes/default.rb#L40-L48
# because it expects to be executed with python 3.6, but the update will
# uninstall that and install python 3.8.
NODEJS_DIR="/usr/local/nodejs-source-18.16.0"
if [ -d "$NODEJS_DIR" ]; then
  (cd $NODEJS_DIR; make uninstall && rm -rf $NODEJS_DIR)
fi

# Explicitly mark a few packages as held.
#
# The mysql packages are important here; otherwise, the update will replace
# them with mysql 8, and we'll have to manually uninstall that and reinstall
# the desired versions.
#
# The magick packages are slightly less important; they are no longer
# supported by Ubuntu 20 and will be uninstalled, but can still be reinstalled.
#
# However, changes to either of these sets of packages will require the
# associated gems to be rebuilt with `gem pristine`, or they will fail to
# recognize the new libraries. To avoid that, hold both mysql and magick.
#
# TODO: what should we do for servers that only install a subset of these?
apt-mark hold mysql-server mysql-client;
apt-mark hold imagemagick libmagickcore-dev libmagickwand-dev;

# Final prepatory steps; do a full apt upgrade and reboot the server.
# https://ubuntu.com/server/docs/upgrade-introduction
# https://ubuntu.com/blog/how-to-upgrade-from-ubuntu-18-04-lts-to-20-04-lts-today
apt update;
apt upgrade --yes;
reboot;
