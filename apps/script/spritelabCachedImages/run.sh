#!/bin/bash
# Bundles one of the scripts here for Node and runs it. The scripts import
# the lab's own prompt and manifest modules through the @cdo/* aliases, which
# tsc's paths give esbuild; node_modules stay external, so the bundle lives
# under apps/build where Node resolves them.
#
#   ./script/spritelabCachedImages/run.sh generate --help
#   ./script/spritelabCachedImages/run.sh manifest --help
set -euo pipefail
cd "$(dirname "$0")/../.."
command=$1
shift
mkdir -p build/spritelabCachedImages
./node_modules/.bin/esbuild "script/spritelabCachedImages/$command.ts" \
  --bundle --platform=node --target=node20 --format=cjs \
  --packages=external --tsconfig=tsconfig.build.json \
  --outfile="build/spritelabCachedImages/$command.js" --log-level=warning
exec node "build/spritelabCachedImages/$command.js" "$@"
