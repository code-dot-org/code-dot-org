# syntax=docker/dockerfile:1.22

# We pin to syntax=docker/dockerfile:1.22 to get access to:
# - `COPY --parents`, see: https://docs.docker.com/reference/dockerfile/#copy---parents
#
# NOTE: switch back to `docker/dockerfile:1` once it updates to track a version >=1.22

# Pull in the static assets and db seed layers built from separate dockerfiles by
# skaffold.
#
# The frontend-chain images default to `scratch` so backend-only builds
# (--target code-dot-org-activejob-only) can omit them: BuildKit rejects a
# blank FROM name at parse time even for stages the target never reaches.
# Targets that actually consume these stages (runtime) get real values from
# skaffold.
ARG CODE_DOT_ORG_PEGASUS=scratch
ARG CODE_DOT_ORG_STATIC=scratch
ARG CODE_DOT_ORG_DB_SEED=scratch
ARG CODE_DOT_ORG_CORE
ARG BUNDLE_JOBS=2
ARG BUNDLE_WITHOUT=development:test
ARG SKIP_FRONTEND_BUILD=0

FROM $CODE_DOT_ORG_PEGASUS AS code-dot-org-pegasus
FROM $CODE_DOT_ORG_STATIC AS code-dot-org-static
FROM $CODE_DOT_ORG_DB_SEED AS code-dot-org-db-seed
FROM $CODE_DOT_ORG_CORE AS base

################################################################################
FROM base AS build
################################################################################

ARG BUNDLE_WITHOUT=development:test

USER root

RUN <<EOF
  apt-get -qq update
  export DEBIAN_FRONTEND=noninteractive
  apt-get -qq -y install --no-install-recommends \
    build-essential \
    default-libmysqlclient-dev \
    git \
    libmagickwand-dev \
    pkg-config \
    python3 \
    unzip \
    > /dev/null

  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null
  apt-get install -qq -y nodejs > /dev/null
  corepack enable

  curl -LsSf https://astral.sh/uv/0.5.18/install.sh | XDG_BIN_HOME=/usr/local/bin UV_NO_MODIFY_PATH=1 sh

  rm -rf /var/lib/apt/lists/*
EOF

ENV \
  BUNDLE_DEPLOYMENT=1 \
  BUNDLE_WITHOUT=${BUNDLE_WITHOUT}

RUN <<EOF
  mkdir -p ${BUNDLE_PATH}/ruby/3.2.0/bundler/gems
  chown -R ${UID}:${GID} ${BUNDLE_PATH}
EOF

USER ${USERNAME}
WORKDIR ${SRC}

################################################################################
FROM build AS code-dot-org-bundle-install
################################################################################

ARG BUNDLE_JOBS
ARG BUNDLE_WITHOUT=development:test

ENV BUNDLE_WITHOUT=${BUNDLE_WITHOUT}

COPY --chown=${UID}:${GID} \
  .ruby-version \
  Gemfile \
  Gemfile.lock \
  ./

# Gemfile includes **/engines/*/*.gemspec, so we need to include them here too,
# and gemspecs by default depend on a version.rb file so we copy that in too.
COPY --chown=${UID}:${GID} \
  --parents \
  ./dashboard/engines/*/*.gemspec \
  ./

COPY --chown=${UID}:${GID} \
  --parents \
  ./dashboard/engines/*/lib/*/version.rb \
  ./

# NOTE: the gem cache path must track .ruby-version: ruby/<major.minor.0>.
# Update it when bumping Ruby or the mount silently stops caching.
RUN --mount=type=cache,id=code-dot-org-bundle-cache,sharing=shared,uid=${UID},gid=${GID},target=${BUNDLE_PATH}/ruby/3.2.0/cache <<EOF
  gem install bundler -v "$(awk '/BUNDLED WITH/{getline; print $1}' Gemfile.lock)" --no-document
  bundle install --jobs "${BUNDLE_JOBS}"
  bundle exec bootsnap precompile --gemfile
  # The gem cache is a BuildKit cache mount and is not committed to the image.
  # Retain it so canceled or invalidated builds do not download every gem again.
  rm -rf ~/.bundle "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git
EOF

################################################################################
FROM build AS code-dot-org-uv-sync
################################################################################

# Install python packages.

COPY --chown=${UID}:${GID} \
  pyproject.toml \
  uv.lock \
  ./

