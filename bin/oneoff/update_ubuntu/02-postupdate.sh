#!/usr/bin/env bash
if [[ $(/usr/bin/id -u) -ne 0 ]]; then
  echo "Not running as root"
  exit
fi

set -e

bundle exec gem uninstall rmagick;
bundle install;

# Finally, run a regular build to get everything working again!
echo "now kick off a regular build with something like 'start-build'";
