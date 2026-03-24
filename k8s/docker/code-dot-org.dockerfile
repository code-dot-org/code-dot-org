# syntax=docker/dockerfile:1.22

# We pin to syntax=docker/dockerfile:1.22 to get access to:
# - `COPY --parents`, see: https://docs.docker.com/reference/dockerfile/#copy---parents
#
# NOTE: switch back to `docker/dockerfile:1` once it updates to track a version >=1.22

# Pull in the static assets and db seed layers
# built from separate dockerfiles by skaffold
ARG CODE_DOT_ORG_PEGASUS
ARG CODE_DOT_ORG_STATIC
ARG CODE_DOT_ORG_DB_SEED
ARG CODE_DOT_ORG_CORE

FROM $CODE_DOT_ORG_PEGASUS AS code-dot-org-pegasus
FROM $CODE_DOT_ORG_STATIC AS code-dot-org-static
FROM $CODE_DOT_ORG_DB_SEED AS code-dot-org-db-seed
FROM $CODE_DOT_ORG_CORE AS code-dot-org-core

################################################################################
FROM code-dot-org-core AS code-dot-org-bundle-install
################################################################################

COPY --chown=${UID} \
  .ruby-version \
  Gemfile \
  Gemfile.lock \
  ./

# Gemfile includes **/engines/*/*.gemspec, so we need to include them here too,
# and gemspecs by default depend on a version.rb file so we copy that in too.
COPY --chown=${UID} \
  --parents \
  ./dashboard/engines/*/*.gemspec \
  ./

COPY --chown=${UID} \
  --parents \
  ./dashboard/engines/*/lib/*/version.rb \
  ./

RUN --mount=type=cache,sharing=locked,uid=${UID},gid=${GID},target=${HOME}/.rbenv/versions/3.0.5/lib/ruby/gems/3.0.0/cache <<EOF
  bundle install --jobs 8 --quiet
EOF

################################################################################
FROM code-dot-org-core AS code-dot-org-uv-sync
################################################################################

# Install python packages

COPY --chown=${UID} \
  pyproject.toml \
  uv.lock \
  ./

# We need a COPY line for each pyproject.toml in python/.
#
# Generate these by running this from code-dot-org/ root dir:
#   find python | grep pyproject.toml | grep -v .venv | awk '{print "COPY --chown=${UID} " $0 " " $0}'
COPY --chown=${UID} python/pycdo/pyproject.toml python/pycdo/pyproject.toml
COPY --chown=${UID} python/pythonlab/pythonlab_setup/pyproject.toml python/pythonlab/pythonlab_setup/pyproject.toml
COPY --chown=${UID} python/pythonlab/neighborhood/pyproject.toml python/pythonlab/neighborhood/pyproject.toml
COPY --chown=${UID} python/pythonlab/unittest_runner/pyproject.toml python/pythonlab/unittest_runner/pyproject.toml

RUN <<EOF
  # --no-install-workspace means we dont need the full contents of each package under python/
  # but we still need their pyproject.toml files to be installed
  uv sync --frozen --no-install-workspace --quiet
EOF

################################################################################
FROM code-dot-org-core AS code-dot-org-node_modules
################################################################################

COPY --chown=${UID} \
  ./apps/package.json \
  ./apps/yarn.lock \
  ./apps/.yarnrc.yml \
  ./apps/

COPY --chown=${UID} \
  ./apps/.yarn \
  ./apps/.yarn/

COPY --chown=${UID} \
  ./apps/eslint \
  ./apps/eslint/

# NOTE: Docker supports `**` globs here, but Skaffold dependency/context handling
# does not yet, so we use `*` for now.
COPY --chown=${UID} \
  --parents \
  ./frontend/packages/*/package.json \
  ./

RUN \
  #
  # Instuct Docker to maintain a download cache for yarn packages
  # so we don't have to re-download npms whenever package.json changes
  --mount=type=cache,sharing=locked,uid=${UID},gid=${GID},target=${SRC}/apps/.yarn/cache \
  <<EOF
  # yarn install
  cd apps
  CI=true yarn install --immutable --silent
