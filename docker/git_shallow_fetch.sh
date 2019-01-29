#!/usr/bin/env bash

set -xe

# circle.rake has logic which depends on these branches existing. If we're doing a shallow clone, e.g.
# in a CI environment, then they don't exist by default.
if $(git rev-parse --is-shallow-repository); then
    git remote set-branches --add origin staging test production
    git remote show origin
    mispipe "git fetch --depth 50 origin staging test production" ts
    git branch -a
fi
