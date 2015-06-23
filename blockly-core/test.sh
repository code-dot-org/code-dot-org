#!/bin/bash
cd tests

# Make sure phantomjs 2+ is installed
phantomjsversion=$(node_modules/phantomjs/bin/phantomjs --version)
if [ $phantomjsversion != "2.0.0" ]; then
  npm install
fi

# Use phantomjs to run the test page wrapper
node_modules/phantomjs/bin/phantomjs phantomwrapper.js
exit $?

