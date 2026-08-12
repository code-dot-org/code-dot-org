#!/usr/bin/env bash
#
# Smoke-test the cdo-dev image. Usage:
#   ./smoke-test.sh <image-ref> <engine>
# e.g.
#   ./smoke-test.sh cdo-dev:test docker
#   ./smoke-test.sh cdo-dev:test podman
#
# The dependency contract is covered by docker/deps/smoke-test.sh; this
# asserts what the dev image adds — the dev/test gem delta, the toolchain,
# the browsers — and that it did not lose what it inherited.
#
# Checks run through the image's entrypoint on purpose: with no repo volume
# mounted, every entrypoint stage is guarded off and it must degrade to a
# plain exec. A check hanging here means a guard broke.

# shellcheck disable=SC1091
. "$(dirname "$0")/../smoke-harness.sh"

# The delta this image exists to install: the bundle resolves with the
# development and test groups present, unfrozen.
run "bundle check" "dependencies are satisfied" -- bundle check
# shellcheck disable=SC2016
run "BUNDLE_WITHOUT is empty" "without=[]" -- \
  sh -c 'echo "without=[$BUNDLE_WITHOUT]"'
# shellcheck disable=SC2016
run "BUNDLE_DEPLOYMENT is empty" "deployment=[]" -- \
  sh -c 'echo "deployment=[$BUNDLE_DEPLOYMENT]"'

# Gems from the groups cdo-deps excludes. If these are missing the delta
# install silently did nothing. web-console is the same gem the deps smoke
# test asserts absent, so the pair proves the boundary sits between the
# two images rather than nowhere.
run "minitest loads" "minitest-ok" -- \
  bundle exec ruby -e 'require "minitest"; puts "minitest-ok"'
run "cucumber available" "" -- bundle exec cucumber --version
run "bootsnap loads" "bootsnap-ok" -- \
  bundle exec ruby -e 'require "bootsnap"; puts "bootsnap-ok"'
# shellcheck disable=SC2016
run "development group installed" "web-console" -- \
  sh -c 'ls -d "$BUNDLE_PATH"/ruby/*/gems/web-console-*'

# Inherited and not lost: the extensions compiled in cdo-build still load
# after the delta install on top of them.
run "mysql2 still loads" "mysql2-ok" -- \
  bundle exec ruby -e 'require "mysql2"; puts "mysql2-ok"'

# The toolchain. Unlike cdo-deps, this image is supposed to have it.
run "cc present" "" -- cc --version
run "make present" "" -- make --version
run "git present" "" -- git --version
run "git-lfs present" "" -- git-lfs version
run "node is v20" "v20." -- node --version
run "yarn is pinned" "4.12.0" -- yarn --version
run "python3 present" "" -- python3 --version

# Developer tools the image promises.
run "gdb present" "" -- gdb --version
# shellcheck disable=SC2016
run "lsof present" "lsof-ok" -- sh -c 'command -v lsof > /dev/null && echo lsof-ok'
run "redis-cli present" "" -- redis-cli --version
run "sudo is passwordless" "root" -- sudo -n id -un

# The python half, relocated: /opt/venv, where the repo mount cannot shadow
# it, with the dev group synced. The bare `uv run` (no --no-sync) also proves
# UV_NO_SYNC=0 parses as false rather than erroring.
# shellcheck disable=SC2016
run "UV_PROJECT_ENVIRONMENT is /opt/venv" "/opt/venv" -- \
  sh -c 'echo "$UV_PROJECT_ENVIRONMENT"'
run "venv python runs" "Python 3" -- /opt/venv/bin/python --version
run "uv run imports pycdo" "pycdo-ok" -- \
  uv run python -c 'import pycdo; print("pycdo-ok")'

# Playwright chromium, used by the e2e suite and the Karma tests. CHROME_BIN
# must resolve to a real binary, not a dangling symlink.
# shellcheck disable=SC2016
run "CHROME_BIN set" "/usr/local/bin/chromium" -- sh -c 'echo "$CHROME_BIN"'
# shellcheck disable=SC2016
run "chromium runs" "" -- sh -c '"$CHROME_BIN" --version'

# Repo volume trust: the clone runs as root, the container as cdo, so git
# refuses the tree without this.
run "git safe.directory configured" "/code-dot-org" -- \
  git config --global --get-all safe.directory

# .gitattributes puts thirteen directory globs behind LFS, so a commit made
# in here needs the clean filter or it stores the file's bytes where a pointer
# belongs. Debian's git-lfs package writes these to /etc/gitconfig, which is
# why the image needs no `git lfs install` — assert the resolved value, not
# the global one, so the day that packaging changes fails here and not in
# somebody's commit.
run "git-lfs filters configured" "git-lfs" -- \
  git config --get filter.lfs.smudge

run "runs as non-root cdo" "cdo" -- id -un
run "entrypoint installed" "" -- test -x /usr/local/bin/entrypoint.sh

report
