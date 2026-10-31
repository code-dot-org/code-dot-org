# cdo-dev is the development image. It layers on cdo-deps rather than
# cdo-base. That way the dev and test gems install as a delta over a warm
# tree, not a full reinstall.
#
# The build reads no repo source. Lockfiles, gemspecs, and python project
# files arrive already baked into cdo-deps; the source itself arrives at
# runtime as a mounted volume. Context is the repo root, and the
# dockerignore admits only the shared node install script:
#
#   docker build -f docker/dev/Dockerfile -t cdo-dev:local .

ARG DEPS_IMAGE=ghcr.io/code-dot-org/cdo-deps:latest

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

# The venv delta, into /opt/venv, outside the repo mount's shadow.
# Workspace members stay editable against /code-dot-org/python, the live
# mounted tree. UV_NO_SYNC must be 0, not empty: uv rejects an empty
# boolean. The bare `uv run`, with no --no-sync, proves the value parses.
ENV \
  UV_NO_SYNC=0 \
  UV_PROJECT_ENVIRONMENT=/opt/venv
RUN set -eux \
  && uv sync --frozen --quiet \
  && uv run python -c 'import pycdo'

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
