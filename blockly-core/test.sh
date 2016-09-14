#!/bin/bash

# Make sure phantomjs 2+ is installed
if [ ! -x "`npm bin`/phantomjs" ]; then
  echo 'PhantomJS not found.  Run `npm install` from blockly-core first.'
  exit 1;
fi

# Use phantomjs to run the test page wrapper
cd tests
`npm bin`/phantomjs phantomwrapper.js
exit $?

