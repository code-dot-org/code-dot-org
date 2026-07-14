# Fully qualified for podman compat; tag tracks .ruby-version.
FROM docker.io/library/ruby:3.2.11-slim-bookworm

ARG \
  USERNAME=cdo \
  UID=1000 \
  GID=1000 \
  SRC=/code-dot-org

ENV LANG=C.UTF-8

# -euxc so a failing command inside a RUN <<EOF heredoc aborts the layer
# rather than silently continuing to the next line.
SHELL ["/bin/sh", "-euxc"]

RUN <<EOF
  apt-get -qq update
  export DEBIAN_FRONTEND=noninteractive
  apt-get -qq -y install --no-install-recommends \
    ca-certificates \
    curl \
    default-mysql-client \
    imagemagick \
    libjemalloc2 \
    locales \
    tzdata \
    > /dev/null

  # Preload jemalloc via a stable path. The package installs an
  # arch-qualified name under /usr/lib/<arch>-linux-gnu; symlink it to a
  # fixed location so LD_PRELOAD is arch-independent.
  ln -s /usr/lib/$(uname -m)-linux-gnu/libjemalloc.so.2 /usr/local/lib/libjemalloc.so.2

  groupadd -g ${GID} ${USERNAME}
  useradd --system --create-home --no-log-init -s /bin/sh -u ${UID} -g ${GID} ${USERNAME}

  mkdir -p ${SRC}
  chown ${UID}:${GID} ${SRC}

  rm -rf /var/lib/apt/lists/*
EOF

ENV HOME=/home/${USERNAME}
ENV LD_PRELOAD=/usr/local/lib/libjemalloc.so.2

USER ${USERNAME}
WORKDIR ${SRC}

LABEL org.opencontainers.image.source="https://github.com/code-dot-org/code-dot-org"
