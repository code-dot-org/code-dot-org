#!/bin/bash

# Copy k8s/mimic/code-dot-org to k8s/mimic/cdo-no-symlinks for use as
# the docker context for mimic. Symlinks are replaced with real file copies.
#
# We do this because docker cannot follow symlinks outside its root context.
#
# This script is automatically invoked by skaffold before building the mimic
# docker images.

set -e
cd "$(dirname "$0")/.."

dont_copy_dirs=(.venv .yarn/cache)
excludes=()
for d in "${dont_copy_dirs[@]}"; do
  excludes+=(--exclude="$d")
done

rsync -aL --delete "${excludes[@]}" code-dot-org/ cdo-no-symlinks
