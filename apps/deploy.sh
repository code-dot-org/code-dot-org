#!/usr/bin/env bash
# Exit on nonzero return value, always cd to script directory
set -e
cd -P -- "$(dirname -- "$0")"

export NODE_ENV="production"
# build/package tgz archive, returns filename output
npm install
FILE=$(npm pack | tail -n 1)

# Latest commit hash of any files in this subdirectory or blockly-core
REV=$(git log --pretty=format:%h -n 1 -- . ../blockly-core)

aws s3 cp ./${FILE} s3://cdo-dist/cdo-apps/cdo-apps-build-${REV}.tgz
