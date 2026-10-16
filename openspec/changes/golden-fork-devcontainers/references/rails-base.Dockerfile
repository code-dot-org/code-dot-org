# syntax=docker/dockerfile:1
#
# cdo-spike-c: prototype ephemeral devcontainer for code-dot-org/dashboard.
# Single image, single container: mysqld + redis-server + Rails.
# Source tree is NOT baked in -- bind-mount the worktree at /code-dot-org at
# runtime. This Dockerfile only bakes gems, python deps, MySQL/Redis servers,
# and a pre-seeded MySQL datadir.

FROM ruby:3.2.11-slim-bookworm AS base

# NOTE: plain `ruby:3.2.11-slim` now resolves to Debian 13 (trixie), not
# bookworm -- the tag rolled forward upstream. Pin `-slim-bookworm` explicitly
# to get bookworm, matching the design constraint.

ARG UID=1000
ARG GID=1000
ARG USERNAME=cdo

ENV LANG=C.UTF-8 \
    AWS_EC2_METADATA_DISABLED=true \
    BUNDLE_PATH=/opt/bundle \
    BUNDLE_WITHOUT=staging:test:production:levelbuilder \
    UV_PROJECT_ENVIRONMENT=/opt/venv

SHELL ["/bin/bash", "-euxo", "pipefail", "-c"]

# --- apt packages ------------------------------------------------------
#
# Empirically minimized against SETUP.md's Ubuntu list. Dropped vs. that
# list (proven unnecessary for a backend-only, node-less prototype):
#   mysql-server/mysql-client (installed from repo.mysql.com instead, see
#     below, for exact server/client ABI match), openjdk-11-jre-headless,
#     libcairo2-dev, libjpeg8-dev, libpango1.0-dev, libgif-dev, pdftk,
#     enscript, rbenv (ruby comes from the base image), chromium-browser,
#     parallel, python3-pip (uv replaces pip).
#
# Kept / added, each proven in by a specific `bundle install` failure:
#   - libmagickwand-dev: `gem install rmagick` extconf.rb fails with
#     "Package MagickCore was not found in the pkg-config search path"
#     without it. Plain `imagemagick` (CLI) is NOT required to compile the
#     gem, but is kept for MiniMagick/`convert` shellouts at runtime.
#   - libmysqlclient-dev: `gem install mysql2` extconf.rb aborts
#     (`find_library`/`NoMethodError` on a nil mysql_config path) without a
#     mysqlclient dev package. Installed from repo.mysql.com (not Debian's
#     default-libmysqlclient-dev) so headers match the MySQL 8.0.46 server
#     byte-for-byte.
#   - pkg-config: required for the RMagick pkg-config lookup above.
#   - build-essential, libssl-dev, zlib1g-dev: baseline native-extension
#     toolchain; every gem with a C extension links against these.
#   - git, git-lfs: required per SETUP.md (git-lfs pull, bundler git
#     sources); not exercised by `bundle install` alone in this spike.
# NOT needed (contrary to the SETUP.md Ubuntu list) for `bundle install`
# to succeed on this Gemfile.lock: libxslt1-dev, libssl-dev is needed but
# libxml2-dev/libxslt1-dev are not -- nokogiri did not fail, apparently
# satisfied by its own vendored libxml2 fallback build.
#
# wget/gnupg/dirmngr/lsb-release are needed only to bootstrap the
# repo.mysql.com apt source and are purged again afterwards.
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked <<EOF
  mkdir -p /root/.gnupg && chmod 700 /root/.gnupg
  apt-get update -qq
  # nodejs (bare Debian runtime, no npm/corepack/yarn): proven in at RUNTIME,
  # not bundle-install time -- `rails server` boot dies with
  # ExecJS::RuntimeUnavailable (uglifier -> execjs autodetect) without any JS
  # runtime. This is the minimal deviation from the "no Node" prototype
  # constraint: the apps/ frontend toolchain is still absent, but Rails boot
  # itself needs *a* JS engine.
  apt-get install -y -qq --no-install-recommends \
    build-essential ca-certificates curl git git-lfs pkg-config \
    libssl-dev zlib1g-dev libmagickwand-dev imagemagick \
    redis-server nodejs \
    wget gnupg dirmngr lsb-release

  # --- MySQL 8.0 server, official repo.mysql.com apt repo (try #1) ---
  #
  # PITFALL: the mysql-apt-config_0.8.33-1_all.deb package ships a
  # signing-key snapshot in /usr/share/keyrings/mysql-apt-config.gpg whose
  # cached self-signature had expired (`EXPKEYSIG` on `apt-get update`),
  # even though the actual key (B7B3B788A8D3785C) is valid until 2027.
  # Fix: re-fetch the same key ID from a keyserver into that specific
  # keyring file, which pulls a fresher self-signature. This worked, so
  # fallback #2 (COPY --from=mysql:8.0-debian binaries) was not needed.
  wget -q https://dev.mysql.com/get/mysql-apt-config_0.8.33-1_all.deb -O /tmp/mysql-apt-config.deb
  echo "mysql-apt-config mysql-apt-config/select-server select mysql-8.0" | debconf-set-selections
  DEBIAN_FRONTEND=noninteractive dpkg -i /tmp/mysql-apt-config.deb
  gpg --no-default-keyring --keyring /usr/share/keyrings/mysql-apt-config.gpg \
    --keyserver keyserver.ubuntu.com --recv-keys B7B3B788A8D3785C
  apt-get update -qq

  # Preseed mysql-community-server's debconf prompts so the postinst
  # doesn't wait on a TTY that a `docker build` doesn't have.
  debconf-set-selections <<SEEDS
