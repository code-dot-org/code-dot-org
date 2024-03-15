#!/bin/bash

# set -e

BRANCH="test"

echo "starting with arguments $@"

# Loop over arguments
for arg in "$@"; do
  case $arg in
    -b|--branch)
      BRANCH="$2"
      shift
      ;;
  esac
  shift
done

echo "Building images for branch: $BRANCH"

# Build the minimal image, which doesn't require the local context.
docker build -f Dockerfile_minimal -t code-dot-org/minimal:latest .

# Build the repo_baseline image
# This image will clone the repo, so we're skipping it by default and using the latest available image.
docker build -f Dockerfile_repo_baseline -t code-dot-org/repo_baseline:latest .

# Build the application image
# This will `git pull` on top of the repo baseline image.
docker build -f Dockerfile_app --build-arg BRANCH=$BRANCH -t code-dot-org/app-$BRANCH:latest .
