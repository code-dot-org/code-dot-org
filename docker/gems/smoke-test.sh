#!/usr/bin/env bash
#
# Smoke-test the cdo-gems image. Usage:
#   ./smoke-test.sh <image-ref> <engine>
# e.g.
#   ./smoke-test.sh cdo-gems:test docker
#   ./smoke-test.sh cdo-gems:test podman
#
# Runs each check via `<engine> run --rm` and exits nonzero on any failure.
# The base contract is covered by docker/base/smoke-test.sh; this asserts the
# bundle resolves, the native gems load against the base's runtime libraries,
# and none of the toolchain that built them came along.

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
  if [ -n "$expect" ] && ! printf '%s' "$out" | grep -qF "$expect"; then
    printf 'FAIL  %-44s (missing %q)\n%s\n' "$desc" "$expect" "$out"
    fails=$((fails + 1))
    return
  fi
  printf 'ok    %s\n' "$desc"
}

# fails_with <description> -- <cmd...>
#   inverse of run: asserts the command exits NONZERO. For contracts that are
#   about absence, where a passing command is the failure.
fails_with() {
  desc="$1"
  shift
  [ "$1" = "--" ] && shift

  if out="$("$ENGINE" run --rm "$IMAGE" "$@" 2>&1)"; then
    printf 'FAIL  %-44s (expected nonzero exit)\n%s\n' "$desc" "$out"
    fails=$((fails + 1))
    return
  fi
  printf 'ok    %s\n' "$desc"
}

# 1. The bundle resolves. This is the image's entire reason to exist, and it
#    exercises the lockfile and the path-gem gemspecs shipped alongside it.
run "bundle check" "dependencies are satisfied" -- bundle check

# 2. Bundler can activate the whole bundle, not just verify it is present.
#    Catches a gem installed for the wrong platform or a broken extension.
run "Bundler.setup over the full bundle" "setup-ok" -- \
  ruby -e 'require "bundler/setup"; puts "setup-ok"'

# 3. Native gems load against the runtime libraries cdo-base provides. This
#    is the seam between the two images: the extensions were compiled in
#    cdo-build, and nothing verifies they still resolve until they are
#    required here. rmagick links libMagickWand, mysql2 libmysqlclient.
run "mysql2 loads" "mysql2-ok" -- \
  bundle exec ruby -e 'require "mysql2"; puts "mysql2-ok"'
run "rmagick loads against libMagickWand" "rmagick-ok" -- \
  bundle exec ruby -e 'require "rmagick"; puts "rmagick-ok"'
run "nokogiri loads" "nokogiri-ok" -- \
  bundle exec ruby -e 'require "nokogiri"; puts "nokogiri-ok"'

# 4. No toolchain: the gems were compiled in cdo-build and copied onto
#    cdo-base, so nothing that built them may ship. A regression here means
#    the final stage accidentally stacked on the builder.
for tool in cc gcc make node yarn uv pkg-config git; do
  # shellcheck disable=SC2016
  fails_with "toolchain absent: $tool" -- sh -c "command -v $tool"
done

# 5. The excluded groups really are excluded. web-console is development-only,
#    so its presence would mean BUNDLE_WITHOUT was not honored at install.
fails_with "development group not installed" -- \
  ruby -e 'require "bundler/setup"; require "web_console"'

# 6. The .gem tarball cache is a build cache mount, not image content.
# shellcheck disable=SC2016
run "gem cache not in image" "no-cache-ok" -- \
  sh -c 'test ! -d "$BUNDLE_PATH/ruby/3.2.0/cache" && echo no-cache-ok'

# 7. Bundler env the runtime needs. Without BUNDLE_WITHOUT at run time,
#    Bundler.setup tries to activate groups that were never installed.
# shellcheck disable=SC2016
run "BUNDLE_PATH exported" "/usr/local/bundle" -- sh -c 'echo "$BUNDLE_PATH"'
# shellcheck disable=SC2016
run "BUNDLE_WITHOUT excludes dev and test" "development:test" -- \
  sh -c 'echo "$BUNDLE_WITHOUT"'
# shellcheck disable=SC2016
run "BUNDLE_PATH/bin on PATH" "path-ok" -- \
  sh -c 'case ":$PATH:" in *":$BUNDLE_PATH/bin:"*) echo path-ok ;; esac'

# 8. Still the base's non-root user; the gem tree is readable to it.
run "runs as non-root cdo" "cdo" -- id -un

echo "----"
if [ "$fails" -ne 0 ]; then
  echo "$fails check(s) failed on $ENGINE"
  exit 1
fi
echo "all checks passed on $ENGINE"
