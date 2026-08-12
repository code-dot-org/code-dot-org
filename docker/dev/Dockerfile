# cdo-dev: the development image. One image, all of it — build toolchain,
# Node, Playwright, debuggers, the development and test gems. Disk is cheap
# on a laptop and "works in the devcontainer" should mean one thing.
#
# It stacks on cdo-deps rather than cdo-base so the dev/test gems install as
# a delta over a warm tree: a lockfile bump costs the delta, not a cold
# install of the whole bundle. The lockfiles, engine gemspecs, python project
# files and uv itself all arrive from cdo-deps, so this build reads nothing
# from the repo: the context is this directory, and the source arrives at
# runtime as a volume.
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

# No heredoc, no SHELL: the dual-engine floor (podman 4.9 / buildah 1.33)
# cannot parse RUN <<EOF, and the OCI image format drops SHELL, so -e
# semantics come from an explicit `set -eux`. See docker/base/README.md.
#
# The toolchain duplicates cdo-build's, which the hierarchy accepts:
# cdo-build sits below the gem layer because it produces it, and this image
# sits above it to inherit the warm gem tree, so neither can be the other.
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

# Node runs the frontend toolchain (apps/ webpack, frontend/ workspaces) and
# is the ExecJS runtime. Same recipe as docker/build/Dockerfile: the official
# nodejs.org tarball, GPG-verified, rather than a third-party apt repo. A
# bump edits NODE_VERSION here and there together.
#
# corepack reads each project's yarn from its package.json "packageManager"
# field at use time; preparing that version here means the first yarn call in
# a fresh container does not reach the network. COREPACK_HOME lives outside
# the repo mount and outside $HOME, prepared by root, readable by everyone.
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

# The dev venv target. cdo-deps bakes its venv at /code-dot-org/.venv, but
# the repo volume shadows /code-dot-org entirely at runtime, so anything
# this image contributes has to live outside it — which is also why the gems
# (/usr/local/bundle), corepack (/opt/corepack), and browsers (~/.cache)
# already do.
RUN set -eux \
  && mkdir -p /opt/venv \
  && chown "${UID}:${GID}" /opt/venv

USER ${USERNAME}

# The dev/test gem delta. cdo-deps ships the production groups with
# BUNDLE_WITHOUT=development:test and BUNDLE_DEPLOYMENT=1; clearing both
# (empty means unset, to Bundler) adds the development and test gems on top
# and lets a developer run `bundle add` without fighting frozen mode.
#
# The Gemfile, lockfile and engine gemspecs are already in the image from
# cdo-deps, so this needs no COPY. The cache mount target is the hardcoded
# ABI path for the same buildah reason as docker/deps/Dockerfile, with the
# same guard.
ENV \
  BUNDLE_DEPLOYMENT= \
  BUNDLE_WITHOUT=
RUN --mount=type=cache,id=cdo-dev-bundle-cache,sharing=locked,uid=1000,gid=1000,target=/usr/local/bundle/ruby/3.2.0/cache \
  set -eux \
  && test "$(ruby -e 'print RbConfig::CONFIG["ruby_version"]')" = 3.2.0 \
  && bundle install --jobs "${BUNDLE_JOBS:-$(nproc)}" \
  && bundle check \
  && rm -rf ~/.bundle "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git

# The python delta, same shape: sync the baked project files again, this time
# with the dev group and into /opt/venv, where the repo mount cannot shadow
# it. The workspace members stay editable — they point at /code-dot-org/python,
# which at runtime is the mounted checkout's live tree, exactly what a dev
# venv should track. UV_NO_SYNC=0 turns off the no-sync deps sets to keep an
# immutable image immutable, so a plain `uv run` keeps the venv current with
# the mounted lockfile. It has to be 0, not empty: bundler reads an empty
# variable as unset, uv rejects it as "not a boolean". The import below runs
# without --no-sync to prove the value parses.
ENV \
  UV_NO_SYNC=0 \
  UV_PROJECT_ENVIRONMENT=/opt/venv
RUN set -eux \
  && uv sync --frozen --quiet \
  && uv run python -c 'import pycdo'

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
  && HOME=/root npx --yes "playwright@${PLAYWRIGHT_VERSION}" install-deps chromium \
  && rm -rf /var/lib/apt/lists/*
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

COPY --chown=root:root --chmod=755 entrypoint.sh /usr/local/bin/entrypoint.sh

USER ${USERNAME}

# The repo arrives as a volume cloned by root while the container runs as
# cdo, so git needs to be told the ownership mismatch is expected.
RUN set -eux \
  && git config --global --add safe.directory /code-dot-org

# Metadata lookups from a laptop just time out slowly.
ENV AWS_EC2_METADATA_DISABLED=true

WORKDIR /code-dot-org
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["bash"]

LABEL org.opencontainers.image.source="https://github.com/code-dot-org/code-dot-org"
