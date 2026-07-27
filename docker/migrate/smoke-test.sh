#!/usr/bin/env bash
#
# Smoke-test the cdo-migrate image. Usage:
#   ./smoke-test.sh <image-ref> <engine>
# e.g.
#   ./smoke-test.sh cdo-migrate:test docker
#   ./smoke-test.sh cdo-migrate:test podman
#
# Runs each check via `<engine> run --rm` and exits nonzero on any failure.
# The gem contract is covered by docker/gems/smoke-test.sh; this asserts the
# baked source actually boots — Rails loads its rake tasks without a
# database — and that the curriculum the image exists to carry is present.

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

# 1. The bundle still resolves against the COPYed source. The Gemfile and
#    engine gemspecs here overwrite the ones cdo-gems shipped; if they
#    drifted from the lockfile the gems were installed under, this catches it.
run "bundle check" "dependencies are satisfied" -- bundle check

# 2. Rails loads its rake tasks without a database. This is the boot gate:
#    it pulls in application.rb, the cdo config, and the Python venv that
#    cdo/pycall shells out to. The one config key it needs is the slack
#    !Secret stub (config/development.yml.erb resolves it via Secrets
#    Manager otherwise), which the runner's locals.yml provides in real use.
#    -AT rather than -T: db:setup_or_migrate declares no desc, and -T only
#    lists described tasks.
run "rake tasks load without a database" "db:setup_or_migrate" -- \
  bash -c 'echo "slack_bot_token: localoverride" > locals.yml \
    && cd dashboard && bundle exec rake -AT db:setup_or_migrate'
run "seed:default resolvable" "seed the data needed" -- \
  bash -c 'echo "slack_bot_token: localoverride" > locals.yml \
    && cd dashboard && bundle exec rake -T seed:default'
#    The test environment boots too: the bake migrates the test database
#    with this image. This is the config render most sensitive to what the
#    image lacks — config/test.yml.erb shells out to git (absent here, must
#    degrade to nil, see lib/cdo/git_utils.rb), and test boot must not
#    hard-require test-group gems.
run "rake tasks load in the test environment" "db:migrate" -- \
  bash -c 'cd dashboard && RAILS_ENV=test bundle exec rake -AT db:migrate'

# 3. The curriculum is present. Carrying it is this image's entire point;
#    an ignore-file regression that drops it would otherwise surface 20
#    minutes into a seed.
#    Counted recursively: levels/ nests everything under custom/<lab>/, so
#    a top-level listing sees one entry.
for tree in levels scripts scripts_json locales; do
  # shellcheck disable=SC2016
  run "curriculum tree: dashboard/config/$tree" "populated-ok" -- \
    bash -c 'd=dashboard/config/'"$tree"'; test "$(find "$d" -type f | head -50 | wc -l)" -ge 50 && echo populated-ok'
done

# 4. The Python venv works end to end, not just exists: uv resolves the
#    project environment and runs the pinned interpreter.
run "uv runs the venv python" "Python 3.12" -- uv run python --version

# 5. No configuration is baked. locals.yml comes from the runner (a mount
#    locally, a ConfigMap in k8s); one baked here would shadow it.
run "no locals.yml baked" "no-locals-ok" -- \
  bash -c 'test ! -e locals.yml && echo no-locals-ok'

# 6. No ExecJS runtime and none needed: the image compiles no assets, and
#    boot must hold with the runtime disabled because there is no Node.
run "EXECJS_RUNTIME disabled" "Disabled" -- bash -c 'echo "$EXECJS_RUNTIME"'
fails_with "toolchain absent: node" -- bash -c 'command -v node'
fails_with "toolchain absent: cc" -- bash -c 'command -v cc'

# 7. The default job is wired: the CMD script exists, is executable, and is
#    on PATH.
run "cdo-migrate job script on PATH" "/usr/local/bin/cdo-migrate" -- \
  bash -c 'command -v cdo-migrate'

# 8. Still the non-root cdo user; the source tree is owned by it.
run "runs as non-root cdo" "cdo" -- id -un
run "source owned by cdo" "owner-ok" -- \
  bash -c 'test -O dashboard/config/levels && echo owner-ok'

echo "----"
if [ "$fails" -ne 0 ]; then
  echo "$fails check(s) failed on $ENGINE"
  exit 1
fi
echo "all checks passed on $ENGINE"
