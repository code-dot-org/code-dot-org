#!/usr/bin/env bash
#
# Smoke-test the cdo-rails image. Usage:
#   ./smoke-test.sh <image-ref> <engine>
# e.g.
#   ./smoke-test.sh cdo-rails:test docker
#   ./smoke-test.sh cdo-rails:test podman
#
# DB-less checks of the source slice; the full boot is verify.sh's job.
# Rationale for each check: README.md.

# shellcheck disable=SC1091
. "$(dirname "$0")/../smoke-harness.sh"

# A drifted Gemfile or lost engine surfaces here.
run "bundle check" "dependencies are satisfied" -- bundle check

# The deepest DB-less boot: CDO config, the ERB cascade, lib/.
run "deployment.rb loads" "deployment-ok" -- \
  bundle exec ruby -e 'require "./deployment"; puts "deployment-ok #{CDO.rack_env}"'

# application.rb requires this on every boot; it embeds libpython via uv.
run "cdo/pycall initializes libpython" "pycall-ok" -- \
  bundle exec ruby -e 'require "./deployment"; require "cdo/pycall"; puts "pycall-ok"'

# Offline, exactly as the runtime uses it (UV_NO_SYNC).
run "venv imports pycdo without syncing" "pycdo-ok" -- \
  uv run --no-sync python -c 'import pycdo; print("pycdo-ok")'

# verify.sh boots adhoc, whose groups exclude mini_racer; only here does the
# shipped gem set load. The preamble mirrors application.rb's require order.
run "staging gem set loads" "staging-gems-ok" -- \
  bundle exec ruby -e 'require "./deployment"; require "rails/all"; Bundler.require(:default, :staging); puts "staging-gems-ok"'

# The slice: what must be present.
run "runtime locales present" "locales-ok" -- \
  sh -c 'test -f dashboard/config/locales/base/en.yml && echo locales-ok'
# Parses a translated locale: an LFS pointer file exists but is not a Hash,
# and en.yml cannot catch it (.gitattributes exempts *en.yml from LFS).
run "translated locale is content, not an LFS pointer" "locale-content-ok" -- \
  ruby -ryaml -e 'abort "not a hash" unless YAML.load_file("dashboard/config/locales/base/ar-SA.yml").is_a?(Hash); puts "locale-content-ok"'
run "schema and its boot cache present" "schema-ok" -- \
  sh -c 'test -f dashboard/db/schema.rb -a -f dashboard/db/schema_cache.yml && echo schema-ok'
run "runtime-read config data present" "optin-ok" -- \
  sh -c 'test -d dashboard/config/international_opt_in/school_data && echo optin-ok'
run "middleware-served shared assets present" "shared-ok" -- \
  sh -c 'test -d shared/css -a -d shared/wasm && echo shared-ok'
run "ga_client present for admin_reports" "ga-ok" -- \
  sh -c 'test -e dashboard/scripts/archive/ga_client && echo ga-ok'

# Recreated by the Dockerfile after the dockerignore drops their contents.
run "log and tmp exist for Rails" "dirs-ok" -- \
  sh -c 'test -d dashboard/log -a -d dashboard/tmp && echo dirs-ok'

assert_no_toolchain cc gcc make node yarn pkg-config git

run "runs as non-root cdo" "cdo" -- id -un

report
