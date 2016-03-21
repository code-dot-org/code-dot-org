#!/bin/bash

# Run cookbook integration tests using Chef Kitchen.
# `cut -c7-` removes './cdo-' from start of name
TEST_COOKBOOKS=$(find -name .kitchen.yml | cut -c7- | xargs -n1 dirname)

# Extra step to prepare CloudFront integration-test environment for cdo-varnish cookbook.
if [[ ${CIRCLE_BRANCH} =~ "varnish" ]]; then
  RAILS_ENV=integration ../aws/cloudfront/update_cloudfront
fi

# Only run 'kitchen verify' on cookbooks matching part of the current branch name.
for i in ${TEST_COOKBOOKS}; do
  if [[ ${CIRCLE_BRANCH} =~ ${i} ]]; then
    bundle install -j`nproc`
    (cd cdo-${i}; bundle exec kitchen verify -l debug)
  fi
done
