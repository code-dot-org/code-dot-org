#!/bin/bash

if [[ $1 == "debug" ]]; then
  export target=uncompressed.js
  export MOOC_DEV=1
else
  export target=blockly_compressed.js
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
