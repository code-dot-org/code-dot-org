# syntax=docker/dockerfile:1

# Pull in the static assets and db seed layers
# built from separate dockerfiles by skaffold
ARG CODE_DOT_ORG_STATIC
ARG CODE_DOT_ORG_DB_SEED
ARG CODE_DOT_ORG_CORE

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

ENTRYPOINT [ "/usr/bin/zsh" ]

LABEL org.opencontainers.image.source="https://github.com/code-dot-org/code-dot-org"
