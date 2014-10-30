#!/bin/bash

if [[ $1 == "debug" ]]; then
  export MOOC_DEV=1
fi

(
  if [[ ( -d "../blockly-core" ) && ( -d "../blockly" ) ]] ; then
    cd ../blockly-core
    ./deploy.sh $1
  else
    echo "Skipping core. No ../blockly-core"
  fi
)

(
  if [ -d "../blockly" ] ; then
    cd ../blockly
    npm install
    grunt build
  else
    echo "Skipping blockly. No ../blockly"
  fi
)
