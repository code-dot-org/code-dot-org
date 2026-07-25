#!/usr/bin/env bash
#
# Smoke-test the cdo-build image. Usage:
#   ./smoke-test.sh <image-ref> <engine>
# e.g.
#   ./smoke-test.sh cdo-build:test docker
#   ./smoke-test.sh cdo-build:test podman
#
# Runs each check via `<engine> run --rm` and exits nonzero on any failure.
# The base contract (ruby, jemalloc, mysql client, ImageMagick, uid) is
# covered by docker/base/smoke-test.sh; this asserts what cdo-build adds.

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

# 1. The C toolchain compiles and links, which is the whole point of the image.
#    Written to $HOME because the smoke run has no writable mount.
# shellcheck disable=SC2016
run "cc compiles and links" "compile-ok" -- \
  sh -c 'printf "int main(void){return 0;}" > "$HOME/t.c" \
    && cc -o "$HOME/t" "$HOME/t.c" && "$HOME/t" && echo compile-ok'

run "make present" "" -- make --version

# 2. The native libraries the bundle links against. Compile and link a real
#    translation unit against each, driven by the library's own config tool,
#    which is what mysql2's and rmagick's extconf.rb do. Linking is the whole
#    contract for a builder: the gems it produces are copied into a runtime
#    image, so the runtime .so lookup is cdo-base's contract, not this one.
run "pkg-config present" "" -- pkg-config --version

# shellcheck disable=SC2016
run "links against libmysqlclient" "mysql-link-ok" -- \
  sh -c 'set -e
    printf "#include <mysql.h>\nint main(void){return mysql_library_init(0,0,0);}\n" > "$HOME/m.c"
    cc -o "$HOME/m" "$HOME/m.c" $(mysql_config --cflags) $(mysql_config --libs)
    echo mysql-link-ok'

# shellcheck disable=SC2016
run "links against libMagickWand" "wand-link-ok" -- \
  sh -c 'set -e
    printf "#include <wand/MagickWand.h>\nint main(void){MagickWandGenesis();return 0;}\n" > "$HOME/w.c"
    cc -o "$HOME/w" "$HOME/w.c" $(pkg-config --cflags MagickWand) $(pkg-config --libs MagickWand)
    echo wand-link-ok'

# 3. git, for the git-sourced gems in the Gemfile.
run "git present" "" -- git --version

# 4. Node toolchain for the apps/ build. corepack shims yarn; the version
#    itself comes from each package.json "packageManager" field at use time,
#    so assert the shim resolves, not a version number.
run "node is v20" "v20." -- node --version
run "npm present" "" -- npm --version
run "corepack present" "" -- corepack --version
# shellcheck disable=SC2016
run "yarn shim on PATH" "yarn-ok" -- sh -c 'command -v yarn > /dev/null && echo yarn-ok'

# 5. python3, for node-gyp.
run "python3 present" "" -- python3 --version

# 6. uv, for the python/ workspace sync.
run "uv present" "" -- uv --version

# 7. Bundler environment: BUNDLE_PATH exported, on PATH, and writable by the
#    build user, including the ruby/3.2.0 tree a gem cache mounts under.
run "BUNDLE_PATH exported" "/usr/local/bundle" -- \
  sh -c 'echo "$BUNDLE_PATH"'
# shellcheck disable=SC2016
run "BUNDLE_PATH/bin on PATH" "path-ok" -- \
  sh -c 'case ":$PATH:" in *":$BUNDLE_PATH/bin:"*) echo path-ok ;; esac'
run "bundler runs" "" -- bundle --version
# shellcheck disable=SC2016
run "gem tree writable by build user" "bundle-writable-ok" -- \
  sh -c 'touch "$BUNDLE_PATH/ruby/3.2.0/bundler/gems/.smoke" \
    && rm -f "$BUNDLE_PATH/ruby/3.2.0/bundler/gems/.smoke" && echo bundle-writable-ok'

# 8. Identity env restored for downstream COPY --chown=${UID}:${GID}.
run "UID/GID/SRC/USERNAME exported" "1000:1000:/code-dot-org:cdo" -- \
  sh -c 'echo "$UID:$GID:$SRC:$USERNAME"'

# 9. Still a non-root image, like the base and like docker-thin's build stage.
run "runs as non-root cdo" "cdo" -- id -un

# 10. Gems are this image's output, not its content: nothing installed yet.
run "no bundle installed" "no-gems-ok" -- \
  sh -c 'test -z "$(ls -A "$BUNDLE_PATH/ruby/3.2.0/gems" 2>/dev/null)" && echo no-gems-ok'

echo "----"
if [ "$fails" -ne 0 ]; then
  echo "$fails check(s) failed on $ENGINE"
  exit 1
fi
echo "all checks passed on $ENGINE"