# We need a COPY line for each pyproject.toml in python/.
#
# Generate these by running this from code-dot-org/ root dir:
#   find python | grep pyproject.toml | grep -v .venv | awk '{print "COPY --chown=${UID}:${GID} " $0 " " $0}'
COPY --chown=${UID}:${GID} python/pycdo/pyproject.toml python/pycdo/pyproject.toml
COPY --chown=${UID}:${GID} python/pythonlab/pythonlab_setup/pyproject.toml python/pythonlab/pythonlab_setup/pyproject.toml
COPY --chown=${UID}:${GID} python/pythonlab/neighborhood/pyproject.toml python/pythonlab/neighborhood/pyproject.toml
COPY --chown=${UID}:${GID} python/pythonlab/unittest_runner/pyproject.toml python/pythonlab/unittest_runner/pyproject.toml

RUN <<EOF
  # --no-install-workspace means we dont need the full contents of each package under python/
  # but we still need their pyproject.toml files to be installed.
  uv sync --frozen --no-install-workspace --quiet
  mkdir -p ${HOME}/.local/share/uv
EOF

################################################################################
FROM build AS code-dot-org-node_modules
################################################################################

ARG SKIP_FRONTEND_BUILD=0

COPY --chown=${UID}:${GID} \
  ./apps/package.json \
  ./apps/yarn.lock \
  ./apps/.yarnrc.yml \
  ./apps/

COPY --chown=${UID}:${GID} \
  ./apps/.yarn \
  ./apps/.yarn/

COPY --chown=${UID}:${GID} \
  ./apps/eslint \
  ./apps/eslint/

# Keep this in sync with frontend/package.json workspaces that apps imports via
# portal: dependencies. Docker supports **, but Skaffold dependency/context
# handling does not yet, so list each workspace depth explicitly.
COPY --chown=${UID}:${GID} \
  --parents \
  ./frontend/packages/*/package.json \
  ./frontend/packages/labs/*/package.json \
  ./

RUN \
  # Instruct Docker to maintain a download cache for yarn packages so we don't
  # have to re-download npms whenever package.json changes.
  --mount=type=cache,sharing=locked,uid=${UID},gid=${GID},target=${SRC}/apps/.yarn/cache \
  <<EOF
  if [ "${SKIP_FRONTEND_BUILD}" = "1" ]; then
    mkdir -p apps/build/package/js apps/build/package/css
  else
    cd apps
    CI=true yarn install --immutable --silent
  fi
EOF

################################################################################
FROM code-dot-org-node_modules AS code-dot-org-yarn-build
################################################################################

ARG SKIP_FRONTEND_BUILD=0

# grunt exec:generateSharedConstants => bundle exec ./script/generateSharedConstants.rb
# grunt exec:generateRegionConfigurations => bundle exec ./script/generateRegionConfigurations.rb
COPY --chown=${UID}:${GID} --link \
  --from=code-dot-org-bundle-install ${BUNDLE_PATH} \
  ${BUNDLE_PATH}

COPY --chown=${UID}:${GID} --link \
  --from=code-dot-org-bundle-install ${SRC}/.ruby-version ${SRC}/Gemfile ${SRC}/Gemfile.lock \
  ./

COPY --chown=${UID}:${GID} ./dashboard/engines/ ./dashboard/engines/

COPY --chown=${UID}:${GID} --link \
  --from=code-dot-org-uv-sync ${SRC}/.venv \
  ${SRC}/.venv

COPY --chown=${UID}:${GID} --link \
  --from=code-dot-org-uv-sync ${HOME}/.local/share/uv \
  ${HOME}/.local/share/uv

# grunt exec:generateSharedConstants => bundle exec ./script/generateSharedConstants.rb => (lib/cdo/shared_constants.rb, lib/cdo/shared_constants/**)
# grunt exec:generateRegionConfigurations => bundle exec ./script/generateRegionConfigurations.rb => (lib/cdo.rb, lib/cdo/global_edition.rb)
COPY --chown=${UID}:${GID} ./lib/ ./lib/

# shared_constants.rb requires the repo-root deployment.rb to bootstrap CDO and
# $LOAD_PATH before requiring cdo/i18n (PR #72278).
COPY --chown=${UID}:${GID} ./deployment.rb ./

# grunt exec:convertScssVars => ./script/convert-scss-variables.js
COPY --chown=${UID}:${GID} ./shared/css/ ./shared/css/
COPY --chown=${UID}:${GID} ./shared/fonts/ ./shared/fonts/
COPY --chown=${UID}:${GID} ./shared/middleware/ ./shared/middleware/
COPY --chown=${UID}:${GID} --parents ./tools/scripts/convertScssToJs.js ./

