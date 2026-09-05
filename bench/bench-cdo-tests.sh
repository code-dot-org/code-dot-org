#!/usr/bin/env bash
# Benchmark the code-dot-org unit suites. Portable across machines.
#
# The dashboard suite is run per-directory: `rails test` over the whole
# tree wedges on this checkout (64 tests in 63 min, then no progress).
#
# Ruby is assumed to be built under gcc-13; see bench/t4g/NOTES.md section 3.
#
# Usage: REPO=/path/to/code-dot-org OUT=/tmp/bench ./bench-cdo-tests.sh
set -u

REPO="${REPO:-$HOME/code-dot-org}"
OUT="${OUT:-$HOME/testruns/bench-$(date +%Y%m%d-%H%M%S)}"
mkdir -p "$OUT"
TSV="$OUT/results.tsv"
printf "suite\tfiles\ttests\tassertions\tfailures\terrors\tskips\twall_s\n" > "$TSV"

# --- environment ------------------------------------------------------
export PATH="$HOME/.rbenv/bin:$PATH"
command -v rbenv >/dev/null && eval "$(rbenv init - bash)"
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" >/dev/null 2>&1 && nvm use default >/dev/null 2>&1
command -v google-chrome >/dev/null && export CHROME_BIN=$(command -v google-chrome)
strip_ansi() { sed -r 's/\x1b\[[0-9;]*m//g'; }

# --- machine profile --------------------------------------------------
{
  echo "date            $(date -u +%FT%TZ)"
  echo "host            $(hostname)"
  echo "kernel          $(uname -r)  $(uname -m)"
  echo "cpu_model       $(lscpu 2>/dev/null | sed -n 's/^Model name: *//p' | head -1)"
  echo "cpu_cores       $(nproc)"
  echo "mem_total       $(free -h 2>/dev/null | awk '/^Mem:/{print $2}')"
  echo "swap_total      $(free -h 2>/dev/null | awk '/^Swap:/{print $2}')"
  echo "disk_avail      $(df -h "$REPO" 2>/dev/null | tail -1 | awk '{print $4}')"
  T=$(curl -sS -X PUT --max-time 2 "http://169.254.169.254/latest/api/token" \
        -H "X-aws-ec2-metadata-token-ttl-seconds: 60" 2>/dev/null)
  echo "instance_type   $(curl -sS --max-time 2 -H "X-aws-ec2-metadata-token: $T" \
        http://169.254.169.254/latest/meta-data/instance-type 2>/dev/null || echo n/a)"
  echo "ruby            $(ruby -v 2>/dev/null | cut -d' ' -f1-2)"
  echo "node            $(node -v 2>/dev/null)"
  echo "imagemagick     $(convert -version 2>/dev/null | head -1 | cut -d' ' -f1-3)"
  echo "git_sha         $(git -C "$REPO" rev-parse --short HEAD 2>/dev/null)"
} > "$OUT/profile.txt"
cat "$OUT/profile.txt"

# --- CPU calibration: fixed work, detects burstable throttling --------
calib() {
  local label="$1" s e
  s=$(date +%s.%N)
  ruby -e 'a=0; 12_000_000.times{|i| a+=i*i}' 2>/dev/null
  e=$(date +%s.%N)
  printf "calib\t%s\t%.2f\n" "$label" "$(echo "$e - $s" | bc)" >> "$OUT/calibration.tsv"
  printf "  calibration[%s] %.2fs\n" "$label" "$(echo "$e - $s" | bc)"
}
: > "$OUT/calibration.tsv"

