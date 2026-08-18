#!/usr/bin/env bash
#
# Smoke-test the cdo-deps image. Usage:
#   ./smoke-test.sh <image-ref> <engine>
# e.g.
#   ./smoke-test.sh cdo-deps:test docker
#   ./smoke-test.sh cdo-deps:test podman
#
# The base contract is covered by docker/base/smoke-test.sh; this asserts the
# bundle resolves, the native gems load, the venv resolves offline, and no
# toolchain came along — uv excepted, since boot resolves the venv through it.

# shellcheck disable=SC1091
. "$(dirname "$0")/../smoke-harness.sh"

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

# The python half: the venv resolves offline, exactly as boot uses it, and
# UV_NO_SYNC is what keeps `uv run` from re-syncing an immutable image.
run "venv imports pycdo without syncing" "pycdo-ok" -- \
  uv run --no-sync python -c 'import pycdo; print("pycdo-ok")'
# shellcheck disable=SC2016
run "UV_NO_SYNC exported" "1" -- sh -c 'echo "$UV_NO_SYNC"'

# uv is the deliberate exception: boot resolves the venv through it.
assert_no_toolchain cc gcc make node yarn pkg-config git

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

report
