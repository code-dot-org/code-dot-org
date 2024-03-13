#!/bin/bash

set -e

echo "Starting entrypoint.sh..."

eval "$(~/.rbenv/bin/rbenv init -)"

# Verify correct ruby version
current_ruby_version=$(ruby -v | awk '{print $2}' | sed 's/p[0-9]*//') # Remove any 'pXXX' suffix
echo "Ruby Version: ${current_ruby_version}"
required_ruby_version=$(cat .ruby-version)
if [ "${current_ruby_version}" != "${required_ruby_version}" ]; then
    echo "Error: Ruby version mismatch. Expected: ${required_ruby_version}, but was: ${current_ruby_version}."
    exit 1
fi

if [ "$1" = "delayed_job" ]; then
    echo "Starting ActiveJob delayed_job workers..."
    cd dashboard
    exec bin/delayed_job run
elif [ "$1" = "console" ]; then
    echo "Sleeping and waiting for you to exec into the container..."
    sleep infinity
else
    echo "You said $1, but I only know how to run 'delayed_job' or 'console'!"
fi