EOF

################################################################################
FROM code-dot-org-node_modules AS code-dot-org-yarn-build
################################################################################

# Its sad, but we have to have our `yarn build` depend on installing ruby
# just for bundle exec. Maybe we could decouple? NOTE, this link of rbenv
# is also how we get ruby into the main build, its faster than double-linking.
#
# grunt exec:generateSharedConstants => bundle exec ./script/generateSharedConstants.rb
# grunt exec:generateRegionConfigurations => bundle exec ./script/generateRegionConfigurations.rb
COPY --chown=${UID} --link \
  --from=code-dot-org-bundle-install ${HOME}/.rbenv \
  ${HOME}/.rbenv

# bundle exec also needs the repo's Ruby/Bundler manifests so rbenv selects the
# copied Ruby version and Bundler can resolve the already-installed gem set.
COPY --chown=${UID} --link \
  --from=code-dot-org-bundle-install ${SRC}/.ruby-version ${SRC}/Gemfile ${SRC}/Gemfile.lock \
  ./

COPY --chown=${UID} --link \
  --from=code-dot-org-bundle-install ${SRC}/dashboard/engines/ \
  ./dashboard/engines/

# grunt exec:generateSharedConstants => bundle exec ./script/generateSharedConstants.rb => (lib/cdo/shared_constants.rb, lib/cdo/shared_constants/**)
# grunt exec:generateRegionConfigurations => bundle exec ./script/generateRegionConfigurations.rb => (lib/cdo.rb, lib/cdo/global_edition.rb)
COPY --chown=${UID} ./lib/ ./lib/

# grunt exec:convertScssVars => ./script/convert-scss-variables.js
COPY --chown=${UID} ./shared/css/ ./shared/css/
COPY --chown=${UID} --parents ./tools/scripts/convertScssToJs.js ./

# grunt exec:generateRegionConfigurations => bundle exec ./script/generateRegionConfigurations.rb
COPY --chown=${UID} ./config/i18n/ ./config/i18n/
COPY --chown=${UID} ./config/global_editions/ ./config/global_editions/
COPY --chown=${UID} --parents ./config.yml.erb ./
COPY --chown=${UID} --parents ./config/development.yml.erb ./

# grunt lint-entry-points => apps/script/checkEntryPoints.js => ./dashboard/app/views
COPY --chown=${UID} ./dashboard/app/views/ ./dashboard/app/views/

ENV HAS_PEGASUS_CONTENT='false'

# yarn build resolves @cdo/static and @cdo/i18n aliases at compile time, so
# reuse those split assets here without reintroducing them from the host context.
COPY --chown=${UID} --link \
  --from=code-dot-org-static /apps/static \
  ./apps/static

COPY --chown=${UID} --link \
  --from=code-dot-org-static /apps/i18n \
  ./apps/i18n

# Main JS subdirs
COPY --chown=${UID} ./apps/ ./apps/
COPY --chown=${UID} ./frontend/ ./frontend/

# comnpared to what we do (basically a dev rake build), on staging / prod-like build mode:
# run yarn build:dist because optimize_webpack_assets is true and CI is not assumed

RUN \
  --mount=type=cache,sharing=locked,uid=${UID},gid=${GID},target=${SRC}/apps/.yarn/cache \
  <<EOF
  cd apps
  CI=true yarn build
EOF

# ################################################################################
FROM code-dot-org-core
# ################################################################################

RUN \
  # We don't copy in .git (huge), but `bundle exec rake install` references .git in 
  # a couple places, like git hooks, and fails without it, create a blank .git for now
  git init -b staging --quiet