mysql-community-server mysql-community-server/data-dir note
mysql-community-server mysql-community-server/root-pass password
mysql-community-server mysql-community-server/re-root-pass password
mysql-community-server mysql-community-server/remove-test-db boolean false
SEEDS
  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq --no-install-recommends \
    mysql-server libmysqlclient-dev

  # These were only needed to bootstrap the apt repo above.
  apt-get purge -y -qq wget gnupg dirmngr lsb-release
  apt-get autoremove -y -qq
  rm -rf /var/lib/apt/lists/* /tmp/mysql-apt-config.deb
EOF

RUN groupadd -g ${GID} ${USERNAME} \
  && useradd --create-home --no-log-init -u ${UID} -g ${GID} -s /bin/bash ${USERNAME} \
  && gem install bundler -v 2.5.17 --silent \
  && mkdir -p /code-dot-org /opt/bundle /opt/venv /opt/mysql-data \
  && chown ${UID}:${GID} /code-dot-org /opt/bundle /opt/venv /opt/mysql-data

USER ${USERNAME}
WORKDIR /code-dot-org

# --- gems ----------------------------------------------------------------
COPY --chown=${UID}:${GID} .ruby-version Gemfile Gemfile.lock ./
COPY --chown=${UID}:${GID} dashboard/engines/cdo_contentful/cdo_contentful.gemspec dashboard/engines/cdo_contentful/cdo_contentful.gemspec
COPY --chown=${UID}:${GID} dashboard/engines/cdo_contentful/lib/cdo_contentful/version.rb dashboard/engines/cdo_contentful/lib/cdo_contentful/version.rb
COPY --chown=${UID}:${GID} dashboard/engines/hoc_legacy/hoc_legacy.gemspec dashboard/engines/hoc_legacy/hoc_legacy.gemspec
COPY --chown=${UID}:${GID} dashboard/engines/observability/observability.gemspec dashboard/engines/observability/observability.gemspec
COPY --chown=${UID}:${GID} dashboard/engines/observability/lib/observability/version.rb dashboard/engines/observability/lib/observability/version.rb

RUN bundle install --jobs 16

# --- python (uv) -----------------------------------------------------------
# PITFALL: uv's installer puts the binary at $HOME/.local/bin, which for the
# non-root USER is /home/cdo/.local/bin, not /root/.local/bin -- an earlier
# attempt hardcoded the root path here and got "uv: command not found".
ENV PATH=/home/${USERNAME}/.local/bin:$PATH
COPY --chown=${UID}:${GID} pyproject.toml uv.lock .python-version ./
COPY --chown=${UID}:${GID} python/pycdo/pyproject.toml python/pycdo/pyproject.toml
COPY --chown=${UID}:${GID} python/pythonlab/neighborhood/pyproject.toml python/pythonlab/neighborhood/pyproject.toml
COPY --chown=${UID}:${GID} python/pythonlab/pythonlab_setup/pyproject.toml python/pythonlab/pythonlab_setup/pyproject.toml
COPY --chown=${UID}:${GID} python/pythonlab/unittest_runner/pyproject.toml python/pythonlab/unittest_runner/pyproject.toml

RUN curl -LsSf https://astral.sh/uv/install.sh | sh \
  && uv sync --frozen --no-install-workspace --quiet

# --- seeded MySQL datadir --------------------------------------------------
# Baked at a NON-VOLUME path. The base ruby image declares no VOLUMEs, and
# neither do we -- /opt/mysql-data is a plain image layer, so overlayfs COW
# makes every fresh container instant + isolated (validated in a prior
# spike against a synthetic 2.2GB dataset: VOLUME-declared paths pay a
# 2-16s anonymous-volume populate-copy on every `docker run`; a plain path
# costs ~0s). See scratchpad RESULTS.md from the cdo-spike-a experiment.
# PITFALL: the first successful build used `COPY mysql-data.tar` +
# `RUN tar xf ... && rm ...`, which bakes BOTH the 2.02GB tar layer and the
# 2.01GB extracted layer (rm in a later RUN can't shrink an earlier layer)
# -- measured 7.36GB total image. `ADD` auto-extracts local tar archives
# and `--chown` applies ownership during extraction, producing a single
# ~2GB layer. A separate `RUN chown -R` would likewise have re-written
# every file into yet another 2GB layer (overlayfs COW), so doing the
# chown inside ADD is load-bearing twice.
ADD --chown=${UID}:${GID} mysql-data.tar /opt/mysql-data

COPY --chown=${UID}:${GID} --chmod=755 entrypoint.sh /usr/local/bin/entrypoint.sh

# PITFALL: spring's client requires the `mutex_m` DEFAULT gem (0.1.2 on ruby
# 3.2) before Bundler.setup runs, and this repo's Gemfile pins mutex_m 0.2.0;
# every spring-routed command (`rails runner`, etc.) dies with
# "You have already activated mutex_m 0.1.2, but your Gemfile requires
# mutex_m 0.2.0" (Gem::LoadError). Disabling spring sidesteps it; an
# ephemeral container gains little from spring's preload daemon anyway.
ENV DISABLE_SPRING=1

WORKDIR /code-dot-org
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["bash"]
