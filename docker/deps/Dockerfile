# cdo-deps: the dependency layer — the production gem set and the python
# virtualenv, both built in cdo-build and copied onto cdo-base so no
# toolchain ships. Keyed on the lockfiles. See README.md.
#
# Context is the repo root, not this directory:
#   docker build -f docker/deps/Dockerfile --build-arg BUILD_IMAGE=... .

# BUILD_IMAGE has no default: cdo-build is unpublished, so a caller must build
# and name it. Keep these in separate instructions: Skaffold must expand both
# while scanning the FROM dependencies for its development file watcher.
ARG BUILD_IMAGE
ARG BASE_IMAGE=ghcr.io/code-dot-org/cdo-base:latest

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
RUN --mount=type=cache,id=cdo-deps-bundle-cache,sharing=locked,uid=1000,gid=1000,target=/usr/local/bundle/ruby/3.2.0/cache \
  set -eux \
  && test "$(ruby -e 'print RbConfig::CONFIG["ruby_version"]')" = 3.2.0 \
  && test "$(cat .ruby-version)" = "$(ruby -e 'print RUBY_VERSION')" \
  && bundle install --jobs "${BUNDLE_JOBS:-$(nproc)}" \
  && bundle check \
  && rm -rf ~/.bundle "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git \
       "${GEM_HOME:-/usr/local/bundle}"/cache

################################################################################
FROM ${BUILD_IMAGE} AS venv
################################################################################

# Rails boot requires cdo/pycall, which resolves its interpreter through uv.
# The flags match PythonVenv.install under rack_env :production; the import
# proves the venv resolves the way the runtime will use it.
COPY --chown=1000:1000 .python-version pyproject.toml uv.lock ./
COPY --chown=1000:1000 python/ python/

RUN set -eux \
  && uv sync --frozen --no-dev \
  && uv run --no-sync python -c 'import pycdo'

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
# already has ${BUNDLE_PATH}/bin on it. UV_NO_SYNC because boot runs
# `uv run`, which would otherwise re-sync dev groups at runtime.
ENV \
  BUNDLE_DEPLOYMENT=1 \
  BUNDLE_PATH=${BUNDLE_PATH} \
  BUNDLE_WITHOUT=${BUNDLE_WITHOUT} \
  UV_NO_SYNC=1

COPY --from=builder --chown=1000:1000 ${BUNDLE_PATH} ${BUNDLE_PATH}

# Bundler cannot resolve the bundle without the lockfile and these gemspecs.
COPY --chown=1000:1000 .ruby-version Gemfile Gemfile.lock ./
COPY --from=builder --chown=1000:1000 ${SRC}/dashboard/engines ./dashboard/engines

# The venv, its interpreter (uv's managed-python store under $HOME), uv
# itself, and the project files `uv run` resolves the venv through. python/
# ships because the workspace members are installed editable — the venv
# points into it.
COPY --from=venv /usr/local/bin/uv /usr/local/bin/uv
COPY --from=venv --chown=1000:1000 /home/cdo/.local/share/uv /home/cdo/.local/share/uv
COPY --from=venv --chown=1000:1000 ${SRC}/.venv ./.venv
COPY --from=venv --chown=1000:1000 ${SRC}/python ./python
COPY --chown=1000:1000 .python-version pyproject.toml uv.lock ./

# Self-verify both halves, whatever built them.
RUN bundle check \
  && uv run --no-sync python -c 'import pycdo'

LABEL org.opencontainers.image.source="https://github.com/code-dot-org/code-dot-org"
