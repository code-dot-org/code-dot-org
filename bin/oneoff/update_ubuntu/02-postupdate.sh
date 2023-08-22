#!/usr/bin/env bash
if [[ $(/usr/bin/id -u) -ne 0 ]]; then
	echo "Not running as root"
	exit
fi

# Rerun chef build; this is at the very minimum required to resolve the "Can't
# connect to local MySQL server through socket" error we otherwise get.  The
# `do-release-upgrade` process also makes some undesired apt configuration
# changes, which this will revert as desired.
/opt/chef/bin/chef-client;

# Finally, run a regular build to get everything working again!
start-build;
