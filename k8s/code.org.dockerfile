# syntax=docker/dockerfile:1

# Pull in the static assets and db seed layers
# built from separate dockerfiles by skaffold
ARG CODE_ORG_STATIC
ARG CODE_ORG_DB_SEED

FROM $CODE_ORG_STATIC as code.org-static
FROM $CODE_ORG_DB_SEED as code.org-db-seed

################################################################################
FROM ubuntu:22.04 as code.org-base
################################################################################


ARG \
  USERNAME=code.org \
  UID=1000 \
  GID=1000 \
  NODE_VERSION=18.16.0 \
  YARN_VERSION=1.22.19 \
  SRC="/code-dot-org"

ENV \
  AWS_PROFILE=cdo \
  SRC=${SRC}

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
    time \
    wget \
    unzip \
    tzdata \
    zlib1g-dev \
    zsh \
    # surpress noisy dpkg install/setup lines (errors & warnings still show)
    > /dev/null && \
  # 
  # Setup 'code.org' user and group
  echo "${USERNAME} ALL=NOPASSWD: ALL" >> /etc/sudoers && \
  groupadd -g ${UID} ${USERNAME} && \
  useradd --system --create-home --no-log-init -s /bin/zsh -u ${UID} -g ${UID} ${USERNAME} && \
  # FIXME: why did I do this?
  chown -R ${USERNAME} /usr/local && \
  #
  # Create ${SRC} directory
  mkdir -p ${SRC} && \
  chown ${UID}:${GID} ${SRC} && \
  true

USER ${USERNAME}
ENV HOME=/home/${USERNAME}
WORKDIR ${SRC}

################################################################################
FROM code.org-base as code.org-rbenv
################################################################################

COPY --chown=${UID} \
  .ruby-version \
  ./

RUN \
  mkdir -p "$(rbenv root)"/plugins && \
  git clone https://github.com/rbenv/ruby-build.git "$(rbenv root)"/plugins/ruby-build && \
  rbenv install && \
  true

COPY --chown=${UID} \
  Gemfile \
  Gemfile.lock \
  ./

RUN \
  eval "$(rbenv init -)" && \
  gem install bundler -v 2.3.22 && \
  rbenv rehash && \
  #
  # SETUP SOME HACK WORKAROUNDS FOR APPLE SILICON
  #
  # Running this lets us build on arm64 until staging is updated to use newer mini_racer gem
  bundle config --local without staging test production levelbuilder && \
  # Linux+arm64 has a problem with 0.0.7.2 that MacOS+arm64 doesn't, hack an update in here for now
  sed -i "s/gem 'unf_ext', '0.0.7.2'/gem 'unf_ext', '0.0.8.2'/g" Gemfile  && \
  #
  # DONE HACK WORKAROUNDS FOR APPLE SILICON
  true

RUN \
#   --mount=type=cache,sharing=locked,uid=1000,gid=1000,target=${SRC}/vendor/cache \
  eval "$(rbenv init -)" && \
  bundle install --quiet && \
  true

################################################################################
FROM code.org-base as code.org-user-utils
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


# # Install gcloud (line copied from https://cloud.google.com/sdk/docs/install#deb, search for "Docker Tip")
# USER root
# RUN apt-get install -y gnupg
# RUN echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] http://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list && curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key --keyring /usr/share/keyrings/cloud.google.gpg  add - && apt-get update -y && apt-get install google-cloud-cli -y
# USER ${USERNAME}

WORKDIR ${SRC}

################################################################################
FROM code.org-user-utils as code.org-node_modules
################################################################################

COPY --chown=${UID} \
  ./apps/package.json \
  ./apps/yarn.lock \
  ./apps/

COPY --chown=${UID} \
  ./apps/eslint \
  ./apps/eslint/

RUN \
  #
  # Instuct Docker to maintain a build cache for yarn package downloads
  # so we don't have to re-download npms whenever package.json changes
  --mount=type=cache,sharing=locked,uid=1000,gid=1000,target=${HOME}/.cache/yarn \
  #
  # Install apps/node_modules using yarn
  cd apps && \
  yarn install --frozen-lockfile --ignore-scripts && \
  ls -lA | grep node && \
  true

################################################################################
FROM code.org-user-utils
################################################################################

RUN \
  #
  # We don't copy in .git (huge), but `bundle exec rake install` references .git in 
  # a couple places, like git hooks, and fails without it, create a blank .git for now
  git init -b staging --quiet && \
  true

# NOTE: `COPY --link` has been disabled in Docker 24 due to a bug in moby
# as of today, it does nothing unless `Use containerd for pulling and storing images` is enabled
# for explanation see: https://github.com/docker/buildx/issues/1099#issuecomment-1524940116
# upstream issue: https://github.com/moby/moby/issues/45111
#
# Unfortunately "use containerd" appears to non-performant, it is ridiculously slow
# at handling the "exporting image" step at the end of a build, possibly/probably due
# to a file-by-file diffing step (instead of relying on nanosecond filesystem timestamps)
#
# Here is an issue with somebody having a similar problem with the containerd differ:
# https://github.com/moby/buildkit/issues/1704
#
# This was reported to be fixed by:
# https://github.com/moby/buildkit/pull/2181
# But some of that funcationality may have been reverted a few months later:
# https://github.com/moby/buildkit/pull/2480
#
# Meanwhile, upstream containerd appears to have this issue with no fix in sight:
# https://github.com/containerd/continuity/pull/145
#
# Question: what if any set of builders should enable --link
# in a way that's performant on Docker 24?

# Link in large static assets built in a separate dockerfile
COPY --chown=${UID} --link \
  --from=code.org-static / \
  ./

# Link in levels and other db seed data built in a separate dockerfile
COPY --chown=${UID} --link \
  --from=code.org-db-seed  / \
  ./

# Copy in apps/node_modules (built in parallel)
COPY --chown=${UID} --link \
  --from=code.org-node_modules ${SRC}/apps/node_modules \
  ./apps/node_modules

# Copy in ~/.rbenv (built in parallel)
COPY --chown=${UID} --link \
  --from=code.org-rbenv ${HOME}/.rbenv \
  ${HOME}/.rbenv

# Copy in the rest of the source code
COPY --chown=${UID} --link ./ ./

# SETUP SOME HACK WORKAROUNDS FOR APPLE SILICON
# These are only required for installing Apple Silicon hack workarounds from code.org-rbenv
#
COPY --chown=${UID} --from=code.org-rbenv ${SRC}/.bundle ${SRC}/.bundle
COPY --chown=${UID} --from=code.org-rbenv ${SRC}/.bundle ${SRC}/dashboard/.bundle
COPY --chown=${UID} --from=code.org-rbenv ${SRC}/Gemfile ${SRC}/Gemfile
#
# DONE HACK WORKAROUNDS FOR APPLE SILICON

SHELL [ "zsh", "-ic" ]

ENTRYPOINT [ "zsh", "-ic" ]
# CMD tail -f /dev/null
CMD [ "./bin/dashboard-server" ]