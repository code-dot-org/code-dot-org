#!/usr/bin/env bash
#
# Smoke-test the cdo-dev image. Usage:
#   ./smoke-test.sh <image-ref> <engine>
# e.g.
#   ./smoke-test.sh cdo-dev:test docker
#   ./smoke-test.sh cdo-dev:test podman
#
# The dependency contract is covered by docker/deps/smoke-test.sh; this
# asserts what the dev image adds and that it lost nothing it inherited.

# shellcheck disable=SC1091
. "$(dirname "$0")/../smoke-harness.sh"

run "bundle check" "dependencies are satisfied" -- bundle check
# shellcheck disable=SC2016
run "BUNDLE_WITHOUT is empty" "without=[]" -- \
  sh -c 'echo "without=[$BUNDLE_WITHOUT]"'
# shellcheck disable=SC2016
run "BUNDLE_DEPLOYMENT is empty" "deployment=[]" -- \
  sh -c 'echo "deployment=[$BUNDLE_DEPLOYMENT]"'

# web-console pairs with docker/deps/smoke-test.sh, which asserts it
# absent — proving the boundary sits between the two images.
run "minitest loads" "minitest-ok" -- \
  bundle exec ruby -e 'require "minitest"; puts "minitest-ok"'
run "cucumber available" "" -- bundle exec cucumber --version
run "bootsnap loads" "bootsnap-ok" -- \
  bundle exec ruby -e 'require "bootsnap"; puts "bootsnap-ok"'
# shellcheck disable=SC2016
run "development group installed" "web-console" -- \
  sh -c 'ls -d "$BUNDLE_PATH"/ruby/*/gems/web-console-*'

# The cdo-build extension must still load after the delta install on top of it.
run "mysql2 still loads" "mysql2-ok" -- \
  bundle exec ruby -e 'require "mysql2"; puts "mysql2-ok"'

run "cc present" "" -- cc --version
run "make present" "" -- make --version
run "git present" "" -- git --version
run "git-lfs present" "" -- git-lfs version
run "node is v20" "v20." -- node --version
run "yarn is pinned" "4.12.0" -- yarn --version
run "python3 present" "" -- python3 --version

run "gdb present" "" -- gdb --version
# shellcheck disable=SC2016
run "lsof present" "lsof-ok" -- sh -c 'command -v lsof > /dev/null && echo lsof-ok'
run "redis-cli present" "" -- redis-cli --version
run "sudo is passwordless" "root" -- sudo -n id -un

# The bare `uv run` (no --no-sync) proves UV_NO_SYNC=0 parses as false,
# not an error.
# shellcheck disable=SC2016
run "UV_PROJECT_ENVIRONMENT is /opt/venv" "/opt/venv" -- \
  sh -c 'echo "$UV_PROJECT_ENVIRONMENT"'
run "venv python runs" "Python 3" -- /opt/venv/bin/python --version
run "uv run imports pycdo" "pycdo-ok" -- \
  uv run python -c 'import pycdo; print("pycdo-ok")'

# CHROME_BIN must resolve to a real binary, not a dangling symlink.
# shellcheck disable=SC2016
run "CHROME_BIN set" "/usr/local/bin/chromium" -- sh -c 'echo "$CHROME_BIN"'
# shellcheck disable=SC2016
run "chromium runs" "" -- sh -c '"$CHROME_BIN" --version'

# Repo volume trust: the clone runs as root, the container as cdo, so git
# refuses the tree without this.
run "git safe.directory configured" "/code-dot-org" -- \
  git config --global --get-all safe.directory

# A commit here needs the clean filter, or it stores bytes where a pointer
# belongs. Debian's git-lfs package configures the filter in /etc/gitconfig
# — assert the resolved value, so a packaging change fails here.
run "git-lfs filters configured" "git-lfs" -- \
  git config --get filter.lfs.smudge

run "runs as non-root cdo" "cdo" -- id -un
# The image has no ENTRYPOINT; the devcontainer lifecycle calls this directly.
run "dev-bootstrap installed" "" -- test -x /usr/local/bin/dev-bootstrap
run "dev-bootstrap rejects a bad subcommand" "usage: dev-bootstrap" -- \
  sh -c '/usr/local/bin/dev-bootstrap nonsense 2>&1 || true'

report
