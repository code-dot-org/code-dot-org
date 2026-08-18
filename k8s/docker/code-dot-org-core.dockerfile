# syntax=docker/dockerfile:1

################################################################################
FROM ruby:3.2.11-slim-bookworm@sha256:84140472007d27c7ec641dbc606a47ff9c0aa5f358445947b7350392fa5115e5 AS base
################################################################################

ARG \
  USERNAME=code-dot-org \
  UID=1000 \
  GID=1000 \
  SRC="/code-dot-org"

ENV \
  BUNDLE_PATH=/usr/local/bundle \
  GID=${GID} \
  LANG=C.UTF-8 \
  PATH=/usr/local/bundle/bin:${PATH} \
  SRC=${SRC} \
  UID=${UID} \
  USERNAME=${USERNAME}

# -e is important because we are using the `RUN <<EOF` approach to multi-line shell
# commands rather than manually stringing with && statements. If we don't set -e
# then RUN lines will not exit if one of their commands fails.
SHELL [ "/bin/sh", "-euxc" ]

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

  ln -s /usr/lib/$(uname -m)-linux-gnu/libjemalloc.so.2 /usr/local/lib/libjemalloc.so.2

  if [ "${USERNAME}" = "root" ]; then
    # Change root homedir from /root to /home/root. The consistency makes
    # Dockerfile paths easier and matches the k8s local-dev volume shape.
    sed -i 's#/root#/home/root#g' /etc/passwd
    mv /root /home/
  else
    groupadd -g ${GID} ${USERNAME}
    useradd --system --create-home --no-log-init -s /bin/sh -u ${UID} -g ${GID} ${USERNAME}
  fi

  mkdir -p ${SRC} ${BUNDLE_PATH}
  chown ${UID}:${GID} ${SRC} ${BUNDLE_PATH}

  rm -rf /var/lib/apt/lists/*
EOF

ENV HOME=/home/${USERNAME}
ENV LD_PRELOAD=/usr/local/lib/libjemalloc.so.2

USER ${USERNAME}
WORKDIR ${SRC}

LABEL org.opencontainers.image.source="https://github.com/code-dot-org/code-dot-org"

################################################################################
FROM base AS dev
################################################################################

USER root
WORKDIR /tmp

RUN <<EOF
  apt-get -qq update
  export DEBIAN_FRONTEND=noninteractive
  apt-get -qq -y install --no-install-recommends \
    build-essential \
    chromium \
    gdb \
    git \
    git-lfs \
    default-libmysqlclient-dev \
    libmagickwand-dev \
    lsof \
    parallel \
    pkg-config \
    python3-pip \
    rsync \
    sudo \
    time \
    unzip \
    wget \
    zsh \
    > /dev/null

  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null
  apt-get install -qq -y nodejs > /dev/null
  corepack enable

  if [ $(uname -m) = "aarch64" ]; then
    curl -s "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip"
  else
    curl -s "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
  fi
  unzip -qq awscliv2.zip
  ./aws/install
  rm -rf aws awscliv2.zip

  curl -LsSf https://astral.sh/uv/0.5.18/install.sh | XDG_BIN_HOME=/usr/local/bin UV_NO_MODIFY_PATH=1 sh

  if [ "${USERNAME}" != "root" ]; then
    echo "${USERNAME} ALL=NOPASSWD: ALL" >> /etc/sudoers
    chsh -s /bin/zsh ${USERNAME}
  fi

  rm -rf /var/lib/apt/lists/*
EOF

USER ${USERNAME}
WORKDIR ${SRC}

RUN <<EOF
  set +x
  sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" --unattended > /dev/null
  set -x

  echo '# Chromium Binary\nexport CHROME_BIN=/usr/bin/chromium' | tee -a ${HOME}/.bashrc ${HOME}/.zshrc
  git lfs install
  ln -s ${SRC} ${HOME}/code-dot-org
EOF

ENV BUNDLE_DEPLOYMENT=

################################################################################
FROM base AS code-dot-org-core
################################################################################
