#!/usr/bin/env bash
# Exit on nonzero return value, always cd to script directory
set -e
cd -P -- "$(dirname -- "$0")"

FILE=cdo-apps-build-0.0.1.tgz

# Latest commit hash of any files in this subfolder
REV=$(git log --pretty=format:%h -n 1 -- .)

aws s3 cp s3://cdo-dist/cdo-apps/cdo-apps-build-${REV}.tgz ./${FILE}

# 'npm pack' adds files and puts everything in a /package/ subfolder, so clean it up before extracting the .tgz
tar zxf ./${FILE} --transform=s,package/,, --exclude="package/package.json" --exclude="package/README.md" --exclude="package/LICENSE"
