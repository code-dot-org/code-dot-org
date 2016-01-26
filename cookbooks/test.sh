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
    (cd cdo-${i}; KITCHEN_LOCAL_YAML=.kitchen.ci.yml bundle exec kitchen verify)
  fi
done

# When the commit has '[REVIEW]' in the latest commit message,
# deploy a 'review app' using Test Kitchen ec2 config and setup_dns script.
if git log --format="%B" -1 | grep -i "\[REVIEW\]" -q || true; then
  (cd cdo-apps; \
    KITCHEN_LOCAL_YAML=.kitchen.ec2.yml bundle exec kitchen verify) && \
    HOST=$(ruby -r yaml -e "puts YAML.load_file('cdo-apps/.kitchen/default-ubuntu-1404.yml')['hostname']") && \
    (cd ../aws; RAILS_ENV=adhoc ./setup_dns ${HOST})
fi
