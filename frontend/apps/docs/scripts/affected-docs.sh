#!/usr/bin/env bash
# List documentation pages whose evidence references files changed between two revisions.
# Usage: affected-docs.sh <old-rev> <new-rev>
set -euo pipefail

if [ $# -ne 2 ]; then
  echo "Usage: $0 <old-rev> <new-rev>" >&2
  exit 1
fi

old="$1"
new="$2"
root="$(git rev-parse --show-toplevel)"
evidence_dir="$root/.docs-evidence"

changed=$(git diff --name-only "$old" "$new")

find "$evidence_dir" -name '*.json' -type f | sort | while read -r efile; do
  rel="${efile#"$evidence_dir"/}"
  page="${rel%.json}.md"
  sources=$(jq -r '.sources[]? // empty' "$efile" 2>/dev/null || true)
  for src in $sources; do
    if echo "$changed" | grep -qF "$src"; then
      echo "$page"
      continue 2
    fi
  done
done
