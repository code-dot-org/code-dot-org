#!/usr/bin/env bash
#
# Smoke-test the cdo-base image. Usage:
#   ./smoke-test.sh <image-ref> <engine>
# e.g.
#   ./smoke-test.sh cdo-base:test docker
#   ./smoke-test.sh cdo-base:test podman
#
# Runs each check via `<engine> run --rm` and exits nonzero on any failure.

set -u

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
    printf 'FAIL  %-40s (exit %d)\n%s\n' "$desc" "$rc" "$out"
    fails=$((fails + 1))
    return
  fi
  if [ -n "$expect" ] && ! printf '%s' "$out" | grep -qF "$expect"; then
    printf 'FAIL  %-40s (missing %q)\n%s\n' "$desc" "$expect" "$out"
    fails=$((fails + 1))
    return
  fi
  printf 'ok    %s\n' "$desc"
}

# 1. Ruby is the pinned version.
run "ruby 3.2.11" "3.2.11" -- ruby --version

# 2a. LD_PRELOAD resolves cleanly (no ld.so error on stderr).
run "ruby runs under LD_PRELOAD" "ok" -- ruby -e 'puts :ok'

# 2b. jemalloc symlink present.
run "libjemalloc symlink" "libjemalloc.so.2" -- ls -l /usr/local/lib/libjemalloc.so.2

# 2c. Preload is actually jemalloc (emits stats when asked).
run "jemalloc stats via MALLOC_CONF" "jemalloc statistics" -- \
  env MALLOC_CONF=stats_print:true ruby -e ''

# 3. mysql client CLI works.
run "mysql --version" "" -- mysql --version

# 4. mysql/mariadb client shared library is registered with ldconfig.
run "libmysql/mariadb in ldconfig" "" -- \
  sh -c 'ldconfig -p | grep -Eiq "libmysqlclient|libmariadb"'

# 5. ImageMagick present (IM6 convert or IM7 magick).
run "imagemagick" "" -- \
  sh -c 'convert --version 2>/dev/null || magick --version'

# 6. Non-root cdo user, correct uid/name, writable workdir.
run "uid is 1000" "1000" -- id -u
run "username is cdo" "cdo" -- id -un
run "workdir is /code-dot-org" "/code-dot-org" -- pwd
# $PWD must expand inside the container, so single quotes are intentional.
# shellcheck disable=SC2016
run "workdir is writable" "writable-ok" -- \
  sh -c 'touch "$PWD/.smoke" && rm -f "$PWD/.smoke" && echo writable-ok'

# 7. curl and tzdata.
run "curl --version" "" -- curl --version
run "zoneinfo UTC present" "" -- test -e /usr/share/zoneinfo/UTC

# 8. locale runs under LANG=C.UTF-8.
run "locale under C.UTF-8" "" -- locale

echo "----"
if [ "$fails" -ne 0 ]; then
  echo "$fails check(s) failed on $ENGINE"
  exit 1
fi
echo "all checks passed on $ENGINE"
