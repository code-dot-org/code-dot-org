#!/usr/bin/env bash
#
# Smoke-test the cdo-base image. Usage:
#   ./smoke-test.sh <image-ref> <engine>
# e.g.
#   ./smoke-test.sh cdo-base:test docker
#   ./smoke-test.sh cdo-base:test podman
#
# Runs each check via `<engine> run --rm` and exits nonzero on any failure.

# shellcheck disable=SC1091
. "$(dirname "$0")/../smoke-harness.sh"

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

report
