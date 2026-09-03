#!/usr/bin/env bash

set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
locale_file="$repo_root/dashboard/config/locales/base/ar-SA.yml"
lfs_pointer_header='version https://git-lfs.github.com/spec/v1'

if [[ ! -f "$locale_file" ]]; then
  echo "required locale file is missing: $locale_file" >&2
  exit 1
fi

if [[ "$(head -n 1 "$locale_file")" != "$lfs_pointer_header" ]]; then
  exit 0
fi

echo "Fetching Git LFS locale files required by cdo-rails..."
git -C "$repo_root" lfs pull --include='dashboard/config/locales/**'

if [[ "$(head -n 1 "$locale_file")" == "$lfs_pointer_header" ]]; then
  echo "Git LFS left a pointer in place: $locale_file" >&2
  exit 1
fi
