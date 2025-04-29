#!/usr/bin/env bash
if [[ $(/usr/bin/id -u) -ne 0 ]]; then
  echo "Not running as root"
  exit
fi

set -e

apt-mark unhold libffi7;

# The staging server needed a manual apt upgrade after the distro upgrade;
# we're not sure why. See thread at
# https://codedotorg.slack.com/archives/C03CK49G9/p1745435644898249 for details
apt update;
apt upgrade --yes;
reboot;

# On an adhoc, the mysql 'root' user's password got reset, so we need to
# reassign it to the desired value.
# We did not need to do this on the staging server.
# mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';";

# Reinstall rmagick to resolve the error:
#   This installation of RMagick was configured with ImageMagick 6.9.10 but
#   ImageMagick 6.9.11-60 is in use.
bundle exec gem uninstall rmagick;
bundle install;

# The staging server also needed openssl1.1 to be reinstalled; we were able to
# do so with ruby-build. See thread at
# https://codedotorg.slack.com/archives/C0T0PNTM3/p1745506129199449 for details
# TODO: see if we can hold the package prior to upgrade instead
ruby-build 3.0.5 /usr/local;

# Finally, run a regular build to get everything working again!
echo "now kick off a regular build with something like 'start-build'";
