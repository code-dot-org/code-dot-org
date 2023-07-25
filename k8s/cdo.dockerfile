################################################################################
FROM --platform=linux/amd64 ubuntu:22.04 as cdo-base
################################################################################

ENV \
  USERNAME=code.org \
  AWS_PROFILE=cdo \
  NODE_VERSION=18.16.0 \
  YARN_VERSION=1.22.19 \
  SRC="/code-dot-org"

RUN \
  # Ideally install all apt packages here
  apt-get -qq update && \
  DEBIAN_FRONTEND=noninteractive \
  apt-get -qq -y install --no-install-recommends \
    autoconf \
    bison \
    build-essential \
    chromium-browser \
    curl \
    gdb \
    git \
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
    mariadb-client \
    node-pre-gyp \
    nodejs \
    npm \
    parallel \
    rbenv \
    rsync \
    sudo \
    wget \
    unzip \
    zlib1g-dev \
    zsh \
    # surpress noisy dpkg install/setup lines (errors & warnings still show)
    > /dev/null && \
  # 
  # Setup 'code.org' user and group
  echo "${USERNAME} ALL=NOPASSWD: ALL" >> /etc/sudoers && \
  groupadd -g 1000 ${USERNAME} && \
  useradd --system --create-home --no-log-init -s /bin/zsh -u 1000 -g 1000 ${USERNAME} && \
  chown -R ${USERNAME} /usr/local && \
  #
  # Create ${SRC} directory
  mkdir -p ${SRC} && \
  chown ${USERNAME} ${SRC} && \
  true

USER ${USERNAME}
ENV HOME=/home/${USERNAME}
WORKDIR ${SRC}

################################################################################
FROM cdo-base as cdo-rbenv
################################################################################

COPY --chown=${USERNAME} \
  .ruby-version \
  ./

RUN \
  mkdir -p "$(rbenv root)"/plugins && \
  git clone https://github.com/rbenv/ruby-build.git "$(rbenv root)"/plugins/ruby-build && \
  rbenv install && \
  true

COPY --chown=${USERNAME} \
  Gemfile \
  Gemfile.lock \
  ./

RUN \
  eval "$(rbenv init -)" && \
  gem install bundler -v 2.3.22 && \
  rbenv rehash && \
  true

# TODO: move to the top with other apt-get install commands
################################################################################
FROM cdo-base as cdo-user-utils
################################################################################

ARG RAILS_ENV=development
ENV RAILS_ENV=${RAILS_ENV}

WORKDIR ${HOME}

RUN \
  #
  # Install Node
  npm install -g n && \
  n ${NODE_VERSION} && \
  hash -r && \
  #
  # Install yarn
  npm install -g yarn@${YARN_VERSION} && \
  #
  # Install oh-my-zsh
  sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" && \
  #
  # Install AWSCLI
  if [ $(uname -m) = "aarch64" ]; then \
    curl -s "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip"; \
  else \
    curl -s "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"; \
  fi && \
  unzip -qq awscliv2.zip && \
  ./aws/install && \
  rm awscliv2.zip && \
  #
  # Add CHROME_BIN env var to bashrc
  echo '# Chromium Binary\nexport CHROME_BIN=/usr/bin/chromium-browser' | tee -a ${HOME}/.bashrc ${HOME}/.zshrc && \
  #
  # Setup rbenv & ruby-build
  echo 'eval "$(rbenv init -)"' | tee -a ${HOME}/.bashrc ${HOME}/.zshrc && \
  true

WORKDIR ${SRC}

################################################################################
FROM cdo-user-utils as cdo-node_modules
################################################################################

COPY --chown=${USERNAME} \
  ./apps/package.json \
  ./apps/yarn.lock \
  ./apps/

COPY --chown=${USERNAME} \
  ./apps/eslint \
  ./apps/eslint/

RUN \
  cd apps && \
  # Install apps/node_modules using yarn
  yarn && \
  true

################################################################################
FROM cdo-node_modules
################################################################################

# Copy in .rbenv from the cdo-rbenv stage (runs in parallel with cdo-node_modules)
COPY --from=cdo-rbenv ${HOME}/.rbenv ${HOME}/.rbenv

COPY --chown=${USERNAME} \
  ./ \
  ./

SHELL [ "zsh", "-l", "-c" ]

CMD tail -f /dev/null