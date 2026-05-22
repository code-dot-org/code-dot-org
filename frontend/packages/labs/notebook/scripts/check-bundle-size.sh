#!/usr/bin/env bash
# check-bundle-size.sh — verify the notebook-lab chunk gzip size stays ≤ 350 KB.
#
# Excludes Pyodide assets, video.js, qrcode, and OpenDyslexic font from the
# accounting because those are fetched lazily and are not part of the initial
# bundle.  Run after `yarn workspace @code-dot-org/notebook-lab build`.
#
# Exit 0 on success; exit 1 when any chunk exceeds the budget.

set -euo pipefail

DIST_DIR="$(cd "$(dirname "$0")/.." && pwd)/dist/assets"
LIMIT_BYTES=358400  # 350 KiB in bytes (350 * 1024)

if [[ ! -d "$DIST_DIR" ]]; then
  echo "ERROR: dist/assets not found — run 'yarn workspace @code-dot-org/notebook-lab build' first" >&2
  exit 1
fi

# Patterns excluded from the budget (lazily loaded / independently cached).
EXCLUDE_RE='(pyodide|video\.js|qrcode|OpenDyslexic)'

fail=0
total_gz=0

while IFS= read -r -d '' file; do
  basename="$(basename "$file")"
  if echo "$basename" | grep -qiE "$EXCLUDE_RE"; then
    continue
  fi

  gz_bytes="$(gzip -c "$file" | wc -c)"
  total_gz=$((total_gz + gz_bytes))

  if [[ "$gz_bytes" -gt "$LIMIT_BYTES" ]]; then
    printf "FAIL  %-60s  %d KB (limit %d KB)\n" "$basename" "$((gz_bytes / 1024))" "$((LIMIT_BYTES / 1024))"
    fail=1
  else
    printf "ok    %-60s  %d KB\n" "$basename" "$((gz_bytes / 1024))"
  fi
done < <(find "$DIST_DIR" -maxdepth 1 \( -name '*.js' -o -name '*.css' \) -print0)

echo ""
echo "Total (excl. excluded): $((total_gz / 1024)) KB"

if [[ "$fail" -ne 0 ]]; then
  echo "Bundle size check FAILED — one or more chunks exceed ${LIMIT_BYTES} bytes gzip." >&2
  exit 1
fi

echo "Bundle size check passed."
