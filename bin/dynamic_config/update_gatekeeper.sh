#!/bin/sh
SCRIPT=$(readlink -f $0)
SCRIPT_PATH=`dirname $SCRIPT`
FULL_CONFIG_PATH=`readlink -f "$1"`

cd $SCRIPT_PATH/../..
bundle exec ruby $SCRIPT_PATH/lib/update_gatekeeper.rb $FULL_CONFIG_PATH
