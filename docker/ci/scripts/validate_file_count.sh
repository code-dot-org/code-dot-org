#!/usr/bin/env bash
# Validates cached file count matches actual file count

if [ -f .cached-staging-build-file-count ]; then
  expected=$(cat .cached-staging-build-file-count)
  actual=$(find . -type f | wc -l)
  diff=$((actual - expected))
  [ "$expected" = "$actual" ] || printf 'WARN: File count mismatch. Expected: %s Actual: %s Diff: %s\n' "$expected" "$actual" "$diff"
fi
