# cdo-dev: the development image. One image, all of it — build toolchain,
# Node, Playwright, debuggers, the dev and test gems. Disk is cheap on a
# laptop and "works in the devcontainer" should mean one thing.
#
# It stacks on cdo-gems rather than cdo-base so the dev/test gems install as a
# delta over a warm tree: a lockfile bump costs the delta, not a cold install
# of the whole bundle.
#
# Build context is the repo root, pruned by Dockerfile.dockerignore. Build
# from the root, not from this directory:
#   docker build -f docker/dev/Dockerfile -t cdo-dev:test .
ARG GEMS_IMAGE=ghcr.io/code-dot-org/cdo-gems:latest

FROM ${GEMS_IMAGE}

ARG \
  USERNAME=cdo \
  UID=1000 \
  GID=1000 \
  NODE_MAJOR=20 \
  UV_VERSION=0.5.18 \
  YARN_VERSION=4.12.0 \
  PLAYWRIGHT_VERSION=1.59.1 \
  BUNDLE_JOBS=

USER root

# No heredoc, no SHELL: podman 4.9 (Ubuntu 24.04 LTS, GHA runners) cannot
# parse RUN <<EOF, and the OCI image format ignores SHELL entirely, so -e
# semantics must come from an explicit `set -eux`. See docker/base/README.md.
#
# The toolchain duplicates cdo-build's, which the hierarchy accepts: cdo-build
# sits below the gem layer because it produces it, and this image sits above
# to inherit the warm gem tree, so neither can be the other.
#
# Beyond the toolchain, only what a developer cannot work without:
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

# Node is the ExecJS fallback and runs the frontend toolchain. Debian's is too
# old for apps/, so it comes from nodesource. corepack pins yarn from each
# package.json "packageManager" field; preparing the version here means the
# first yarn call in a fresh container does not reach the network.
ENV COREPACK_HOME=/opt/corepack
RUN set -eux \
  && curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash - > /dev/null \
  && DEBIAN_FRONTEND=noninteractive apt-get -qq -y install --no-install-recommends nodejs > /dev/null \
  && mkdir -p "${COREPACK_HOME}" \
  && corepack enable \
  && corepack prepare "yarn@${YARN_VERSION}" --activate \
  && chmod -R a+rX "${COREPACK_HOME}" \
  && rm -rf /var/lib/apt/lists/*

RUN set -eux \
  && curl -LsSf "https://astral.sh/uv/${UV_VERSION}/install.sh" \
     | XDG_BIN_HOME=/usr/local/bin UV_NO_MODIFY_PATH=1 sh > /dev/null

# A developer in their own sandbox needs to be able to install a package.
RUN set -eux \
  && echo "${USERNAME} ALL=(ALL) NOPASSWD:ALL" > "/etc/sudoers.d/${USERNAME}" \
  && chmod 0440 "/etc/sudoers.d/${USERNAME}"

# Writable by the build user: the python venv.
RUN set -eux \
  && mkdir -p /opt/venv \
  && chown "${UID}:${GID}" /opt/venv

USER ${USERNAME}

# The dev/test gem delta. cdo-gems ships the production groups with
# BUNDLE_WITHOUT=development:test and BUNDLE_DEPLOYMENT=1; clearing both adds
# the 39 development and test gems on top and lets a developer run
# `bundle add` without fighting frozen mode.
#
# The Gemfile, lockfile and engine gemspecs are already in the image from
# cdo-gems, so this needs no COPY.
ENV \
  BUNDLE_DEPLOYMENT= \
  BUNDLE_WITHOUT=
RUN --mount=type=cache,id=cdo-dev-bundle-cache,sharing=locked,uid=1000,gid=1000,target=/usr/local/bundle/ruby/3.2.0/cache \
  set -eux \
  && bundle install --jobs "${BUNDLE_JOBS:-$(nproc)}" \
  && bundle check \
  && rm -rf ~/.bundle "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git

# Python, for the pythonlab toolchain under python/.
ENV UV_PROJECT_ENVIRONMENT=/opt/venv
COPY --chown=${UID}:${GID} pyproject.toml uv.lock .python-version ./
COPY --chown=${UID}:${GID} python/ python/
RUN set -eux \
  && uv sync --frozen --no-install-workspace --quiet

# No yarn cache warm. The prior devcontainer image pre-installed every
# workspace's node_modules to make the first `yarn install` local, which needs
# each workspace package.json in the build context. That cannot be expressed
# portably: frontend/ is 13 GB on disk against 24 MB tracked, so the context
# has to be filtered, and every filter shape that reaches nested files
# diverges between docker and podman — silently, both builds succeeding with
# different file lists. Listing 18 COPY lines instead is portable but rots;
# the list it replaced had already lost frontend/packages/core/src/api.
#
# The cost of dropping it is one network `yarn install` per repo volume, not
# per container start, since the volume persists. If that proves painful the
# fix is a prep step that assembles a small context, not a smarter ignore file.

# Playwright chromium, used by both the Playwright e2e suite and the Karma
# integration tests. OS deps need root; the browser itself installs under the
# build user's cache so it is readable at runtime without a chown pass.
#
# HOME is overridden for the root half. cdo-base exports HOME=/home/cdo
# unconditionally, so anything run as root still resolves HOME to the cdo
# user's home — npx would create a root-owned /home/cdo/.npm and the install
# below, running as cdo, then fails EACCES on its own cache.
USER root
RUN set -eux \
  && HOME=/root npx --yes "playwright@${PLAYWRIGHT_VERSION}" install-deps chromium
USER ${USERNAME}
RUN set -eux \
  && npx --yes "playwright@${PLAYWRIGHT_VERSION}" install chromium

# CHROME_BIN is what Karma looks for; the path under ms-playwright embeds a
# build number, so resolve it once here rather than pinning it.
USER root
RUN set -eux \
  && chrome="$(find "/home/${USERNAME}/.cache/ms-playwright" -type f -path '*/chrome-linux*/chrome' | head -1)" \
  && test -n "$chrome" \
  && ln -sf "$chrome" /usr/local/bin/chromium
ENV CHROME_BIN=/usr/local/bin/chromium

COPY --chown=root:root --chmod=755 docker/dev/entrypoint.sh /usr/local/bin/entrypoint.sh

USER ${USERNAME}

# The repo arrives as a volume cloned by root while the container runs as cdo,
# so git needs to be told the ownership mismatch is expected.
RUN set -eux \
  && git config --global --add safe.directory /code-dot-org

# Metadata lookups from a laptop just time out slowly.
ENV AWS_EC2_METADATA_DISABLED=true

WORKDIR /code-dot-org
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["bash"]

LABEL org.opencontainers.image.source="https://github.com/code-dot-org/code-dot-org"
