# cdo-build: cdo-base plus the compile toolchain.
#
# This image compiles things; it never ships them. It sits below the gem
# layer because it produces it — an image cannot be built FROM an image
# containing its own output — so it carries no gems and no source.
#
# Pinning: default is the :latest tag so the weekly cdo-base security
# rebuild is inherited. Consumers that need byte-stable builds override
# BASE_IMAGE with a digest ref.
ARG BASE_IMAGE=ghcr.io/code-dot-org/cdo-base:latest

FROM ${BASE_IMAGE}

ARG \
  USERNAME=cdo \
  UID=1000 \
  GID=1000 \
  SRC=/code-dot-org \
  BUNDLE_PATH=/usr/local/bundle \
  BUNDLE_WITHOUT=development:test \
  NODE_MAJOR=20 \
  UV_VERSION=0.5.18

USER root

# No heredoc, no SHELL: podman 4.9 (Ubuntu 24.04 LTS, GHA runners) cannot
# parse RUN <<EOF, and the OCI image format ignores SHELL entirely, so -e
# semantics must come from an explicit `set -eux` to hold on both engines.
# See docker/build/README.md.
#
# Package notes, since most of these exist for one caller:
#   default-libmysqlclient-dev  mysql2 native extension
#   libmagickwand-dev           rmagick links libMagickWand at build
#   git                         Gemfile has git-sourced gems
#   python3                     node-gyp, for native node modules
#   pkg-config                  extconf.rb probes for the above
#
# docker-thin's build stage also carries unzip, dropped here: its only
# caller is the awscli install in that file's dev stage, and neither bundler,
# yarn, nor uv shells out to it.
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

# Node comes from nodesource rather than Debian, which ships a Node too old
# for apps/. yarn is not installed directly: corepack shims it and resolves
# the version from each package.json "packageManager" field.
RUN set -eux \
  && curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash - > /dev/null \
  && DEBIAN_FRONTEND=noninteractive apt-get -qq -y install --no-install-recommends nodejs > /dev/null \
  && corepack enable \
  && rm -rf /var/lib/apt/lists/*

RUN set -eux \
  && curl -LsSf "https://astral.sh/uv/${UV_VERSION}/install.sh" \
     | XDG_BIN_HOME=/usr/local/bin UV_NO_MODIFY_PATH=1 sh > /dev/null

# The bundler and identity environment cdo-base deliberately omits, so that
# base stays gem-agnostic and usable by non-Rails consumers. Downstream
# flavors that carry gems declare BUNDLE_PATH and PATH again for themselves;
# the gems are copied out of this image, not the environment.
ENV \
  BUNDLE_DEPLOYMENT=1 \
  BUNDLE_PATH=${BUNDLE_PATH} \
  BUNDLE_WITHOUT=${BUNDLE_WITHOUT} \
  GID=${GID} \
  PATH=${BUNDLE_PATH}/bin:${PATH} \
  SRC=${SRC} \
  UID=${UID} \
  USERNAME=${USERNAME}

# Ruby's gem tree must track .ruby-version: ruby/<major.minor.0>. Creating
# it here as the build user is what lets a consumer mount a BuildKit gem
# cache at ${BUNDLE_PATH}/ruby/3.2.0/cache without root owning the parents.
# The bundler/gems leaf holds git-sourced gems.
RUN set -eux \
  && mkdir -p "${BUNDLE_PATH}/ruby/3.2.0/bundler/gems" \
  && chown -R "${UID}:${GID}" "${BUNDLE_PATH}"

USER ${USERNAME}
WORKDIR ${SRC}

LABEL org.opencontainers.image.source="https://github.com/code-dot-org/code-dot-org"
