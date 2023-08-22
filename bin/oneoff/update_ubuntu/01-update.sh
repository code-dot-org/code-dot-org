#!/usr/bin/env bash
if [[ $(/usr/bin/id -u) -ne 0 ]]; then
	echo "Not running as root"
	exit
fi

# Then, perform the upgrade!
do-release-upgrade -f DistUpgradeViewNonInteractive;
