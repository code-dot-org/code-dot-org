# syntax=docker/dockerfile:1

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

# /Gemfile includes '**/engines/*/*.gemspec', these will need to be added to this dockerfile
# one by one as they are defined, or the build will be broken.
COPY --chown=${UID} \
  ./dashboard/engines/marketing/marketing.gemspec \
  ./dashboard/engines/marketing/

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

# Required to handle the `portal:../frontend/packages/component-library` link in apps/package.json
COPY --chown=${UID} \
  ./frontend/packages/component-library/package.json \
  ./frontend/packages/component-library/

# Required to handle the `portal:../frontend/packages/component-library-styles` link in apps/package.json
COPY --chown=${UID} \
  ./frontend/packages/component-library-styles/package.json \
  ./frontend/packages/component-library-styles/

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

# Copy in ~/.rbenv (built in parallel)
COPY --chown=${UID} --link \
  --from=code-dot-org-bundle-install ${HOME}/.rbenv \
  ${HOME}/.rbenv

# Copy in apps/node_modules (built in parallel)
COPY --chown=${UID} --link \
  --from=code-dot-org-node_modules ${SRC}/apps/node_modules \
  ./apps/node_modules

# Copy in corepack cache (ugh, but this keeps it from prompting the first time we run yarn)
COPY --chown=${UID} --link \
  --from=code-dot-org-node_modules ${HOME}/.cache/node \
  ${HOME}/.cache/node 

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
  RAILS_ENV=development rake build
  rm locals.yml
EOF

ENTRYPOINT [ "/usr/bin/zsh" ]

LABEL org.opencontainers.image.source="https://github.com/code-dot-org/code-dot-org"
