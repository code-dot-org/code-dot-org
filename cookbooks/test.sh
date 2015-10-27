#!/bin/bash

# Run cookbook integration tests using Chef Kitchen.
# `cut -c7-` removes './cdo-' from start of name
TEST_COOKBOOKS=$(dirname `find -name .kitchen.yml` | cut -c7-)

# Only run 'kitchen verify' on cookbooks matching part of the current branch name.
for i in ${TEST_COOKBOOKS}; do
  if $(echo ${CIRCLE_BRANCH} | grep -q ${i}); then
    bundle install -j`nproc`
    (cd cdo-${i}; bundle exec kitchen verify)
  fi
done
