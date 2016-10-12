#!/bin/bash -e
DIR=$(dirname "$0")

# Run the frontend deploy process, exiting if any line exits with non-zero error code.

# Remove the frontend from load balancer rotation before running the commands,
# so that the git pull doesn't modify files out from under a running instance.
${DIR}/deregister_from_elb.sh

pushd ${DIR}/../..
git pull --ff-only
sudo bundle install
rake build
popd

${DIR}/register_with_elb.sh