# NOTE: `COPY --link` has been disabled in Docker 24 due to a bug in moby
# as of today, it does nothing unless `Use containerd for pulling and storing images` is enabled
# for explanation see: https://github.com/docker/buildx/issues/1099#issuecomment-1524940116
# upstream issue: https://github.com/moby/moby/issues/45111
#
# Unfortunately "use containerd" appears to non-performant, it is ridiculously slow
# at handling the "exporting image" step at the end of a build, possibly/probably due
# to a file-by-file diffing step (instead of relying on nanosecond filesystem timestamps)
#
# Here is an issue with somebody having a similar problem with the containerd differ:
# https://github.com/moby/buildkit/issues/1704
#
# This was reported to be fixed by:
# https://github.com/moby/buildkit/pull/2181
# But some of that funcationality may have been reverted a few months later:
# https://github.com/moby/buildkit/pull/2480
#
# Meanwhile, upstream containerd appears to have this issue with no fix in sight:
# https://github.com/containerd/continuity/pull/145
#
# Question: what if any set of builders should enable --link
# in a way that's performant on Docker 24?

# Link in pegasus built into a separate dockerfile
COPY --chown=${UID} --link \
  --from=code-dot-org-pegasus / \
  ./

# Link in large static assets built in a separate dockerfile
COPY --chown=${UID} --link \
  --from=code-dot-org-static / \
  ./

# Link in levels and other db seed data built in a separate dockerfile
COPY --chown=${UID} --link \
  --from=code-dot-org-db-seed  / \
  ./

# Copy in python packages from code-dot-org/.venv (built in parallel)
COPY --chown=${UID} --link \
  --from=code-dot-org-uv-sync ${SRC}/.venv \
  ${SRC}/.venv

# # Copy in python install for the venv from ~/.local/share/uv
COPY --chown=${UID} --link \
  --from=code-dot-org-uv-sync ${HOME}/.local/share/uv \
  ${HOME}/.local/share/uv

# Link in the full JS build layer, includes:
# - `yarn build` output
# - installed npm / yarn packages (node_modules)
# - weirdly, rbenv gets added here because its required by this step, and more perf to link once
COPY --chown=${UID} --link \
  --from=code-dot-org-yarn-build / \
  ./

# Re-apply the bundle-install rbenv tree directly for runtime.
# Copying the full yarn-build filesystem is not preserving the installed bundle
# correctly in the final image, which breaks `bundle exec rails` in mimic.
COPY --chown=${UID} --link \
  --from=code-dot-org-bundle-install ${HOME}/.rbenv \
  ${HOME}/.rbenv

# Copy in the rest of the source code
COPY --chown=${UID} --link ./ ./

# Temporary locals.yml used to bootstrap `rake build`
COPY --chown=${UID} ./k8s/docker/locals.rake-build.yml locals.yml

RUN <<EOF
  # Run final build optimizations that require full source code
  #
  # Our high-level goal is to save startup time by doing as much as possible at
  # docker build time. So if you need it, do it here. But, if you can: do it earlier!

  # we pre-optimized this step earlier to install 3rd party packages.
  # Now we just need to build our in-house python packages.
  uv sync --frozen --quiet

  # This is a very slow step, particularly in cases where the server
  # will be running a live version of the apps/ build rather than having
  # it served off disk (so why wait for a very slow `yarn build step`).
  #
  # Having done a diff, it seems that the build output between RAILS_ENV=development
  # and being unset is basically non-existent, but if we dont set RAILS_ENV=development
  # then `rake build` will do weird stuff like trying to restart the dashboard-server,
  # and possibly accidentally start it in the process?
  # RAILS_ENV=development rake build

  # Analyzed `rake build`, and the only thing we were not doing was making
  # these two symlinks, so here goes:
  ln -sfn ${SRC}/apps/build/package ${SRC}/dashboard/public/blockly
  ln -sfn ${SRC}/dashboard/test/ui ${SRC}/dashboard/public/ui_test

  # now in staging / in prod-like build mode, we also run (optionally with cdn_enabled: true)
  # rake assets:precompile
  #
  # aif cdn_enabled is set, that also runs:
  # assets:record_manifest_files, assets:precompile_application_js, and assets:sync

  rm locals.yml
EOF

ENTRYPOINT [ "/usr/bin/zsh" ]

LABEL org.opencontainers.image.source="https://github.com/code-dot-org/code-dot-org"
