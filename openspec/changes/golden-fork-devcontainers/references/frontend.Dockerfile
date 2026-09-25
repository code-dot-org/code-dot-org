# syntax=docker/dockerfile:1
#
# cdo-spike-d-frontend: prototype devcontainer flavor for code-dot-org/frontend.
# Source tree is bind-mounted at runtime (agents work on branches), so this
# image does NOT bake node_modules -- it would just be shadowed by the mount.
# Instead it bakes a fully-warm Yarn Berry cache (zip archives of every
# resolved package), so `yarn install --immutable` at container start is a
# pure unpack-from-cache with zero network traffic.

FROM node:20-bookworm-slim AS base
# node:20-bookworm-slim matches repo root /.nvmrc (20).

# node:20-bookworm-slim already ships a non-root `node` user at uid/gid 1000
# -- reuse it rather than creating a second uid-1000 account (groupadd/
# useradd for a fresh 1000:1000 collides with this and errors out).
ARG UID=1000
ARG GID=1000
ARG USERNAME=node

RUN apt-get update -qq \
  && apt-get install -y -qq --no-install-recommends \
       git git-lfs ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# frontend/package.json pins packageManager: yarn@4.12.0 -- activate that
# exact version via corepack rather than whatever yarn ships with the base
# image (or an older pin copied from some other Dockerfile).
#
# PITFALL: corepack's download cache defaults to $HOME/.cache/node/corepack.
# `corepack prepare` here runs as root ($HOME=/root); the runtime container
# runs as the `node` user ($HOME=/home/node). Without pinning COREPACK_HOME
# to a path independent of $HOME, the runtime `yarn` invocation can't find
# the cached release and refetches it from repo.yarnpkg.com -- defeating the
# zero-network goal (and failing outright under --network=none).
ENV COREPACK_HOME=/opt/corepack
RUN corepack enable && corepack prepare yarn@4.12.0 --activate \
  && chmod -R a+rX /opt/corepack

# PITFALL: this yarn/nodeLinker combination has enableGlobalCache: true by
# default (`yarn config get enableGlobalCache` => true even with no explicit
# setting). With global cache on, yarn resolves the cache path as
# `${globalFolder}/cache` and ignores YARN_CACHE_FOLDER outright -- setting
# only YARN_CACHE_FOLDER leaves the real cache at the default
# $HOME/.yarn/berry/cache (empty in this image, since $HOME differs between
# build-time root and runtime `node` user anyway). Redirect YARN_GLOBAL_FOLDER
# instead; that's the setting global-cache mode actually consults.
ENV YARN_GLOBAL_FOLDER=/opt/yarn-cache
RUN mkdir -p /opt/yarn-cache && chown ${UID}:${GID} /opt/yarn-cache

# --- cache-warm: throwaway stage, only its /opt/yarn-cache survives -------
FROM base AS cache-warm
USER ${USERNAME}
WORKDIR /work/frontend

# Manifests only (paths preserved) -- enough for `yarn install` to resolve
# and fetch the full dependency graph into the cache. No app source needed.
COPY --chown=${UID}:${GID} frontend/package.json frontend/yarn.lock frontend/.yarnrc.yml frontend/turbo.json ./
COPY --chown=${UID}:${GID} frontend/apps/design-system-storybook/package.json apps/design-system-storybook/package.json
COPY --chown=${UID}:${GID} frontend/apps/studio/package.json apps/studio/package.json
COPY --chown=${UID}:${GID} frontend/packages/changelogs/package.json packages/changelogs/package.json
COPY --chown=${UID}:${GID} frontend/packages/component-library/package.json packages/component-library/package.json
COPY --chown=${UID}:${GID} frontend/packages/component-library-styles/package.json packages/component-library-styles/package.json
COPY --chown=${UID}:${GID} frontend/packages/core/package.json packages/core/package.json
COPY --chown=${UID}:${GID} frontend/packages/e2e-tests/package.json packages/e2e-tests/package.json
COPY --chown=${UID}:${GID} frontend/packages/fonts/package.json packages/fonts/package.json
COPY --chown=${UID}:${GID} frontend/packages/labs/ailab/package.json packages/labs/ailab/package.json
COPY --chown=${UID}:${GID} frontend/packages/labs/base/package.json packages/labs/base/package.json
COPY --chown=${UID}:${GID} frontend/packages/labs/music/package.json packages/labs/music/package.json
COPY --chown=${UID}:${GID} frontend/packages/labs/oceans/package.json packages/labs/oceans/package.json
COPY --chown=${UID}:${GID} frontend/packages/lint-config/package.json packages/lint-config/package.json
COPY --chown=${UID}:${GID} frontend/packages/markdown/package.json packages/markdown/package.json
COPY --chown=${UID}:${GID} frontend/packages/playwright-support/package.json packages/playwright-support/package.json
COPY --chown=${UID}:${GID} frontend/packages/users/package.json packages/users/package.json

# Populate the cache. The node_modules this produces is throwaway -- it is
# not copied to the final stage (multi-stage build; only /opt/yarn-cache
# from this layer is copied out below).
RUN yarn install --immutable

# --- final: base + warm cache only, no node_modules, no source -----------
FROM base AS final
COPY --from=cache-warm --chown=${UID}:${GID} /opt/yarn-cache /opt/yarn-cache
USER ${USERNAME}
WORKDIR /workspace
CMD ["/bin/bash"]
