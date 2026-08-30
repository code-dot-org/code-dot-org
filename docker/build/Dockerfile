# cdo-build: cdo-base plus the compile toolchain. Not published; it produces
# the gem layer and is discarded. See README.md.

# Declared before the first FROM so it can be used in one.
ARG BASE_IMAGE=ghcr.io/code-dot-org/cdo-base:latest

# uv from Astral's published image, the method their Docker guide documents.
# Written out rather than built from an ARG so dependabot can read it, and
# pinned by digest as well as tag so the reference cannot move under us.
FROM ghcr.io/astral-sh/uv:0.12.7@sha256:95f2aa1fe59274951cfe9b0cbc7972e879ff1004bc8945d130a32eb0dbd85945 AS uv

FROM ${BASE_IMAGE}

ARG \
  USERNAME=cdo \
  UID=1000 \
  GID=1000 \
  SRC=/code-dot-org \
  BUNDLE_PATH=/usr/local/bundle \
  BUNDLE_WITHOUT=development:test \
  NODE_VERSION=20.20.2 \
  NODE_KEYS_REF=b28073028e6d6855cfb53bf7fa0137599c01f967

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

# Node from the official nodejs.org release rather than a third-party repo, with
# GPG verification, for supply-chain protection. A bump edits NODE_VERSION.
# gpgv warns "not a detached signature" on a clearsigned file; the
# Good-signature line and the exit status are the check. See README.md.
#
# No yarn version is pinned here: corepack reads it from each project's
# package.json "packageManager" field at use time, and the smoke test asserts
# whatever apps/ pins.
RUN set -eux \
  && case "$(dpkg --print-architecture)" in \
       amd64) node_arch=x64 ;; \
       arm64) node_arch=arm64 ;; \
       *) echo "unsupported architecture" >&2; exit 1 ;; \
     esac \
  && tarball="node-v${NODE_VERSION}-linux-${node_arch}.tar.gz" \
  && cd /tmp \
  && curl -fsSLO "https://nodejs.org/dist/v${NODE_VERSION}/${tarball}" \
  && curl -fsSLO "https://nodejs.org/dist/v${NODE_VERSION}/SHASUMS256.txt.asc" \
  && curl -fsSLo nodejs-keyring.kbx "https://github.com/nodejs/release-keys/raw/${NODE_KEYS_REF}/gpg/pubring.kbx" \
  && gpgv --keyring ./nodejs-keyring.kbx --output SHASUMS256.txt SHASUMS256.txt.asc \
  && grep " ${tarball}\$" SHASUMS256.txt | sha256sum -c - \
  && tar -xzf "${tarball}" -C /usr/local --strip-components=1 --no-same-owner \
  && rm -f "${tarball}" SHASUMS256.txt SHASUMS256.txt.asc nodejs-keyring.kbx \
  && corepack enable \
  && node --version \
  && npm --version

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
