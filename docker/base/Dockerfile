# Fully qualified for podman compat; tag tracks .ruby-version.
FROM docker.io/library/ruby:4.0.6-slim-bookworm

ARG \
  USERNAME=cdo \
  UID=1000 \
  GID=1000 \
  SRC=/code-dot-org

ENV LANG=C.UTF-8

# No heredoc, no SHELL: podman 4.9 (Ubuntu 24.04 LTS, GHA runners) cannot
# parse RUN <<EOF, and OCI image format ignores SHELL entirely — so -e
# semantics must come from an explicit `set -eux` to hold on both engines.
#
# jemalloc: the package installs an arch-qualified name under
# /usr/lib/<arch>-linux-gnu; symlink to a fixed path so LD_PRELOAD is
# arch-independent.
RUN set -eux \
  && apt-get -qq update \
  && DEBIAN_FRONTEND=noninteractive apt-get -qq -y install --no-install-recommends \
       ca-certificates \
       curl \
       default-mysql-client \
       imagemagick \
       libjemalloc2 \
       locales \
       tzdata \
       > /dev/null \
  && ln -s "/usr/lib/$(uname -m)-linux-gnu/libjemalloc.so.2" /usr/local/lib/libjemalloc.so.2 \
  && groupadd -g "${GID}" "${USERNAME}" \
  && useradd --system --create-home --no-log-init -s /bin/sh -u "${UID}" -g "${GID}" "${USERNAME}" \
  && mkdir -p "${SRC}" \
  && chown "${UID}:${GID}" "${SRC}" \
  && rm -rf /var/lib/apt/lists/*

ENV HOME=/home/${USERNAME}
ENV LD_PRELOAD=/usr/local/lib/libjemalloc.so.2

USER ${USERNAME}
WORKDIR ${SRC}

LABEL org.opencontainers.image.source="https://github.com/code-dot-org/code-dot-org"
