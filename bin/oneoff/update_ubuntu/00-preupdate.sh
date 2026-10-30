#!/usr/bin/env bash
if [[ $(/usr/bin/id -u) -ne 0 ]]; then
  echo "Not running as root"
  exit
fi

set -e

# Final prepatory steps; do a full apt upgrade and reboot the server.
# https://ubuntu.com/server/docs/upgrade-introduction
# https://ubuntu.com/blog/how-to-upgrade-from-ubuntu-18-04-lts-to-20-04-lts-today
apt update;
apt upgrade --yes;
reboot;
