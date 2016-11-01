#!/bin/bash
set -e # Exit on error

if [[ $# -lt 1 ]]; then
    echo "Usage: npm run codemod:es6-modules [PATH...]"
    exit 0;
fi

NODE_VERSION=`node --version | cut -c2`
if [[ $NODE_VERSION -lt 4 ]]; then
    echo "You must use node v4 or higher"
    exit 0;
fi

echo "Converting require statements to es6 import statements in $1"

jscodeshift -t ./node_modules/5to6-codemod/transforms/cjs.js $@

echo "Converting module.exports statements to es6 export statements in $1"
jscodeshift -t ./node_modules/5to6-codemod/transforms/exports.js $@
