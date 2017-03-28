#!/bin/bash
set -x
git clone https://github.com/tc39/test262.git --depth 1 test/interpreter/test262
./node_modules/@code-dot-org/js-interpreter-tyrant/bin/run.js --threads 1 --run --diff --verbose --root test/interpreter
t1=$?
mv test/interpreter/test-results-new.json $CIRCLE_ARTIFACTS
exit $t1
