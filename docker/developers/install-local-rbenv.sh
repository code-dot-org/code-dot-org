#!/bin/bash
set -e

# This script works alongside the assumptions make in the Dockerfile to support
# updating a containerized install of rbenv/Ruby for use within the container.

if [ "$(hostname)" != 'install-rbenv' ]; then
	echo "This is meant to run inside the docker compose context."
	echo "Run with: 'docker compose run install-rbenv'"
	exit 1
fi

echo "Installing rbenv into the Docker 'rbenv' volume..."

# Copy over a pre-built copy of rbenv first set up by the Dockerfile
if [ ! -e ${HOME}/.rbenv/versions ]; then
  cp -r /opt/base-rbenv/* ${HOME}/.rbenv/.
fi

# Initialize this copy of rbenv and make sure it has the requested version of ruby
echo " - Initializing rbenv into this environment..."
eval "$(rbenv init -)"

RUBY_VERSION=`cat .ruby-version`
echo " - Attempting to install Ruby version ${RUBY_VERSION} as indicated by \`.ruby-version\`..."
rbenv install ${RUBY_VERSION} -s # -s : skip if it already exists
rbenv global ${RUBY_VERSION}     # Sets the 'version' file to the wanted version

echo " - Listing current global version..."
CHECK_VERSION=`rbenv global`
echo "   - rbenv reports: ${CHECK_VERSION}"
if [[ "${RUBY_VERSION}" == "${CHECK_VERSION}" ]]; then
  echo "   - OK!"
else
  echo "   - FAIL!"
  exit 1
fi

echo
echo "Done."
