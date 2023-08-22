#!/usr/bin/env bash
if [[ $(/usr/bin/id -u) -ne 0 ]]; then
  echo "Not running as root"
  exit
fi

# Unhold the packages we held prior to the update now that the
# update is finished.
# TODO: verify that doing this before chef-client doesn't
# break anything
apt-mark unhold mysql-server mysql-client;
apt-mark unhold imagemagick libmagickcore-dev libmagickwand-dev;

# Rerun chef build; this is at the very minimum required to reinstall node and
# resolve the "Can't connect to local MySQL server through socket" error we
# otherwise get.  The `do-release-upgrade` process also makes some undesired
# apt configuration changes, which this will revert as desired.
/opt/chef/bin/chef-client;

# Finally, run a regular build to get everything working again!
start-build;
