# cdo-gems: cdo-base plus the production gem set, keyed on Gemfile.lock.
#
# The bundle is compiled in cdo-build and copied onto cdo-base, so the
# shipped image carries the gems but none of the toolchain that built them.
#
# One gem set, the union of every non-development group: one layer shared by
# web and worker beats two near-duplicate private ones on a node running both.
#
# Build context is the repo root, pruned to 56 kB by
# Dockerfile.dockerignore. Build from the root, not from this directory:
#   docker build -f docker/gems/Dockerfile --build-arg BUILD_IMAGE=... .

# cdo-build is not published, so it has no default: a caller must build it
# first and name it here. See docker/build/README.md.
ARG BUILD_IMAGE
ARG BASE_IMAGE=ghcr.io/code-dot-org/cdo-base:latest

################################################################################
FROM ${BUILD_IMAGE} AS builder
################################################################################

# Empty means "as many jobs as the build machine has cores". Set it to a
# number only to throttle a memory-constrained build: each job can spawn a
# native compile, so peak memory scales with it, not with core count.
ARG BUNDLE_JOBS=

# UID/GID/BUNDLE_PATH and the writable ${BUNDLE_PATH}/ruby/3.2.0 tree come
# from cdo-build, which also puts us in ${SRC} as the non-root cdo user.
COPY --chown=1000:1000 .ruby-version Gemfile Gemfile.lock ./

# The Gemfile registers the engines as path gems via
#   glob: '{,dashboard/}engines/*/*.gemspec'
# so their gemspecs must be present to resolve the bundle, and each gemspec
# requires its own lib/*/version.rb.
#
# Listed file by file rather than copying the tree, because the tree also
# holds engine source that changes ~9x more often than these five files do,
# and any change under it would invalidate the bundle install below. The
# glob-with-paths form of this is COPY --parents, which needs buildah 1.40;
# the floor is 24.04's 1.33.
#
# A new engine needs a new pair of lines here. Forgetting fails loudly: the
# Gemfile globs gemspecs at install time, so a missing one makes bundler
# report "You have deleted from the Gemfile: <engine>" under frozen mode.
COPY --chown=1000:1000 dashboard/engines/cdo_contentful/cdo_contentful.gemspec dashboard/engines/cdo_contentful/
COPY --chown=1000:1000 dashboard/engines/cdo_contentful/lib/cdo_contentful/version.rb dashboard/engines/cdo_contentful/lib/cdo_contentful/
COPY --chown=1000:1000 dashboard/engines/hoc_legacy/hoc_legacy.gemspec dashboard/engines/hoc_legacy/
COPY --chown=1000:1000 dashboard/engines/observability/observability.gemspec dashboard/engines/observability/
COPY --chown=1000:1000 dashboard/engines/observability/lib/observability/version.rb dashboard/engines/observability/lib/observability/

# The gem cache is a cache mount, not an image layer: it keeps a canceled or
# lockfile-invalidated build from re-downloading every gem, and keeps 110 MB
# of .gem tarballs out of the copied tree. Its path must track
# .ruby-version — ruby/<major.minor.0> — or the mount silently stops
# caching. Cache mounts are the one BuildKit mount buildah supports natively
# at the 4.9 floor.
#
# Bundler's own version comes from the lockfile, so the bundle cannot be
# resolved by a different bundler than the one that wrote it.
RUN --mount=type=cache,id=cdo-gems-bundle-cache,sharing=locked,uid=1000,gid=1000,target=/usr/local/bundle/ruby/3.2.0/cache \
  set -eux \
  && gem install bundler -v "$(awk '/BUNDLED WITH/{getline; print $1}' Gemfile.lock)" --no-document \
  && bundle install --jobs "${BUNDLE_JOBS:-$(nproc)}" \
  && bundle check \
  && rm -rf ~/.bundle "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git

################################################################################
FROM ${BASE_IMAGE}
################################################################################

ARG BUNDLE_PATH=/usr/local/bundle
ARG BUNDLE_WITHOUT=development:test
# cdo-base sets WORKDIR but does not export SRC, so the builder's path has to
# be named here to copy back out of it.
ARG SRC=/code-dot-org

# BUNDLE_WITHOUT must be set at runtime, not just at install time: without it
# Bundler.setup tries to activate the development and test groups that were
# never installed. BUNDLE_DEPLOYMENT makes a bundle that drifts from the
# lockfile fail loudly instead of quietly resolving something else.
ENV \
  BUNDLE_DEPLOYMENT=1 \
  BUNDLE_PATH=${BUNDLE_PATH} \
  BUNDLE_WITHOUT=${BUNDLE_WITHOUT} \
  PATH=${BUNDLE_PATH}/bin:${PATH}

COPY --from=builder --chown=1000:1000 ${BUNDLE_PATH} ${BUNDLE_PATH}

# The lockfile and the path-gem gemspecs travel with the gems because
# Bundler cannot resolve the bundle without them — a gems image that omits
# them cannot even run `bundle check`. Downstream flavors overwrite these
# with the same content when they copy the real Rails source.
COPY --chown=1000:1000 .ruby-version Gemfile Gemfile.lock ./
COPY --from=builder --chown=1000:1000 ${SRC}/dashboard/engines ./dashboard/engines

LABEL org.opencontainers.image.source="https://github.com/code-dot-org/code-dot-org"
