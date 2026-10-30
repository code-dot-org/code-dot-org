#!/usr/bin/env bash
#
# Smoke-test the cdo-build image. Usage:
#   ./smoke-test.sh <image-ref> <engine>
# e.g.
#   ./smoke-test.sh cdo-build:test docker
#   ./smoke-test.sh cdo-build:test podman
#
# The base contract (ruby, jemalloc, mysql client, ImageMagick, uid) is
# covered by docker/base/smoke-test.sh; this asserts what cdo-build adds.

# shellcheck disable=SC2016  # single-quoted $VARs expand inside the image
# shellcheck disable=SC1091
. "$(dirname "$0")/../smoke-harness.sh"

# The compiler and make must be present; the real compile test is the next job,
# which builds cdo-deps from this image and compiles every native extension.
run "cc present" "" -- cc --version
run "make present" "" -- make --version

# Dev packages asserted through the same config tools mysql2's and rmagick's
# extconf.rb consult, so a missing one fails here for the reason it would fail a
# gem build. The output is matched loosely because Debian ships MariaDB's client
# under that package name, so the reported library is not -lmysqlclient.
run "libmysqlclient dev package" "-l" -- mysql_config --libs
run "MagickWand dev package" "" -- pkg-config --exists --print-errors MagickWand

# git, for the git-sourced gems in the Gemfile.
run "git present" "" -- git --version

# Both versions are read from the repo rather than written here, since chef and
# the engines fields pin the same ones and an image that drifts ships skew.
# apps/ is outside the sparse checkout CI uses, so fall back to the blob in git.
nvmrc_major="$(cat .nvmrc)"
yarn_pin="$( { cat apps/package.json || git show HEAD:apps/package.json; } 2>/dev/null \
  | sed -n 's/.*"packageManager": *"yarn@\([^"]*\)".*/\1/p' )"
: "${nvmrc_major:?missing .nvmrc}" "${yarn_pin:?no packageManager found in apps/package.json}"

run "node major matches .nvmrc (v${nvmrc_major}.x)" "v${nvmrc_major}." -- node --version
run "npm present" "" -- npm --version
run "corepack present" "" -- corepack --version

# corepack downloads yarn per project, so this needs the network. Without a
# packageManager field it would silently serve its own default, 1.22.x.
run "corepack runs the pinned yarn ${yarn_pin}" "$yarn_pin" -- \
  sh -c "cd /tmp && printf '{\"packageManager\":\"yarn@${yarn_pin}\"}' > package.json && yarn --version"

# python3, for node-gyp.
run "python3 present" "" -- python3 --version

# Both uv binaries: they arrive by a two-path COPY --from, and a typo there
# would drop one silently.
run "uv present" "" -- uv --version
# shellcheck disable=SC2016
run "uvx present" "uvx-ok" -- sh -c 'command -v uvx > /dev/null && echo uvx-ok'

# The gem tree must be writable by the build user. ABI dir from the interpreter,
# as in the Dockerfile, so a Ruby bump needs no edit here.
run "BUNDLE_PATH exported" "/usr/local/bundle" -- \
  sh -c 'echo "$BUNDLE_PATH"'
# shellcheck disable=SC2016
run "BUNDLE_PATH/bin on PATH" "path-ok" -- \
  sh -c 'case ":$PATH:" in *":$BUNDLE_PATH/bin:"*) echo path-ok ;; esac'
run "bundler runs" "" -- bundle --version
# shellcheck disable=SC2016
run "gem tree writable by build user" "bundle-writable-ok" -- \
  sh -c 'abi=$(ruby -e '\''print RbConfig::CONFIG["ruby_version"]'\'') \
    && touch "$BUNDLE_PATH/ruby/$abi/bundler/gems/.smoke" \
    && rm -f "$BUNDLE_PATH/ruby/$abi/bundler/gems/.smoke" && echo bundle-writable-ok'

# Identity env, for scripts run inside the builder. Note COPY --chown cannot
# read these (it expands only same-stage ARGs, never inherited ENV), which is
# why downstream Dockerfiles write the uid-1000 family constant literally.
run "UID/GID/SRC/USERNAME exported" "1000:1000:/code-dot-org:cdo" -- \
  sh -c 'echo "$UID:$GID:$SRC:$USERNAME"'

run "runs as non-root cdo" "cdo" -- id -un

# Gems are this image's output, not its content.
run "no bundle installed" "no-gems-ok" -- \
  sh -c 'abi=$(ruby -e '\''print RbConfig::CONFIG["ruby_version"]'\'') \
    && test -z "$(ls -A "$BUNDLE_PATH/ruby/$abi/gems" 2>/dev/null)" && echo no-gems-ok'

report