# grunt exec:generateRegionConfigurations => bundle exec ./script/generateRegionConfigurations.rb
COPY --chown=${UID}:${GID} ./config/i18n/ ./config/i18n/
COPY --chown=${UID}:${GID} ./config/global_editions/ ./config/global_editions/
COPY --chown=${UID}:${GID} --parents ./config.yml.erb ./
COPY --chown=${UID}:${GID} --parents ./config/development.yml.erb ./

# grunt exec:generateStudioRoutes => bundle exec ./script/generateStudioRoutes.rb
COPY --chown=${UID}:${GID} --parents \
  ./dashboard/config.ru \
  ./dashboard/config/application.rb \
  ./dashboard/config/boot.rb \
  ./dashboard/config/bundle_gemfile.rb \
  ./dashboard/config/cable.yml \
  ./dashboard/config/database.yml \
  ./dashboard/config/environment.rb \
  ./dashboard/config/routes.rb \
  ./

COPY --chown=${UID}:${GID} ./dashboard/config/environments/ ./dashboard/config/environments/
COPY --chown=${UID}:${GID} ./dashboard/config/initializers/ ./dashboard/config/initializers/
COPY --chown=${UID}:${GID} ./dashboard/config/routes/ ./dashboard/config/routes/
COPY --chown=${UID}:${GID} ./dashboard/legacy/middleware/ ./dashboard/legacy/middleware/
COPY --chown=${UID}:${GID} ./dashboard/lib/ ./dashboard/lib/
COPY --chown=${UID}:${GID} ./dashboard/app/channels/ ./dashboard/app/channels/
COPY --chown=${UID}:${GID} ./dashboard/app/controllers/ ./dashboard/app/controllers/
COPY --chown=${UID}:${GID} ./dashboard/app/dsl/ ./dashboard/app/dsl/
COPY --chown=${UID}:${GID} ./dashboard/app/helpers/ ./dashboard/app/helpers/
COPY --chown=${UID}:${GID} ./dashboard/app/jobs/ ./dashboard/app/jobs/
COPY --chown=${UID}:${GID} ./dashboard/app/mailers/ ./dashboard/app/mailers/
COPY --chown=${UID}:${GID} ./dashboard/app/models/ ./dashboard/app/models/
COPY --chown=${UID}:${GID} ./dashboard/app/serializers/ ./dashboard/app/serializers/

# grunt lint-entry-points => apps/script/checkEntryPoints.js => ./dashboard/app/views
COPY --chown=${UID}:${GID} ./dashboard/app/views/ ./dashboard/app/views/

# Temporary locals.yml used while Rails boots for build-time route generation.
COPY --chown=${UID}:${GID} ./k8s/docker/locals.rake-build.yml locals.yml

# yarn build resolves @cdo/static and @cdo/i18n aliases at compile time, so
# reuse those split assets here without reintroducing them from the host context.
COPY --chown=${UID}:${GID} --link \
  --from=code-dot-org-static /apps/static \
  ./apps/static

COPY --chown=${UID}:${GID} --link \
  --from=code-dot-org-static /apps/i18n \
  ./apps/i18n

# Main JS subdirs.
COPY --chown=${UID}:${GID} ./apps/ ./apps/
COPY --chown=${UID}:${GID} ./frontend/ ./frontend/

RUN \
  --mount=type=cache,sharing=locked,uid=${UID},gid=${GID},target=${SRC}/apps/.yarn/cache \
  <<EOF
  cd apps
  if [ "${SKIP_FRONTEND_BUILD}" = "1" ]; then
    mkdir -p build/package/js build/package/css
  else
    AWS_EC2_METADATA_DISABLED=true SKIP_SCRIPT_PRELOAD=1 CI=true yarn build
  fi
EOF

################################################################################
FROM base AS code-dot-org-activejob-only
################################################################################

ARG BUNDLE_WITHOUT=development:test

# Rails loads uglifier/execjs on boot, but this target has no Node and may
# exclude mini_racer via BUNDLE_WITHOUT. Assets are built before runtime.
ENV \
  BUNDLE_DEPLOYMENT=1 \
  BUNDLE_WITHOUT=${BUNDLE_WITHOUT} \
  EXECJS_RUNTIME=Disabled

