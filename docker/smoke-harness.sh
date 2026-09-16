# shellcheck shell=bash
# Assertion harness shared by the image smoke tests. Source it first thing;
# it consumes the script's <image-ref> <engine> arguments:
#   . "$(dirname "$0")/../smoke-harness.sh"
# Then declare checks with run/fails_with and finish with report.

set -uo pipefail

IMAGE="${1:?usage: smoke-test.sh <image-ref> <engine>}"
ENGINE="${2:?usage: smoke-test.sh <image-ref> <engine>}"

fails=0

# run <description> <expected-substring> -- <cmd...>
#   asserts the command exits 0 AND its combined output contains the substring.
run() {
  desc="$1"
  expect="$2"
  shift 2
  [ "$1" = "--" ] && shift

  out="$("$ENGINE" run --rm "$IMAGE" "$@" 2>&1)"
  rc=$?
  if [ "$rc" -ne 0 ]; then
    printf 'FAIL  %-44s (exit %d)\n%s\n' "$desc" "$rc" "$out"
    fails=$((fails + 1))
    return
  fi
  # Substring test in bash, not `printf | grep -q`: grep exits at first
  # match, and under pipefail the printf EPIPE on large output fails the
  # check that just passed.
  case "$out" in
    *"$expect"*) ;;
    *)
      if [ -n "$expect" ]; then
        printf 'FAIL  %-44s (missing %q)\n%s\n' "$desc" "$expect" "$out"
        fails=$((fails + 1))
        return
      fi
      ;;
  esac
  printf 'ok    %s\n' "$desc"
}

# fails_with <description> <expected-substring> -- <cmd...>
#   inverse of run, for contracts about absence. 125/126/127 are the engine
#   failing, not the contract: counting those as passes would make every
#   absence check vacuous on exactly the typo this harness exists to catch.
fails_with() {
  desc="$1"
  expect="$2"
  shift 2
  [ "$1" = "--" ] && shift

  out="$("$ENGINE" run --rm "$IMAGE" "$@" 2>&1)"
  rc=$?
  if [ "$rc" -eq 0 ]; then
    printf 'FAIL  %-44s (expected nonzero exit)\n%s\n' "$desc" "$out"
    fails=$((fails + 1))
    return
  fi
  case "$rc" in
    125 | 126 | 127)
      printf 'FAIL  %-44s (engine error, exit %d)\n%s\n' "$desc" "$rc" "$out"
      fails=$((fails + 1))
      return
      ;;
  esac
  case "$out" in
    *"$expect"*) ;;
    *)
      if [ -n "$expect" ]; then
        printf 'FAIL  %-44s (missing %q)\n%s\n' "$desc" "$expect" "$out"
        fails=$((fails + 1))
        return
      fi
      ;;
  esac
  printf 'ok    %s\n' "$desc"
}

# assert_no_toolchain <tool...> — the image must not carry the builder's
# tools; finding one means a stage stacked on the wrong parent.
assert_no_toolchain() {
  for tool in "$@"; do
    fails_with "toolchain absent: $tool" "" -- \
      sh -c "command -v $tool > /dev/null || exit 3"
  done
}

# report — print the trailer and exit nonzero if anything failed.
report() {
  echo "----"
  if [ "$fails" -ne 0 ]; then
    echo "$fails check(s) failed on $ENGINE"
    exit 1
  fi
  echo "all checks passed on $ENGINE"
}
