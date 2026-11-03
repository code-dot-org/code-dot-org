# cdo-dev is the development image. It layers on cdo-deps rather than
# cdo-base. That way the dev and test gems install as a delta over a warm
# tree, not a full reinstall.

ARG DEPS_IMAGE=ghcr.io/code-dot-org/cdo-deps:latest

# uv from Astral's official docker setup.
# See: https://docs.astral.sh/uv/guides/integration/docker/
FROM ghcr.io/astral-sh/uv:0.5.18@sha256:e2101b9e627153b8fe4e8a1249cc4194f1b38ece7f28a5a9b8f958e3b560e69c AS uv

FROM ${DEPS_IMAGE}

ARG \
  USERNAME=cdo \
  UID=1000 \
  GID=1000 \
  YARN_VERSION=4.12.0 \
  PLAYWRIGHT_VERSION=1.59.1 \
  BUNDLE_JOBS=

USER root

# No heredoc, no SHELL: dual-engine floor, see docker/base/README.md.
#
# Toolchain packages duplicate cdo-build's: this image sits above the gem
# layer to inherit the warm tree, so it cannot inherit the toolchain from
# below it.
#
# Beyond the toolchain, only what a developer cannot work without:
#   git-lfs      the repo uses LFS
#   redis-tools  redis-cli against the sidecar; no docker socket in here
#   sudo         installing packages in your own sandbox
#   procps       the slim base ships no ps or kill
# Anything else is one `sudo apt-get install` away, and a missing tool
# fails loudly by name.
RUN set -eux \
  && apt-get -qq update \
  && DEBIAN_FRONTEND=noninteractive apt-get -qq -y install --no-install-recommends \
       build-essential \
       default-libmysqlclient-dev \
       git \
       git-lfs \
       libmagickwand-dev \
       pkg-config \
       procps \
       python3 \
       redis-tools \
       sudo \
       > /dev/null \
  && rm -rf /var/lib/apt/lists/*

# uv, for the Python Lab workspace under python/.
COPY --from=uv /uv /uvx /usr/local/bin/

COPY docker/scripts/install-node.sh /tmp/install-node.sh

# corepack prepares yarn so the first yarn call in a fresh container does
# not reach the network. COREPACK_HOME sits outside $HOME so root can
# prepare it and everyone can read it.
ENV COREPACK_HOME=/opt/corepack
RUN set -eux \
  && /tmp/install-node.sh \
  && rm /tmp/install-node.sh \
  && mkdir -p "${COREPACK_HOME}" \
  && corepack prepare "yarn@${YARN_VERSION}" --activate \
  && chmod -R a+rX "${COREPACK_HOME}"

# A developer in their own sandbox needs to be able to install a package.
RUN set -eux \
  && echo "${USERNAME} ALL=(ALL) NOPASSWD:ALL" > "/etc/sudoers.d/${USERNAME}" \
  && chmod 0440 "/etc/sudoers.d/${USERNAME}"

# A shared path, not ~/.cache, so the install runs as root in this section.
# The chown lets a developer update the browsers later. HOME is /root
# because cdo-base exports HOME=/home/cdo even for root, and npx must not
# write a root-owned cache into the developer's home.
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN set -eux \
  && export HOME=/root \
  && npx --yes "playwright@${PLAYWRIGHT_VERSION}" install-deps chromium \
  && npx --yes "playwright@${PLAYWRIGHT_VERSION}" install chromium \
  && chown -R "${UID}:${GID}" "${PLAYWRIGHT_BROWSERS_PATH}" \
  && chrome="$(find "${PLAYWRIGHT_BROWSERS_PATH}" -type f -path '*/chrome-linux*/chrome' | head -1)" \
  && test -n "$chrome" \
  && ln -sf "$chrome" /usr/local/bin/chromium \
  && rm -rf /root/.npm /var/lib/apt/lists/*

# Karma reads this. The chromium path holds a build number, so the RUN above
# resolves it to a fixed symlink instead of this pinning the version.
ENV CHROME_BIN=/usr/local/bin/chromium

# This uses /opt/venv, not /code-dot-org/.venv. The repo volume shadows
# /code-dot-org at runtime, so anything this image contributes must live
# outside it.
RUN set -eux \
  && mkdir -p /opt/venv \
  && chown "${UID}:${GID}" /opt/venv

USER ${USERNAME}

# The dev and test gems, a delta over the inherited tree. Clearing
# BUNDLE_WITHOUT and BUNDLE_DEPLOYMENT lifts frozen mode so `bundle add`
# works; to Bundler an empty value means unset. cdo-deps already ships the
# Gemfile, lockfile, and gemspecs, so nothing is COPYed. The cache mount
# path is hardcoded for the same buildah reason as docker/deps/Dockerfile.
ENV \
  BUNDLE_DEPLOYMENT= \
  BUNDLE_WITHOUT=
RUN --mount=type=cache,id=cdo-dev-bundle-cache,sharing=locked,uid=1000,gid=1000,target=/usr/local/bundle/ruby/3.2.0/cache \
  set -eux \
  && test "$(ruby -e 'print RbConfig::CONFIG["ruby_version"]')" = 3.2.0 \
  && bundle install --jobs "${BUNDLE_JOBS:-$(nproc)}" \
  && bundle check \
  && rm -rf ~/.bundle "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git

# The Python Lab virtual env
COPY --chown=1000:1000 .python-version pyproject.toml uv.lock ./
COPY --chown=1000:1000 python/ python/
ENV UV_PROJECT_ENVIRONMENT=/opt/venv
RUN set -eux \
  && uv sync --frozen --quiet \
  && uv run python -c 'import pythonlab_setup'

# The checkout is mounted from the host but read as cdo; git refuses the
# tree without this. ~/.yarn is created so a caller can mount a yarn cache
# volume there without root owning it.
RUN set -eux \
  && git config --global --add safe.directory /code-dot-org \
  && mkdir -p /home/${USERNAME}/.yarn

# Metadata lookups from a laptop time out slowly.
ENV AWS_EC2_METADATA_DISABLED=true

WORKDIR /code-dot-org
CMD ["bash"]

LABEL org.opencontainers.image.source="https://github.com/code-dot-org/code-dot-org"