COPY --chown=${UID}:${GID} --link \
  --from=code-dot-org-bundle-install ${BUNDLE_PATH} \
  ${BUNDLE_PATH}

COPY --chown=${UID}:${GID} --link \
  --from=code-dot-org-uv-sync ${SRC}/.venv \
  ${SRC}/.venv

COPY --chown=${UID}:${GID} --link \
  --from=code-dot-org-uv-sync ${HOME}/.local/share/uv \
  ${HOME}/.local/share/uv

COPY --chown=${UID}:${GID} --link ./ ./

COPY --chown=${UID}:${GID} --link \
  --from=build /usr/local/bin/uv \
  /usr/local/bin/uv

RUN <<EOF
  mkdir -p ${SRC}/apps/build/package/js ${SRC}/apps/build/package/css
  mkdir -p ${SRC}/dashboard/public
  ln -sfn ${SRC}/apps/build/package ${SRC}/dashboard/public/blockly
  ln -sfn ${SRC}/dashboard/test/ui ${SRC}/dashboard/public/ui_test
  bundle exec bootsnap precompile dashboard/app dashboard/config lib
EOF

USER 1000:1000

################################################################################
FROM base AS runtime
################################################################################

ARG BUNDLE_WITHOUT=development:test

# Rails loads uglifier/execjs on boot, but runtime has no Node and may exclude
# mini_racer via BUNDLE_WITHOUT. Assets are built before runtime.
ENV \
  BUNDLE_DEPLOYMENT=1 \
  BUNDLE_WITHOUT=${BUNDLE_WITHOUT} \
  EXECJS_RUNTIME=Disabled

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

# Link in pegasus built into a separate dockerfile.
COPY --chown=${UID}:${GID} --link \
  --from=code-dot-org-pegasus / \
  ./

# Link in large static assets built in a separate dockerfile.
COPY --chown=${UID}:${GID} --link \
  --from=code-dot-org-static / \
  ./

# Link in levels and other db seed data built in a separate dockerfile.
COPY --chown=${UID}:${GID} --link \
  --from=code-dot-org-db-seed  / \
  ./

COPY --chown=${UID}:${GID} --link \
  --from=code-dot-org-bundle-install ${BUNDLE_PATH} \
  ${BUNDLE_PATH}

COPY --chown=${UID}:${GID} --link \
  --from=code-dot-org-uv-sync ${SRC}/.venv \
  ${SRC}/.venv

COPY --chown=${UID}:${GID} --link \
  --from=code-dot-org-uv-sync ${HOME}/.local/share/uv \
  ${HOME}/.local/share/uv

# Link in the JS build layer from ${SRC}, includes:
# - `yarn build` output (apps/build/package, served via the public/blockly symlink)
# - installed npm / yarn packages (node_modules)
#
# Copy ${SRC}/ (not /): `COPY <dir> <dest>` copies the CONTENTS of <dir>, so
# `COPY / ./` would place the `code-dot-org` dir *inside* ${SRC}, nesting the
# whole tree at ${SRC}/code-dot-org and leaving the blockly symlink dangling.
COPY --chown=${UID}:${GID} --link \
  --from=code-dot-org-yarn-build ${SRC}/ \
  ./

# Copy in the rest of the source code.
COPY --chown=${UID}:${GID} --link ./ ./

# Temporary locals.yml used to bootstrap build-time optimizations.
COPY --chown=${UID}:${GID} ./k8s/docker/locals.rake-build.yml locals.yml

COPY --chown=${UID}:${GID} --link \
  --from=build /usr/local/bin/uv \
  /usr/local/bin/uv

RUN <<EOF
  # Run final build optimizations that require full source code.
  #
  # Our high-level goal is to save startup time by doing as much as possible at
  # docker build time. So if you need it, do it here. But, if you can: do it earlier.

  # We pre-optimized this step earlier to install 3rd party packages.
  # Now we just need to build our in-house python packages.
  uv sync --frozen --quiet

  # Analyzed `rake build`, and the only thing we were not doing was making
  # these two symlinks, so here goes:
  ln -sfn ${SRC}/apps/build/package ${SRC}/dashboard/public/blockly
  ln -sfn ${SRC}/dashboard/test/ui ${SRC}/dashboard/public/ui_test

  bundle exec bootsnap precompile dashboard/app dashboard/config lib

  rm locals.yml
EOF

USER 1000:1000

LABEL org.opencontainers.image.source="https://github.com/code-dot-org/code-dot-org"
