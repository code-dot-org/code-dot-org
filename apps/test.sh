#!/bin/bash

# Skip tests if the current branch's diff-tree compared to its staging merge-base doesn't touch any files in /apps.
# Always run tests if the current branch is 'staging'.

BRANCH=$(git rev-parse --abbrev-ref HEAD)
BRANCH_COMMIT=$(git merge-base HEAD refs/remotes/origin/staging)
if [ ${BRANCH} == 'staging' ] || git diff-tree HEAD ${BRANCH_COMMIT} --name-only | grep -q "^apps$"; then
  npm run lint && \
  for i in 1 2; do grunt mochaTest --grep solutions/applab --invert && break; done && \
  for i in 1 2; do grunt mochaTest --grep solutions/applab && break; done
fi
