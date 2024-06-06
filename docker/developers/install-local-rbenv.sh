#!/bin/bash
set -e

# This script works alongside the assumptions make in the Dockerfile to support
# updating a containerized install of rbenv/Ruby for use within the container.

if [ "$(hostname)" != 'install-rbenv' ]; then
	echo "This is meant to run inside the docker compose context."
	echo "Run with: 'docker compose run install-rbenv'"
	exit 1
fi

echo "Installing rbenv into the Docker 'rbenv' volume."

# Copy over a pre-built copy of rbenv first set up by the Dockerfile
if [ ! -e ${HOME}/.rbenv/versions ]; then
  cp -r /opt/base-rbenv/* ${HOME}/.rbenv/.
fi

# Initialize this copy of rbenv and make sure it has the requested version of ruby
eval "$(rbenv init -)"
RUBY_VERSION=`cat .ruby-version`
rbenv install ${RUBY_VERSION} -s # -s : skip if it already exists
rbenv global $(RUBY_VERSION)     # Sets the 'version' file to the wanted version