# --- CPU steal sampler (burstable throttling shows up here) -----------
( prev=""; while :; do
    read -r _ u n s i w _ st _ < /proc/stat
    tot=$((u+n+s+i+w+st))
    if [ -n "$prev" ]; then
      pt=${prev%% *}; ps=${prev##* }
      dt=$((tot-pt)); ds=$((st-ps))
      [ "$dt" -gt 0 ] && printf "%s\t%.2f\n" "$(date +%s)" \
        "$(echo "scale=4; 100*$ds/$dt" | bc)" >> "$OUT/steal.tsv"
    fi
    prev="$tot $st"; sleep 30
  done ) & STEAL_PID=$!
trap 'kill $STEAL_PID 2>/dev/null' EXIT

record() { printf "%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n" "$@" >> "$TSV"; }
parse()  { grep -aoE "[0-9]+ (tests|runs), [0-9]+ assertions, [0-9]+ failures, [0-9]+ errors, [0-9]+ skips" "$1" | tail -1; }

calib start

# --- apps (jest) ------------------------------------------------------
echo "== apps unit (jest) =="
cd "$REPO/apps" || exit 1
s=$(date +%s)
yarn test:unit --json --outputFile="$OUT/jest.json" > "$OUT/apps.log" 2>&1
w=$(( $(date +%s) - s ))
python3 - "$OUT/jest.json" "$w" >> "$TSV" <<'PY'
import json,sys
d=json.load(open(sys.argv[1]))
print("apps\t%d\t%d\t0\t%d\t0\t%d\t%s"%(d["numTotalTestSuites"],d["numTotalTests"],
      d["numFailedTests"],d["numPendingTests"],sys.argv[2]))
PY
echo "  apps: ${w}s"

calib mid

# --- dashboard, per directory ----------------------------------------
cd "$REPO/dashboard" || exit 1
for d in models controllers lib helpers jobs mailers serializers config dsl app testing integration; do
  [ -d "test/$d" ] || continue
  n=$(find "test/$d" -name '*_test.rb' | wc -l)
  s=$(date +%s)
  timeout 3600 env DISABLE_SPRING=1 RAILS_ENV=test bundle exec rails test "test/$d" 2>&1 \
    | strip_ansi > "$OUT/dash-$d.log"
  w=$(( $(date +%s) - s ))
  r=$(parse "$OUT/dash-$d.log")
  if [ -n "$r" ]; then
    set -- $(echo "$r" | tr -d ',' | awk '{print $1,$3,$5,$7,$9}')
    record "dashboard/$d" "$n" "$1" "$2" "$3" "$4" "$5" "$w"
  else
    record "dashboard/$d" "$n" NA NA NA NA NA "$w"
  fi
  echo "  dashboard/$d: ${w}s  ${r:-NO_SUMMARY}"
done

calib mid2

# --- lib and shared, per file ----------------------------------------
for dir in lib shared; do
  cd "$REPO/$dir" || continue
  T=0; A=0; F=0; E=0; S=0; N=0; s0=$(date +%s)
  : > "$OUT/$dir-files.tsv"
  for f in $(find test \( -name 'test_*.rb' -o -name '*_test.rb' \) -type f | sort); do
    s=$(date +%s)
    timeout 600 bundle exec ruby -Itest "$f" 2>&1 | strip_ansi > "$OUT/tmp.log"
    w=$(( $(date +%s) - s ))
    printf "%s\t%s\n" "$f" "$w" >> "$OUT/$dir-files.tsv"
    r=$(parse "$OUT/tmp.log")
    if [ -n "$r" ]; then
      set -- $(echo "$r" | tr -d ',' | awk '{print $1,$3,$5,$7,$9}')
      T=$((T+$1)); A=$((A+$2)); F=$((F+$3)); E=$((E+$4)); S=$((S+$5))
    fi
    N=$((N+1))
  done
  record "$dir" "$N" "$T" "$A" "$F" "$E" "$S" "$(( $(date +%s)-s0 ))"
  echo "  $dir: $(( $(date +%s)-s0 ))s  tests=$T fail=$F err=$E"
done

calib end
kill $STEAL_PID 2>/dev/null
echo; echo "== results =="; column -t "$TSV"
echo; echo "== calibration (higher = slower; rising = throttled) =="; cat "$OUT/calibration.tsv"
echo; echo "== peak CPU steal % =="; sort -k2 -rn "$OUT/steal.tsv" 2>/dev/null | head -3
echo; echo "output: $OUT"
