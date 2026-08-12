#!/usr/bin/env bash
#
# Smoke-test the cdo-gems image. Usage:
#   ./smoke-test.sh <image-ref> <engine>
# e.g.
#   ./smoke-test.sh cdo-gems:test docker
#   ./smoke-test.sh cdo-gems:test podman
#
# The base contract is covered by docker/base/smoke-test.sh; this asserts the
# bundle resolves, the native gems load, and no toolchain came along.

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
    printf 'FAIL  %-44s (exit %d)\n%s\n' "$desc" "$rc" "$out"
    fails=$((fails + 1))
    return
  fi
  if [ -n "$expect" ] && ! printf '%s' "$out" | grep -qF -- "$expect"; then
    printf 'FAIL  %-44s (missing %q)\n%s\n' "$desc" "$expect" "$out"
    fails=$((fails + 1))
    return
  fi
  printf 'ok    %s\n' "$desc"
}

# fails_with <description> <expected-substring> -- <cmd...>
#   inverse of run, for contracts about absence. 125/126/127 are the engine
#   failing, not the contract: counting those as passes would make every
#   absence check vacuous on exactly the typo this file exists to catch.
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
  if [ -n "$expect" ] && ! printf '%s' "$out" | grep -qF -- "$expect"; then
    printf 'FAIL  %-44s (missing %q)\n%s\n' "$desc" "$expect" "$out"
    fails=$((fails + 1))
    return
  fi
  printf 'ok    %s\n' "$desc"
}

# The bundle resolves, and activates — the latter catches a gem installed for
# the wrong platform or a broken extension.
run "bundle check" "dependencies are satisfied" -- bundle check
run "Bundler.setup over the full bundle" "setup-ok" -- \
  ruby -e 'require "bundler/setup"; puts "setup-ok"'

# The seam between the two images: extensions compiled in cdo-build, loaded
# here against cdo-base's runtime libraries.
run "mysql2 loads" "mysql2-ok" -- \
  bundle exec ruby -e 'require "mysql2"; puts "mysql2-ok"'
run "rmagick loads against libMagickWand" "rmagick-ok" -- \
  bundle exec ruby -e 'require "rmagick"; puts "rmagick-ok"'
run "nokogiri loads" "nokogiri-ok" -- \
  bundle exec ruby -e 'require "nokogiri"; puts "nokogiri-ok"'

# The toolchain must be absent: finding it means the final stage stacked on the
# builder. Absence exits 3 rather than command -v's 127, which the engine also
# returns when it cannot run the image at all.
for tool in cc gcc make node yarn uv pkg-config git; do
  # shellcheck disable=SC2016
  fails_with "toolchain absent: $tool" "" -- \
    sh -c "command -v $tool > /dev/null || exit 3"
done

# Asserted on disk, not by requiring: BUNDLE_WITHOUT keeps the group off the
# load path, so a require raises whether or not the gem shipped.
# shellcheck disable=SC2016
fails_with "development group not installed" "No such file or directory" -- \
  sh -c 'ls -d "$BUNDLE_PATH"/ruby/*/gems/web-console-*'

# Checked over the whole tree, because there are two cache directories: a
# self-installed bundler tarball lands in $GEM_HOME/cache, not the mounted one.
# shellcheck disable=SC2016
run "no gem tarballs in image" "no-tarballs-ok" -- \
  sh -c 'test -z "$(find "$BUNDLE_PATH" -name "*.gem" -print -quit)" && echo no-tarballs-ok'

# Bundler env the runtime needs.
# shellcheck disable=SC2016
run "BUNDLE_PATH exported" "/usr/local/bundle" -- sh -c 'echo "$BUNDLE_PATH"'
# shellcheck disable=SC2016
run "BUNDLE_WITHOUT excludes dev and test" "development:test" -- \
  sh -c 'echo "$BUNDLE_WITHOUT"'
# The bundle's binstub dir is off PATH, so bare `rake` is the base image's and
# only `bundle exec` selects the locked one. Assert the invocation, not a PATH.
run "bundle on PATH" "" -- sh -c 'command -v bundle'
run "bundle exec resolves the locked rake" "" -- bundle exec rake --version

run "runs as non-root cdo" "cdo" -- id -un

echo "----"
if [ "$fails" -ne 0 ]; then
  echo "$fails check(s) failed on $ENGINE"
  exit 1
fi
echo "all checks passed on $ENGINE"
