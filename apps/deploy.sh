#!/usr/bin/env bash
# Exit on nonzero return value, always cd to script directory
set -e
cd -P -- "$(dirname -- "$0")"

# build/package tgz archive, returns filename output
FILE=$(npm pack | tail -n 1)

# Latest commit hash of any files in this subdirectory
REV=$(git log --pretty=format:%h -n 1 -- .)

aws s3 cp ./${FILE} s3://cdo-dist/cdo-apps/cdo-apps-build-${REV}.tgz
