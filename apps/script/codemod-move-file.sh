#!/bin/bash
set -e # Exit on error

if [[ $# -ne 2 ]]; then
    echo "Usage: npm run codemod:move-file [OLD_FILE_PATH] [NEW_FILE_PATH]"
    exit 0;
fi

NODE_VERSION=`node --version | cut -c2`
if [[ $NODE_VERSION -lt 4 ]]; then
    echo "You must use node v4 or higher"
    exit 0;
fi

TRANSFORMS_ROOT=`pwd`/node_modules/refactoring-codemods/lib/transformers
SRC_DIR=`pwd`/src
TEST_DIR=`pwd`/test

OLD_FILE_PATH=`pwd`/$1
NEW_FILE_PATH=`pwd`/$2

echo "Moving $OLD_FILE_PATH to $NEW_FILE_PATH."

mkdir -p "$(dirname "$NEW_FILE_PATH")"
mv $OLD_FILE_PATH $NEW_FILE_PATH

echo "Updating imports in $NEW_FILE_PATH"

jscodeshift -t $TRANSFORMS_ROOT/import-relative-transform.js $NEW_FILE_PATH --prevFilePath=$OLD_FILE_PATH --nextFilePath=$NEW_FILE_PATH

echo "Updating imports everywhere else"

find $SRC_DIR $TEST_DIR -name "*.js" -o -name "*.jsx" | xargs jscodeshift -t $TRANSFORMS_ROOT/import-declaration-transform.js --prevFilePath=$OLD_FILE_PATH --nextFilePath=$NEW_FILE_PATH
