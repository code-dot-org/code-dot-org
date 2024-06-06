#!/bin/bash
set -e

# This script works alongside the assumptions make in the Dockerfile to support
# updating a containerized install of NVM/Node/npm for use within the container.

if [ "$(hostname)" != 'install-nvm' ]; then
	echo "This is meant to run inside the docker compose context."
	echo "Run with: 'docker compose run install-nvm'"
	exit 1
fi

echo "Installing nvm into the Docker 'nvm' volume."

# Copy over a pre-built copy of nvm
if [ ! -e ${HOME}/.nvm/package.json ]; then
  cp -r /opt/base-nvm/* ${HOME}/.nvm/.
fi

# Initialize NVM
. ${HOME}/.nvm/nvm.sh

# Determine the desired node version
NODE_VERSION=`jq -r .engines.node < apps/package.json | sed "s/[\^]//g"`
echo "Installing node v${NODE_VERSION}"
nvm install ${NODE_VERSION}
nvm alias default ${NODE_VERSION}
nvm use default

# Install the correct version of NPM
NPM_VERSION=`jq -r .engines.npm < apps/package.json | sed "s/[\^]//g"`
echo "Installing npm v${NPM_VERSION}"
npm install -g npm@${NPM_VERSION}

# Install Yarn
YARN_NPM_VERSION=1.22.19
YARN_VERSION=`jq -r .packageManager < apps/package.json | sed "s/^yarn@//" | sed "s/[\^]//g"`
echo "Installing yarn v${YARN_NPM_VERSION} (bootstrapped from npm)"
npm i -g yarn@${YARN_NPM_VERSION}
