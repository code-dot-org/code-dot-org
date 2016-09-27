#!/bin/bash
set -e # Exit on error

if [[ $# -lt 1 ]]; then
    echo "Usage: npm run codemod:es6-modules [PATH...]"
    exit 0;
fi

echo "Converting require statements to es6 import statements in $1"
echo "If this doesn't work, make sure you are using node>4"


jscodeshift -t ./node_modules/5to6-codemod/transforms/cjs.js $@

echo "Converting module.exports statements to es6 export statements in $1"
jscodeshift -t ./node_modules/5to6-codemod/transforms/exports.js $@
