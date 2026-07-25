#!/usr/bin/env bash
#
# Smoke-test the cdo-dev image. Usage:
#   ./smoke-test.sh <image-ref> <engine>
# e.g.
#   ./smoke-test.sh cdo-dev:test docker
#   ./smoke-test.sh cdo-dev:test podman
#
# Runs each check via `<engine> run --rm` and exits nonzero on any failure.
# The gem contract is covered by docker/gems/smoke-test.sh; this asserts what
# the dev image adds, and that it did not lose what it inherited.
#
# ENTRYPOINT is overridden throughout: the image's entrypoint starts sidecar
# services and expects a devcontainer, which is not what a smoke test wants.

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

  out="$("$ENGINE" run --rm --entrypoint "$1" "$IMAGE" "${@:2}" 2>&1)"
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

# 1. The bundle resolves with the development and test groups added. This is
#    the delta the image exists to install.
run "bundle check" "dependencies are satisfied" -- bundle check
# shellcheck disable=SC2016
run "BUNDLE_WITHOUT is empty" "without=[]" -- \
  sh -c 'echo "without=[$BUNDLE_WITHOUT]"'
# shellcheck disable=SC2016
run "BUNDLE_DEPLOYMENT is empty" "deployment=[]" -- \
  sh -c 'echo "deployment=[$BUNDLE_DEPLOYMENT]"'

# 2. Gems from the groups cdo-gems excludes. If these are missing the delta
#    install silently did nothing.
run "minitest loads" "minitest-ok" -- \
  bundle exec ruby -e 'require "minitest"; puts "minitest-ok"'
run "rspec available" "" -- bundle exec rspec --version
run "cucumber available" "" -- bundle exec cucumber --version
run "bootsnap loads" "bootsnap-ok" -- \
  bundle exec ruby -e 'require "bootsnap"; puts "bootsnap-ok"'

# 3. ExecJS resolves to node. autoprefixer drives it during asset precompile,
#    and the test environment compiles assets on demand.
run "ExecJS runs on node" "Node.js" -- \
  bundle exec ruby -e 'require "execjs"; abort unless ExecJS.eval("1+1") == 2; puts ExecJS.runtime.name'

# 4. Toolchain. Unlike cdo-gems, this image is supposed to have it.
run "cc present" "" -- cc --version
run "make present" "" -- make --version
run "git present" "" -- git --version
run "git-lfs present" "" -- git-lfs version
run "node is v20" "v20." -- node --version
run "yarn is pinned" "4.12.0" -- yarn --version
run "uv present" "" -- uv --version
run "python3 present" "" -- python3 --version

# 5. Developer tools the image promises.
run "gdb present" "" -- gdb --version
# shellcheck disable=SC2016
run "lsof present" "lsof-ok" -- sh -c 'command -v lsof > /dev/null && echo lsof-ok'
run "redis-cli present" "" -- redis-cli --version
run "sudo is passwordless" "root" -- sudo -n id -un

# 6. Playwright chromium, used by the e2e suite and the Karma tests. CHROME_BIN
#    must resolve to a real binary, not a dangling symlink.
# shellcheck disable=SC2016
run "CHROME_BIN set" "/usr/local/bin/chromium" -- sh -c 'echo "$CHROME_BIN"'
# shellcheck disable=SC2016
run "chromium runs" "" -- sh -c '"$CHROME_BIN" --version'

# 7. The python toolchain under python/, synced into /opt/venv.
run "uv venv python runs" "Python 3" -- /opt/venv/bin/python --version

# 8. Repo volume trust: the clone runs as root, the container as cdo, so git
#    refuses the tree without this.
run "git safe.directory configured" "/code-dot-org" -- \
  git config --global --get-all safe.directory

# 9. Still the base's non-root user, and the entrypoint is in place.
run "runs as non-root cdo" "cdo" -- id -un
run "entrypoint installed" "" -- test -x /usr/local/bin/entrypoint.sh

echo "----"
if [ "$fails" -ne 0 ]; then
  echo "$fails check(s) failed on $ENGINE"
  exit 1
fi
echo "all checks passed on $ENGINE"
