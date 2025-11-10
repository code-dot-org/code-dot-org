#!/usr/bin/env bash
# Validates that cache restore completed successfully by checking:
#   1. .git directory integrity
#   2. File count (experimental)

set -e

# Check 1: Git directory integrity
if [ -d .git ]; then
  if git rev-parse --git-dir > /dev/null 2>&1; then
    echo "✓ .git directory is valid"
  else
    echo "ERROR: .git directory present but CORRUPT"
    exit 1
  fi
else
  echo "ERROR: .git directory not found"
  exit 1
fi

# Check 2: File count (experimental)
if [ -f .cache-staging-build-file-count ]; then
  EXPECTED=$(cat .cache-staging-build-file-count)
  ACTUAL=$(find . -type f | wc -l)

  if [ "$EXPECTED" = "$ACTUAL" ]; then
    echo "✓ File count matches: $ACTUAL files"
  else
    echo "========================================="
    echo "WARNING: Cache file count mismatch"
    echo "  Expected: $EXPECTED files"
    echo "  Actual:   $ACTUAL files"
    echo "  Difference: $((ACTUAL - EXPECTED))"
    echo "========================================="
  fi
else
  echo "WARNING: .cache-staging-build-file-count not found"
fi
