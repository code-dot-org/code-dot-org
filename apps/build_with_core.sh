#!/bin/bash

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

    if [[ $1 == "debug" ]]; then
      npm run build
    else
      npm run build:dist
    fi
  else
    echo "Skipping blockly. No ../apps"
  fi
)
