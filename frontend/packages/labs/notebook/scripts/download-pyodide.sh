#!/usr/bin/env bash
# Download Pyodide runtime assets into public/pyodide/.
#
# Only pyodide.mjs, the wasm/data blobs, and version.txt are fetched.
# The binaries are gitignored; only this script + version.txt are committed.
#
# Usage: bash scripts/download-pyodide.sh [VERSION]
# Default VERSION is read from public/pyodide/version.txt if present.

set -euo pipefail

SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT_DIR="$SCRIPT_DIR/../public/pyodide"

VERSION="${1:-}"
VERSION_FILE="$OUT_DIR/version.txt"

if [[ -z "$VERSION" ]]; then
  if [[ -f "$VERSION_FILE" ]]; then
    VERSION="$(cat "$VERSION_FILE")"
  else
    echo "ERROR: No version specified and $VERSION_FILE not found." >&2
    echo "Usage: bash scripts/download-pyodide.sh <version>  (e.g. 0.27.0)" >&2
    exit 1
  fi
fi

BASE_URL="https://cdn.jsdelivr.net/pyodide/v${VERSION}/full"

ASSETS=(
  pyodide.mjs
  pyodide.asm.wasm
  pyodide.asm.js
  pyodide-lock.json
  python_stdlib.zip
)

mkdir -p "$OUT_DIR"
echo "$VERSION" > "$VERSION_FILE"

echo "[download-pyodide] Fetching Pyodide $VERSION into $OUT_DIR"
for asset in "${ASSETS[@]}"; do
  dest="$OUT_DIR/$asset"
  if [[ -f "$dest" ]]; then
    echo "  skip  $asset (already present)"
    continue
  fi
  echo "  fetch $asset"
  curl -fsSL --output "$dest" "$BASE_URL/$asset"
done
echo "[download-pyodide] Done."
