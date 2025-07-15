#!/usr/bin/env bash
if [[ $(/usr/bin/id -u) -ne 0 ]]; then
  echo "Not running as root"
  exit
fi

set -e

# Upgrade apt packages following the distro upgrade
apt update;
apt upgrade --yes;

# Reinstall rmagick to resolve the error:
#   This installation of RMagick was configured with ImageMagick 6.9.10 but
#   ImageMagick 6.9.11-60 is in use.
bundle exec gem uninstall rmagick;
bundle install;

# Run a regular build once we're done to get everything working again!
echo "after the server reboots, kick off a regular build with something like 'start-build'";

reboot;
