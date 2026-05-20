#!/usr/bin/env bash
# Compare baseline vs checkpoint screenshots with ImageMagick AE (absolute-error
# pixel count).  Prints one line per file: AE total | path.  Writes diff PNGs to
# /tmp/oceans-diff/ for any non-zero match so a human can audit.
set -u

BASELINE=${BASELINE:-/tmp/oceans-baseline}
CHECKPOINT=${CHECKPOINT:-/tmp/oceans-checkpoint}
DIFF=${DIFF:-/tmp/oceans-diff}

mkdir -p "$DIFF"
rm -f "$DIFF"/*.png

total_pairs=0
total_ae=0
exact=0
diff=0
missing=0

for b in "$BASELINE"/*.png; do
  name=$(basename "$b")
  c="$CHECKPOINT/$name"
  if [[ ! -f $c ]]; then
    printf '%-12s %s\n' MISSING "$name"
    ((missing++))
    continue
  fi
  ((total_pairs++))
  # -metric AE: count of differing pixels.  -fuzz 0% = pixel-exact.
  # Write a diff PNG only when AE > 0.
  ae=$(compare -metric AE -fuzz 0% "$b" "$c" "$DIFF/$name" 2>&1 || true)
  if [[ $ae == "0" ]]; then
    ((exact++))
    rm -f "$DIFF/$name"
  else
    ((diff++))
    total_ae=$((total_ae + ae))
    printf '%-12s %s\n' "AE=$ae" "$name"
  fi
done

echo
echo "Pairs compared : $total_pairs"
echo "Exact match    : $exact"
echo "Diff           : $diff"
echo "Missing        : $missing"
echo "Sum AE         : $total_ae"
