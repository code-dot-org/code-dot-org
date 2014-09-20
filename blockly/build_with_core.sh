#!/bin/bash

if [[ $1 == "debug" ]]; then
  export target=blockly_uncompressed.js
  export MOOC_DEV=1
else
  export target=blockly_compressed.js
fi

(
  if [[ ( -d "../blockly-core" ) && ( -d "../blockly" ) ]] ; then
    cd ../blockly-core
    ./deploy.sh $1
    cp $target ../blockly/lib/blockly
    cp javascript_compressed.js ../blockly/lib/blockly
    cp blocks_compressed.js ../blockly/lib/blockly
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
