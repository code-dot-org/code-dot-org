#!/bin/bash

# Make sure phantomjs 2+ is installed
if [ ! -x "node_modules/phantomjs/bin/phantomjs" ]; then
  # Should just produce an error and quit here?
  npm install
fi

# Use phantomjs to run the test page wrapper
cd tests
../node_modules/phantomjs/bin/phantomjs phantomwrapper.js
exit $?

