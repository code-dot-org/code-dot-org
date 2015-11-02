#!/bin/sh

FULL_CONFIG_PATH=`readlink -f "$1"`
cd /home/ubuntu/adhoc/dashboard
bundle exec ruby /home/ubuntu/dynamic_config/lib/update_gatekeeper.rb $FULL_CONFIG_PATH
cd -
