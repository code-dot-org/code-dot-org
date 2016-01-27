#!/bin/bash
# Run this script to build a Docker image using Packer.
set -e

(cd ../cookbooks; bundle exec berks vendor .berkshelf)
BRANCH=$(git rev-parse --abbrev-ref HEAD)
ROOT=$(dirname ${PWD})
PACKER_LOG=1 ./packer build -debug -var "branch=${BRANCH}" -var "root=${ROOT}" -only='docker' packer.json
