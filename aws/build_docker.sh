#!/bin/bash
# Run this script to build a Docker image using Packer.
set -e

# Download and install Packer to a temp directory.
PACKER_VERSION=0.8.6
PACKER_URL="https://releases.hashicorp.com/packer/${PACKER_VERSION}/packer_${PACKER_VERSION}_linux_amd64.zip"
mkdir /tmp/packer
curl -sSL ${PACKER_URL} | bsdtar -xkqf- -C /tmp/packer
chmod +x /tmp/packer/*

export PATH=${PATH}:/tmp/packer

(cd ../cookbooks; bundle exec berks vendor .berkshelf)
BRANCH=$(git rev-parse --abbrev-ref HEAD)
ROOT=$(dirname ${PWD})
PACKER_LOG=1 packer build -var "branch=${BRANCH}" -var "root=${ROOT}" -only='docker' packer.json
