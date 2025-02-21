# syntax=docker/dockerfile:1

################################################################################
FROM ubuntu:22.04 AS code-dot-org-base
################################################################################

# skaffold sync only works when the user is root 😤:
# https://github.com/GoogleContainerTools/skaffold/issues/2479
# If we find a solution, we can swith to this:
#
# ARG \
#   USERNAME=code-dot-org \
#   UID=1000 \
#   GID=1000

ARG \
  USERNAME=root \
  UID=0 \
  GID=0 \
  SRC="/code-dot-org"

ENV \
  AWS_PROFILE=cdo \
  SRC=${SRC}

# -e is important because we are using the `RUN <<EOF` approach to multi-line shell
# commands rather than manually stringing with && statements. If we don't set -e
# then RUN lines will not exit if one of their commands fails.
SHELL [ "/bin/sh", "-euxc" ]

RUN <<EOF
  # Ideally install all apt packages here

  apt-get -qq update
  export DEBIAN_FRONTEND=noninteractive
  apt-get -qq -y install --no-install-recommends \
    autoconf \
    bison \
    build-essential \
    chromium-browser \
    curl \
    gdb \
    git \
    git-lfs \
    imagemagick \
    libffi-dev \
    libgdbm6 \
    libgdbm-dev \
    libmagickwand-dev \
    libmysqlclient-dev \
    libncurses5-dev \
    libreadline6-dev \
    libsqlite3-dev \
    libssl-dev \
    libyaml-dev \
    lsof \
    mysql-client \
    parallel \
    python3-pip \
    rbenv \
    rsync \
    sudo \
    time \
    wget \
    unzip \
    tzdata \
    zlib1g-dev \
    zsh \
    > /dev/null

  if [ "$USERNAME" = "root" ]; then
    # Change root homedir from /root to /home/root, the consistency makes
    # Dockerfile easier and makes k8s volume binding easier
    sed -i 's#/root#/home/root#g' /etc/passwd
    mv /root /home/
  else
    echo "${USERNAME} ALL=NOPASSWD: ALL" >> /etc/sudoers
    groupadd -g ${UID} ${USERNAME}
    useradd --system --create-home --no-log-init -s /bin/zsh -u ${UID} -g ${UID} ${USERNAME}
  fi

  # Create ${SRC} directory
  mkdir -p ${SRC}
  chown ${UID}:${GID} ${SRC}
EOF

ENV HOME=/home/${USERNAME}

################################################################################
FROM code-dot-org-base AS code-dot-org-rbenv
################################################################################

USER ${USERNAME}
WORKDIR ${SRC}

COPY --chown=${UID} \
  .ruby-version \
  ./

RUN <<EOF
  # Compile and install ruby using rbenv
  PATH=${HOME}/.rbenv/shims:${PATH}
  mkdir -p "$(rbenv root)"/plugins
  git clone --quiet https://github.com/rbenv/ruby-build.git "$(rbenv root)"/plugins/ruby-build
  rbenv install > /dev/null
  gem install bundler -v 2.3.22 --silent
  rbenv rehash
EOF

################################################################################
FROM code-dot-org-base AS code-dot-org-user-utils
################################################################################

WORKDIR /tmp

RUN <<EOF
  # Install apps not in apt (node, aws, etc)

  # install node, based on instructions at https://github.com/nodesource/distributions#using-ubuntu-1
  curl -sL https://deb.nodesource.com/setup_20.x | bash - > /dev/null
  apt-get install -qq -y nodejs > /dev/null
  corepack enable # corepack required for yarn support

  # Install AWSCLI
  if [ $(uname -m) = "aarch64" ]; then
    curl -s "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip";
  else
    curl -s "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip";
  fi
  unzip -qq awscliv2.zip
  ./aws/install
  rm awscliv2.zip

  # install uv for managing our python dependencies
  curl -LsSf https://astral.sh/uv/0.5.18/install.sh | XDG_BIN_HOME=/usr/local/bin UV_NO_MODIFY_PATH=1 sh

  # Install Sauce Connect Proxy
  mkdir sauce_connect
  cd sauce_connect
  if [ $(uname -m) = "aarch64" ]; then
    curl -s "https://saucelabs.com/downloads/sauce-connect/5.2.1/sauce-connect-5.2.1_linux.aarch64.tar.gz" -o "sauce-connect.tar.gz";
  else
    curl -s "https://saucelabs.com/downloads/sauce-connect/5.2.1/sauce-connect-5.2.1_linux.x86_64.tar.gz" -o "sauce-connect.tar.gz";
  fi
  tar -xzf sauce-connect.tar.gz
  cp sc /usr/local/bin
  cd ..
  rm -rf sauce_connect
EOF

################################################################################
FROM code-dot-org-user-utils AS code-dot-org-core
################################################################################

USER ${USERNAME}
WORKDIR ${SRC}

RUN <<EOF
  # Set things up as ${USERNAME}

  # Install oh-my-zsh
  set +x && \
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" --unattended \
    > /dev/null && set -x

  # Add CHROME_BIN env var to bashrc
  echo '# Chromium Binary\nexport CHROME_BIN=/usr/bin/chromium-browser' | tee -a ${HOME}/.bashrc ${HOME}/.zshrc

  # Setup rbenv & ruby-build
  echo 'eval "$(rbenv init -)"' | tee -a ${HOME}/.bashrc ${HOME}/.zshrc

  # Enable Git LFS in ~/.gitconfig
  git lfs install
EOF

ENV \
  USERNAME=${USERNAME} \
  UID=${UID} \
  GID=${GID}

# Copy in ~/.rbenv (built in parallel)
COPY --chown=${UID} --link \
  --from=code-dot-org-rbenv ${HOME}/.rbenv \
  ${HOME}/.rbenv

# `kubectl exec` skips entrypoint (!), so this is the easiest way to
# accomplish `eval $(rbenv init -)` that works for kubectl exec.
ENV PATH=${HOME}/.rbenv/shims:${PATH}

LABEL org.opencontainers.image.source="https://github.com/code-dot-org/code-dot-org"
