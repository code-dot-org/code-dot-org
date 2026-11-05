#!/bin/bash

# Runs a turbo task (`build` by default) over the `frontend` packages that `apps` consumes. Run from `apps`.

set -x

# Finds all apps dependencies which are portaled `frontend` packages. Then convert them to turborepo filters to scope which packages to build.
APPS_DEPENDENCIES=($(node --print '
  Object.entries(require("./package.json").dependencies)
    .filter(([, version]) => version.startsWith("portal:../frontend"))
    .map(([name]) => `--filter=${name}`)
    .join(" ")
'))

cd ../frontend || exit 1

case "$1" in
  --watch)
    # watch mode skips `yarn` install
    exec yarn turbo watch build "${APPS_DEPENDENCIES[@]}" --output-logs errors-only
    ;;
  "" | build)
    # Cleans dependent packages before Webpack starts to remove stale outputs then rebuilds it. This is a one time operation performed during the intial start of `apps` yarn start.
    yarn && \
    yarn run clean "${APPS_DEPENDENCIES[@]}" --output-logs errors-only && \
    yarn run build "${APPS_DEPENDENCIES[@]}" --output-logs errors-only
    ;;
  *)
    yarn run "$1" "${APPS_DEPENDENCIES[@]}" --output-logs errors-only
    ;;
esac
