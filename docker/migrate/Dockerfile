# cdo-migrate: cdo-gems plus the Rails source and the curriculum.
#
# The one image that bakes dashboard/config's curriculum (levels, scripts,
# scripts_json — 1.4 GB). It exists to seed a database that matches the code
# it carries: the RFC's k8s deploy Job (db:setup_or_migrate + seed:default),
# and the devcontainer database bake (.devcontainer/scripts/bake-db.sh) runs
# the same image locally. It is a Job image, never a service, so autoscaling
# nodes never pull it.
#
# The RFC splits this into a `dashboard` image (source, no curriculum) with
# migrate layered on top. Until the dashboard image exists there is nothing
# to share a source layer with, so this Dockerfile copies both in one place;
# when dashboard lands, this becomes FROM dashboard plus the curriculum COPY.
#
# No configuration is baked. Rails reads locals.yml from the repo root;
# provide one at run time (a mount locally, a ConfigMap in k8s).
#
# Build context is the repo root, pruned by Dockerfile.dockerignore to what
# Rails needs at boot plus the curriculum. Build from the root:
#   docker build -f docker/migrate/Dockerfile -t cdo-migrate:test .
ARG GEMS_IMAGE=ghcr.io/code-dot-org/cdo-gems:latest

FROM ${GEMS_IMAGE}

ARG \
  UID=1000 \
  GID=1000 \
  UV_VERSION=0.5.18

# No Node in this image, and Rails reaches ExecJS at boot through
# autoprefixer-rails. Nothing here compiles assets, so disable the runtime
# rather than carry one — the same move docker-thin's runtime targets make.
ENV EXECJS_RUNTIME=Disabled

# The Python stack is not optional: application.rb requires cdo/pycall
# unconditionally, which shells out to uv and loads libpython, so a Rails
# boot needs the venv even though nothing here runs Python on purpose.
# uv fetches its own managed CPython (.python-version pins 3.12; Debian
# bookworm ships 3.11), so no apt Python is installed. Same recipe as
# docker/dev, minus the workspace installs.
USER root
RUN set -eux \
  && curl -LsSf "https://astral.sh/uv/${UV_VERSION}/install.sh" \
     | XDG_BIN_HOME=/usr/local/bin UV_NO_MODIFY_PATH=1 sh > /dev/null \
  && mkdir -p /opt/venv \
  && chown "${UID}:${GID}" /opt/venv
USER cdo

ENV UV_PROJECT_ENVIRONMENT=/opt/venv
COPY --chown=${UID}:${GID} pyproject.toml uv.lock .python-version ./
COPY --chown=${UID}:${GID} python/ python/
RUN set -eux \
  && uv sync --frozen --no-install-workspace --quiet

# What a booting Rails app reads, established by feat/docker-thin's stage
# list: the repo-root bootstrap files, the shared cdo config and libraries,
# and the dashboard tree itself. locals.yml is deliberately absent.
COPY --chown=1000:1000 .ruby-version Gemfile Gemfile.lock deployment.rb config.yml.erb ./
COPY --chown=1000:1000 config/ config/
COPY --chown=1000:1000 lib/ lib/
COPY --chown=1000:1000 shared/ shared/
COPY --chown=1000:1000 dashboard/ dashboard/

COPY --chown=root:root --chmod=755 docker/migrate/migrate.sh /usr/local/bin/cdo-migrate

CMD ["cdo-migrate"]

LABEL org.opencontainers.image.source="https://github.com/code-dot-org/code-dot-org"
