# cdo-build: cdo-base plus the compile toolchain. Not published; it produces
# the gem layer and is discarded. See README.md.
#
# Context is the repo root; the dockerignore admits only the shared node
# install script:
#   docker build -f docker/build/Dockerfile -t cdo-build:local .

# Declared before the first FROM so it can be used in one.
ARG BASE_IMAGE=ghcr.io/code-dot-org/cdo-base:latest

# uv from Astral's published image, the method their Docker guide documents.
# Written out rather than built from an ARG so dependabot can read it, and
# pinned by digest as well as tag so the reference cannot move under us.
FROM ghcr.io/astral-sh/uv:0.5.18@sha256:e2101b9e627153b8fe4e8a1249cc4194f1b38ece7f28a5a9b8f958e3b560e69c AS uv

FROM ${BASE_IMAGE}

ARG \
  USERNAME=cdo \
  UID=1000 \
  GID=1000 \
  SRC=/code-dot-org \
  BUNDLE_PATH=/usr/local/bundle \
  BUNDLE_WITHOUT=development:test

USER root

# System build dependencies. mysql2 and rmagick link against the -dev packages,
# node-gyp shells out to python3, and the Gemfile has git-sourced gems.
RUN set -eux \
  && apt-get -qq update \
  && DEBIAN_FRONTEND=noninteractive apt-get -qq -y install --no-install-recommends \
       build-essential \
       default-libmysqlclient-dev \
       git \
       libmagickwand-dev \
       pkg-config \
       python3 \
       > /dev/null \
  && rm -rf /var/lib/apt/lists/*

# No yarn version is pinned: corepack reads it from each project's
# package.json "packageManager" field at use time, and the smoke test
# asserts whatever apps/ pins.
COPY docker/scripts/install-node.sh /tmp/install-node.sh
RUN /tmp/install-node.sh && rm /tmp/install-node.sh

COPY --from=uv /uv /uvx /usr/local/bin/

# The bundler and identity environment cdo-base omits to stay gem-agnostic.
ENV \
  BUNDLE_DEPLOYMENT=1 \
  BUNDLE_PATH=${BUNDLE_PATH} \
  BUNDLE_WITHOUT=${BUNDLE_WITHOUT} \
  GID=${GID} \
  PATH=${BUNDLE_PATH}/bin:${PATH} \
  SRC=${SRC} \
  UID=${UID} \
  USERNAME=${USERNAME}

# Writable up front so a consumer can mount a gem cache under it without root
# owning the parents. The ABI directory comes from ruby, not .ruby-version.
RUN set -eux \
  && mkdir -p "${BUNDLE_PATH}/ruby/$(ruby -e 'print RbConfig::CONFIG["ruby_version"]')/bundler/gems" \
  && chown -R "${UID}:${GID}" "${BUNDLE_PATH}"

USER ${USERNAME}
WORKDIR ${SRC}

LABEL org.opencontainers.image.source="https://github.com/code-dot-org/code-dot-org"
