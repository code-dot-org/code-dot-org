#!/bin/bash

if [[ $1 == "debug" ]]; then
  export MOOC_DEV=1
fi

(
  if [[ ( -d "../blockly-core" ) && ( -d "../apps" ) ]] ; then
    cd ../blockly-core
    ./deploy.sh $1
  else
    echo "Skipping core. No ../blockly-core"
  fi
)

(
  if [ -d "../apps" ] ; then
    cd ../apps
    npm install
    grunt build
  else
    echo "Skipping blockly. No ../apps"
  fi
)
