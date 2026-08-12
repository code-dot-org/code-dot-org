# cdo-dev is the development image. It layers on cdo-deps rather than
# cdo-base. That way the dev and test gems install as a delta over a warm
# tree, not a full reinstall.
#
# The build context is this directory only. Lockfiles, gemspecs, and python
# project files arrive already baked into cdo-deps. The source itself
# arrives at runtime as a mounted volume.
#
#   docker build -t cdo-dev:local docker/dev/

ARG DEPS_IMAGE=ghcr.io/code-dot-org/cdo-deps:latest

FROM ${DEPS_IMAGE}

ARG \
  USERNAME=cdo \
  UID=1000 \
  GID=1000 \
  NODE_VERSION=20.20.2 \
  NODE_KEYS_REF=b28073028e6d6855cfb53bf7fa0137599c01f967 \
  YARN_VERSION=4.12.0 \
  PLAYWRIGHT_VERSION=1.59.1 \
  BUNDLE_JOBS=

USER root

# This Dockerfile avoids heredoc and SHELL. podman 4.9 and buildah 1.33
# cannot parse `RUN <<EOF`. OCI also drops SHELL, so `set -eux` replaces
# `-e`. See docker/base/README.md.
#
# Toolchain packages duplicate cdo-build's. This image sits above the gem
# layer, not below it, to inherit the warm tree.
#
# Beyond the toolchain, this installs only what a developer cannot work
# without:
#   git-lfs      the repo uses LFS
#   redis-tools  redis-cli against the sidecar
#   sudo         installing things in your own sandbox
#   procps/lsof  finding what is holding port 3000
#   gdb          the "debuggers" the dev image promises
#   rsync/unzip  rake tasks and asset bootstrap shell out to them
RUN set -eux \
  && apt-get -qq update \
  && DEBIAN_FRONTEND=noninteractive apt-get -qq -y install --no-install-recommends \
       build-essential \
       default-libmysqlclient-dev \
       gdb \
       git \
       git-lfs \
       libmagickwand-dev \
       lsof \
       pkg-config \
       procps \
       python3 \
       redis-tools \
       rsync \
       sudo \
       unzip \
       > /dev/null \
  && rm -rf /var/lib/apt/lists/*

# This installs Node from the official nodejs.org tarball, GPG-verified,
# rather than a third-party apt repo. docker/build/Dockerfile uses the same
# recipe. Bump NODE_VERSION in both files.
#
# corepack prepares yarn here so the first yarn call in a fresh container
# does not reach the network. COREPACK_HOME sits outside $HOME so root can
# prepare it and everyone can read it.
ENV COREPACK_HOME=/opt/corepack
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
  && mkdir -p "${COREPACK_HOME}" \
  && corepack enable \
  && corepack prepare "yarn@${YARN_VERSION}" --activate \
  && chmod -R a+rX "${COREPACK_HOME}"

# A developer in their own sandbox needs to be able to install a package.
RUN set -eux \
  && echo "${USERNAME} ALL=(ALL) NOPASSWD:ALL" > "/etc/sudoers.d/${USERNAME}" \
  && chmod 0440 "/etc/sudoers.d/${USERNAME}"

# This uses /opt/venv, not /code-dot-org/.venv. The repo volume shadows
# /code-dot-org at runtime, so anything this image contributes must live
# outside it.
RUN set -eux \
  && mkdir -p /opt/venv \
  && chown "${UID}:${GID}" /opt/venv

USER ${USERNAME}

# This adds the dev and test gems as a delta over the inherited tree.
# Clearing BUNDLE_WITHOUT and BUNDLE_DEPLOYMENT lifts frozen mode, so
# `bundle add` works. To Bundler, an empty value means unset.
#
# No COPY is needed. cdo-deps already ships the Gemfile, lockfile, and
# gemspecs. The cache mount path is hardcoded for the same buildah reason as
# docker/deps/Dockerfile.
ENV \
  BUNDLE_DEPLOYMENT= \
  BUNDLE_WITHOUT=
RUN --mount=type=cache,id=cdo-dev-bundle-cache,sharing=locked,uid=1000,gid=1000,target=/usr/local/bundle/ruby/3.2.0/cache \
  set -eux \
  && test "$(ruby -e 'print RbConfig::CONFIG["ruby_version"]')" = 3.2.0 \
  && bundle install --jobs "${BUNDLE_JOBS:-$(nproc)}" \
  && bundle check \
  && rm -rf ~/.bundle "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git

# This installs the same delta shape into /opt/venv, outside the repo
# mount's shadow. Workspace members stay editable against
# /code-dot-org/python, the live mounted tree.
#
# UV_NO_SYNC=0 must be 0, not empty. uv rejects an empty value as "not a
# boolean". The bare `uv run` below, with no --no-sync, proves the value
# parses.
ENV \
  UV_NO_SYNC=0 \
  UV_PROJECT_ENVIRONMENT=/opt/venv
RUN set -eux \
  && uv sync --frozen --quiet \
  && uv run python -c 'import pycdo'

# OS deps need root. The browser installs under the build user's cache
# instead, so it stays readable without a chown pass.
#
# HOME is forced to /root for the OS-deps install. cdo-base exports
# HOME=/home/cdo even for root. Without this override, npx would create a
# root-owned ~cdo/.npm and EACCES the cdo install that runs right after.
USER root
RUN set -eux \
  && HOME=/root npx --yes "playwright@${PLAYWRIGHT_VERSION}" install-deps chromium \
  && rm -rf /var/lib/apt/lists/*
USER ${USERNAME}
RUN set -eux \
  && npx --yes "playwright@${PLAYWRIGHT_VERSION}" install chromium

# CHROME_BIN is what Karma looks for. The path under ms-playwright embeds a
# build number, so resolve it once here instead of pinning it.
USER root
RUN set -eux \
  && chrome="$(find "/home/${USERNAME}/.cache/ms-playwright" -type f -path '*/chrome-linux*/chrome' | head -1)" \
  && test -n "$chrome" \
  && ln -sf "$chrome" /usr/local/bin/chromium
ENV CHROME_BIN=/usr/local/bin/chromium

USER ${USERNAME}

# git needs telling. The repo volume is cloned by root. The container runs
# as cdo.
#
# ~/.yarn exists ahead of the mount so the named volume arrives owned by
# cdo instead of root.
RUN set -eux \
  && git config --global --add safe.directory /code-dot-org \
  && mkdir -p /home/${USERNAME}/.yarn

# Metadata lookups from a laptop time out slowly.
ENV AWS_EC2_METADATA_DISABLED=true

WORKDIR /code-dot-org
CMD ["bash"]

LABEL org.opencontainers.image.source="https://github.com/code-dot-org/code-dot-org"
