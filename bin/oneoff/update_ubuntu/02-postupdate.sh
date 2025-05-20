#!/usr/bin/env bash
if [[ $(/usr/bin/id -u) -ne 0 ]]; then
  echo "Not running as root"
  exit
fi

set -e

# On an adhoc, the mysql 'root' user's password got reset, so we need to
# reassign it to the desired value.
# TODO: figure out what we should do here for our build pipeline servers
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';";

# Reinstall rmagick to resolve the error:
#   This installation of RMagick was configured with ImageMagick 6.9.10 but
#   ImageMagick 6.9.11-60 is in use.
bundle exec gem uninstall rmagick;
bundle install;

# Finally, run a regular build to get everything working again!
echo "now kick off a regular build with something like 'start-build'";
