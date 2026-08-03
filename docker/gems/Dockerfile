# cdo-gems: the production gem set, compiled in cdo-build and copied onto
# cdo-base so no toolchain ships. Keyed on Gemfile.lock. See README.md.
#
# Context is the repo root, not this directory:
#   docker build -f docker/gems/Dockerfile --build-arg BUILD_IMAGE=... .

# BUILD_IMAGE has no default: cdo-build is unpublished, so a caller must build
# and name it. Both are declared here so they can be used in a FROM.
ARG \
  BUILD_IMAGE \
  BASE_IMAGE=ghcr.io/code-dot-org/cdo-base:latest

################################################################################
FROM ${BUILD_IMAGE} AS builder
################################################################################

# Empty means one job per core. Set a number to throttle peak memory.
ARG BUNDLE_JOBS=

COPY --chown=1000:1000 .ruby-version Gemfile Gemfile.lock ./

# The Gemfile globs these gemspecs as path gems, and each needs its own
# version.rb. Listed per file rather than copying the tree: engine source
# changes ~9x more often and would invalidate the bundle install below. A new
# engine needs new lines here; forgetting fails loudly under frozen mode.
COPY --chown=1000:1000 dashboard/engines/cdo_contentful/cdo_contentful.gemspec dashboard/engines/cdo_contentful/
COPY --chown=1000:1000 dashboard/engines/cdo_contentful/lib/cdo_contentful/version.rb dashboard/engines/cdo_contentful/lib/cdo_contentful/
COPY --chown=1000:1000 dashboard/engines/hoc_legacy/hoc_legacy.gemspec dashboard/engines/hoc_legacy/
COPY --chown=1000:1000 dashboard/engines/observability/observability.gemspec dashboard/engines/observability/
COPY --chown=1000:1000 dashboard/engines/observability/lib/observability/version.rb dashboard/engines/observability/lib/observability/

# The .gem cache is a cache mount, so tarballs stay out of the image. Its
# target cannot use a variable (buildah 1.33), hence the ABI guard below.
# Bundler installs itself from the lockfile, so it is not installed here.
#
# The second guard catches a .ruby-version bump that has not reached cdo-base.
# The Gemfile's `ruby '>= 3.0', '< 3.5'` is a range, so bundler would not object,
# and .ruby-version is an input to the published bundle- key: without this, the
# bump publishes a new key over a bundle the old interpreter compiled.
RUN --mount=type=cache,id=cdo-gems-bundle-cache,sharing=locked,uid=1000,gid=1000,target=/usr/local/bundle/ruby/3.2.0/cache \
  set -eux \
  && test "$(ruby -e 'print RbConfig::CONFIG["ruby_version"]')" = 3.2.0 \
  && test "$(cat .ruby-version)" = "$(ruby -e 'print RUBY_VERSION')" \
  && bundle install --jobs "${BUNDLE_JOBS:-$(nproc)}" \
  && bundle check \
  && rm -rf ~/.bundle "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git \
       "${GEM_HOME:-/usr/local/bundle}"/cache

################################################################################
FROM ${BASE_IMAGE}
################################################################################

# SRC is restated because cdo-base sets WORKDIR without exporting it.
ARG \
  BUNDLE_PATH=/usr/local/bundle \
  BUNDLE_WITHOUT=development:test \
  SRC=/code-dot-org

# BUNDLE_WITHOUT is needed at runtime too, or Bundler.setup tries to activate
# groups that were never installed. PATH is left alone: the ruby base image
# already has ${BUNDLE_PATH}/bin on it.
ENV \
  BUNDLE_DEPLOYMENT=1 \
  BUNDLE_PATH=${BUNDLE_PATH} \
  BUNDLE_WITHOUT=${BUNDLE_WITHOUT}

COPY --from=builder --chown=1000:1000 ${BUNDLE_PATH} ${BUNDLE_PATH}

# Bundler cannot resolve the bundle without the lockfile and these gemspecs.
COPY --chown=1000:1000 .ruby-version Gemfile Gemfile.lock ./
COPY --from=builder --chown=1000:1000 ${SRC}/dashboard/engines ./dashboard/engines

# Self-verify, whatever built it.
RUN bundle check

LABEL org.opencontainers.image.source="https://github.com/code-dot-org/code-dot-org"
